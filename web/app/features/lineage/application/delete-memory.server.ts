import { createId } from "@paralleldrive/cuid2"

import { parseCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import { importCorpus } from "./import-corpus.server"
import { StaleCorpusSnapshotError } from "./update-memory-status.server"

export const deletedMemoryRetentionDays = 30
export const deletedMemoryProvenanceNote = "lineage.memory-deleted/1"

const retentionMilliseconds = deletedMemoryRetentionDays * 24 * 60 * 60 * 1000

export function deletedAtForPrompt(
  document: ReturnType<typeof parseCorpusDocument>,
  promptId: string,
) {
  const prompt = document.prompts.find(({ id }) => id === promptId)
  if (prompt?.status !== "retired") return null

  const promptProvenance = new Set(prompt.provenance)
  const deletion = document.provenance
    .filter(
      (record) =>
        promptProvenance.has(record.id) &&
        record.note === deletedMemoryProvenanceNote,
    )
    .sort(
      (left, right) =>
        new Date(right.recordedAt).getTime() -
        new Date(left.recordedAt).getTime(),
    )[0]

  return deletion?.recordedAt ?? null
}

export function canRestoreDeletedMemory(deletedAt: string, now: Date) {
  const deletionTime = new Date(deletedAt).getTime()
  return (
    Number.isFinite(deletionTime) &&
    now.getTime() - deletionTime < retentionMilliseconds
  )
}

export function listRestorableDeletedMemories(
  document: ReturnType<typeof parseCorpusDocument>,
  now: Date,
) {
  return document.prompts.flatMap((prompt) => {
    const deletedAt = deletedAtForPrompt(document, prompt.id)
    if (!deletedAt || !canRestoreDeletedMemory(deletedAt, now)) return []
    const restoreUntil = new Date(
      new Date(deletedAt).getTime() + retentionMilliseconds,
    ).toISOString()
    return [{ deletedAt, prompt, restoreUntil }]
  })
}

export async function deleteMemory(input: {
  baseDigest: string
  corpusId: string
  now: Date
  ownerId: string
  promptId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  if (snapshot.digest !== input.baseDigest)
    throw new StaleCorpusSnapshotError(
      "This workspace changed while the memory was open. Reload before deleting it.",
    )

  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const promptIndex = document.prompts.findIndex(
    (prompt) => prompt.id === input.promptId,
  )
  const prompt = document.prompts[promptIndex]
  if (!prompt) return null
  if (prompt.status === "retired") return { digest: snapshot.digest, document }

  const provenanceId = createId()
  document.provenance.push({
    id: provenanceId,
    kind: "corrected",
    note: deletedMemoryProvenanceNote,
    recordedAt: input.now.toISOString(),
    sources: [],
  })
  document.prompts[promptIndex] = {
    ...prompt,
    provenance: [...prompt.provenance, provenanceId],
    revision: prompt.revision + 1,
    status: "retired",
  }

  return importCorpus({
    input: document,
    ownerId: input.ownerId,
    store: input.store,
    validator: input.validator,
  })
}

export async function restoreDeletedMemory(input: {
  baseDigest: string
  corpusId: string
  now: Date
  ownerId: string
  promptId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  if (snapshot.digest !== input.baseDigest)
    throw new StaleCorpusSnapshotError(
      "This workspace changed while the deleted memory was open. Reload before restoring it.",
    )

  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const promptIndex = document.prompts.findIndex(
    (prompt) => prompt.id === input.promptId,
  )
  const prompt = document.prompts[promptIndex]
  if (!prompt) return null
  const deletedAt = deletedAtForPrompt(document, prompt.id)
  if (!deletedAt || !canRestoreDeletedMemory(deletedAt, input.now)) return null

  document.prompts[promptIndex] = {
    ...prompt,
    revision: prompt.revision + 1,
    status: "active",
  }

  return importCorpus({
    input: document,
    ownerId: input.ownerId,
    store: input.store,
    validator: input.validator,
  })
}
