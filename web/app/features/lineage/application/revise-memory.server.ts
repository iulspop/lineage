import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import { parseCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import { validateCorpusCandidate } from "./author-corpus.server"
import { importCorpus } from "./import-corpus.server"
import type { ManualMemoryDraft } from "./manual-memory-draft"
import { draftToPrompt } from "./manual-memory-draft"
import { StaleCorpusSnapshotError } from "./update-memory-status.server"

export type MemoryRevisionPreview = {
  baseDigest: string
  canonicalJson: string
  changedFields: string[]
  document: CorpusDocument
  nextRevision: number
}

function changedFields(
  current: CorpusDocument["prompts"][number],
  next: CorpusDocument["prompts"][number],
) {
  return [
    "challenge",
    "withheld",
    "resolution",
    "response",
    "kind",
    "clozeTargets",
  ].filter(
    (field) =>
      JSON.stringify(current[field as keyof typeof current]) !==
      JSON.stringify(next[field as keyof typeof next]),
  )
}

export async function previewMemoryRevision(input: {
  baseDigest: string
  corpusId: string
  draft: ManualMemoryDraft
  ownerId: string
  promptId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}): Promise<
  | { diagnostics: LineageDiagnostic[]; valid: false }
  | { preview: MemoryRevisionPreview; valid: true }
  | null
> {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  if (snapshot.digest !== input.baseDigest)
    throw new StaleCorpusSnapshotError(
      "This corpus changed while the memory was open. Reload before previewing your revision.",
    )

  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const promptIndex = document.prompts.findIndex(
    (prompt) => prompt.id === input.promptId,
  )
  const current = document.prompts[promptIndex]
  if (!current) return null

  const drafted = draftToPrompt({
    ...input.draft,
    corpusId: input.corpusId,
    promptId: input.promptId,
  })
  const next = {
    ...current,
    ...drafted,
    id: current.id,
    revision: current.revision + 1,
    status: current.status,
  }
  const candidate = {
    ...document,
    collectionMemberships: [
      ...document.collectionMemberships.filter(
        ({ promptId }) => promptId !== input.promptId,
      ),
      ...(input.draft.collectionIds ?? []).map((collectionId) => ({
        collectionId,
        promptId: input.promptId,
      })),
    ],
    prompts: document.prompts.map((prompt, index) =>
      index === promptIndex ? next : prompt,
    ),
  }
  const validation = validateCorpusCandidate({
    candidateJson: JSON.stringify(candidate),
    maxRepairs: 0,
    validator: input.validator,
  })
  if (!validation.valid) return validation

  return {
    preview: {
      baseDigest: input.baseDigest,
      canonicalJson: validation.preview.canonicalJson,
      changedFields: changedFields(
        current,
        validation.preview.document.prompts[promptIndex]!,
      ),
      document: validation.preview.document,
      nextRevision: current.revision + 1,
    },
    valid: true,
  }
}

export async function acceptMemoryRevision(input: {
  baseDigest: string
  candidateJson: string
  corpusId: string
  ownerId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  if (snapshot.digest !== input.baseDigest)
    throw new StaleCorpusSnapshotError(
      "This corpus changed after the preview. Reload and review the latest version before saving.",
    )
  return importCorpus({
    input: JSON.parse(input.candidateJson),
    ownerId: input.ownerId,
    store: input.store,
    validator: input.validator,
  })
}
