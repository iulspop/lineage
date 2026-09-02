import { createHash } from "node:crypto"
import {
  parseCorpusDocument,
  serializeCorpusDocument,
} from "@lineage/core/corpus"
import { createId } from "@paralleldrive/cuid2"

import type { CreateMemoriesRequest } from "../domain/memory-api"
import { parseClozeText } from "../domain/memory-api"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import { draftToPrompt } from "~/features/lineage/application/manual-memory-draft"
import type {
  CorpusDocument,
  ReviewContract,
} from "~/features/lineage/domain/corpus"
import type {
  OptimisticCorpusSnapshotStore,
  ReviewContractValidator,
} from "~/features/lineage/domain/corpus-ports"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { prisma } from "~/utils/db.server"

const MAX_CONFLICT_RETRIES = 2

export class IntegrationWorkspaceUnavailableError extends Error {}
export class IntegrationMemoryConflictError extends Error {}
export class IntegrationMemoryValidationError extends Error {
  constructor(readonly diagnostics: unknown[]) {
    super("Integration Memory creation failed authoritative validation")
  }
}

export type CreatedMemory = {
  itemIndex: number
  kind: "basic" | "cloze"
  promptId: string
  targetIndex?: number
}

type Dependencies = {
  resolveActive: typeof resolveActiveCorpus
  snapshotStore: OptimisticCorpusSnapshotStore
  validator: ReviewContractValidator
}

const defaultDependencies: Dependencies = {
  resolveActive: resolveActiveCorpus,
  snapshotStore: corpusSnapshotStore,
  validator: lineageRuntime,
}

function createPrompts(request: CreateMemoriesRequest) {
  const created: CreatedMemory[] = []
  const prompts: ReviewContract[] = []
  for (const [itemIndex, item] of request.items.entries()) {
    if (item.kind === "basic") {
      const promptId = createId()
      const prompt = draftToPrompt({
        answer: item.answer,
        challenge: item.hint
          ? `${item.challenge}\nHint: ${item.hint}`
          : item.challenge,
        corpusId: "unused",
        kind: "basic",
        promptId,
        responseMode: item.responseMode,
      })
      prompts.push(prompt)
      created.push({ itemIndex, kind: "basic", promptId })
      continue
    }

    const parsed = parseClozeText(item.text)
    if (!parsed.valid) throw new Error(parsed.message)
    for (const target of parsed.targets) {
      const promptId = createId()
      prompts.push(
        draftToPrompt({
          answer: target.answer,
          challenge: target.challenge,
          clozeTargetId: createId(),
          corpusId: "unused",
          kind: "cloze",
          promptId,
          responseMode: item.responseMode,
        }),
      )
      created.push({
        itemIndex,
        kind: "cloze",
        promptId,
        targetIndex: target.targetIndex,
      })
    }
  }
  return { created, prompts }
}

function candidateDocument({
  base,
  clientId,
  prompts,
  requestId,
}: {
  base: CorpusDocument
  clientId: string
  prompts: ReviewContract[]
  requestId: string
}) {
  const provenanceId = createId()
  return {
    ...base,
    prompts: [
      ...base.prompts,
      ...prompts.map((prompt) => ({
        ...prompt,
        provenance: [...(prompt.provenance ?? []), provenanceId],
      })),
    ],
    provenance: [
      ...base.provenance,
      {
        agent: `integration:${clientId}`,
        id: provenanceId,
        kind: "authored" as const,
        note: `Integration request ${requestId}`,
        recordedAt: new Date().toISOString(),
        sources: [],
      },
    ],
  }
}

export async function createIntegrationMemories({
  clientId,
  clientDatabaseId,
  dependencies = defaultDependencies,
  grantId,
  request,
  requestId,
  userId,
}: {
  clientId: string
  clientDatabaseId: string
  dependencies?: Dependencies
  grantId: string
  request: CreateMemoriesRequest
  requestId: string
  userId: string
}) {
  const generated = createPrompts(request)
  let lastCorpusId: string | null = null
  let lastPriorDigest: string | null = null

  for (let attempt = 0; attempt <= MAX_CONFLICT_RETRIES; attempt += 1) {
    const active = await dependencies.resolveActive(userId)
    if (active.status === "empty")
      throw new IntegrationWorkspaceUnavailableError()
    lastCorpusId = active.corpusId
    lastPriorDigest = active.snapshot.digest
    const base = parseCorpusDocument(JSON.parse(active.snapshot.canonicalJson))
    const candidate = candidateDocument({
      base,
      clientId,
      prompts: generated.prompts,
      requestId,
    })
    const validation = dependencies.validator.validateCorpus?.(candidate)
    if (!validation?.valid)
      throw new IntegrationMemoryValidationError(validation?.diagnostics ?? [])

    const canonicalJson = serializeCorpusDocument(validation.document)
    const newDigest = createHash("sha256").update(canonicalJson).digest("hex")
    const append = await dependencies.snapshotStore.compareAndAppend(
      userId,
      { corpusId: active.corpusId, digest: active.snapshot.digest },
      {
        canonicalJson,
        corpusId: active.corpusId,
        digest: newDigest,
        formatVersion: validation.document.formatVersion,
      },
    )
    if (append.status === "conflict") continue

    await prisma.integrationCreationAudit.create({
      data: {
        clientId: clientDatabaseId,
        corpusId: active.corpusId,
        createdPromptCount: generated.created.length,
        grantId,
        itemCount: request.items.length,
        newDigest,
        outcome: "created",
        priorDigest: active.snapshot.digest,
        requestId,
        userId,
      },
    })
    return {
      corpusId: active.corpusId,
      created: generated.created,
      newDigest,
      priorDigest: active.snapshot.digest,
      requestId,
    }
  }

  await prisma.integrationCreationAudit.create({
    data: {
      clientId: clientDatabaseId,
      corpusId: lastCorpusId,
      createdPromptCount: 0,
      grantId,
      itemCount: request.items.length,
      outcome: "conflict",
      priorDigest: lastPriorDigest,
      requestId,
      userId,
    },
  })
  throw new IntegrationMemoryConflictError()
}
