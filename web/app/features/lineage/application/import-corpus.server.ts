import { createHash } from "node:crypto"

import type { CorpusDocument } from "../domain/corpus"
import { parseCorpusDocument, serializeCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ImportedCorpus,
  ReviewContractValidator,
} from "../domain/corpus-ports"

export class InvalidReviewContractError extends Error {
  constructor(readonly promptId: string) {
    super(`Prompt ${promptId} violates the Lineage review-contract semantics`)
  }
}

export async function importCorpus({
  input,
  store,
  validator,
}: {
  input: unknown
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}): Promise<ImportedCorpus> {
  const document = parseCorpusDocument(input)
  for (const prompt of document.prompts) {
    if (!validator.isValid(prompt))
      throw new InvalidReviewContractError(prompt.id)
  }

  const canonicalJson = serializeCorpusDocument(document)
  const digest = createHash("sha256").update(canonicalJson).digest("hex")
  await store.append({
    canonicalJson,
    corpusId: document.corpusId,
    digest,
    formatVersion: document.formatVersion,
  })
  return { digest, document }
}

export async function exportCorpus({
  corpusId,
  store,
}: {
  corpusId: string
  store: CorpusSnapshotStore
}): Promise<CorpusDocument | null> {
  const snapshot = await store.latest(corpusId)
  return snapshot
    ? parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
    : null
}
