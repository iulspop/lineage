import { parseCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import { importCorpus } from "./import-corpus.server"

export class StaleCorpusSnapshotError extends Error {}

export async function updateMemoryStatus(input: {
  baseDigest: string
  corpusId: string
  ownerId: string
  promptId: string
  status: "active" | "suspended"
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  const snapshot = await input.store.latest(input.ownerId, input.corpusId)
  if (!snapshot) return null
  if (snapshot.digest !== input.baseDigest)
    throw new StaleCorpusSnapshotError(
      "This corpus changed while the memory was open. Reload before changing its status.",
    )

  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const promptIndex = document.prompts.findIndex(
    (prompt) => prompt.id === input.promptId,
  )
  if (promptIndex < 0) return null
  const prompt = document.prompts[promptIndex]
  if (!prompt) return null
  if (prompt.status === input.status)
    return { digest: snapshot.digest, document }

  document.prompts[promptIndex] = {
    ...prompt,
    revision: prompt.revision + 1,
    status: input.status,
  }
  return importCorpus({
    input: document,
    ownerId: input.ownerId,
    store: input.store,
    validator: input.validator,
  })
}
