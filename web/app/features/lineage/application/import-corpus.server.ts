import { createHash } from "node:crypto"

import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import { parseCorpusDocument, serializeCorpusDocument } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ImportedCorpus,
  ReviewContractValidator,
} from "../domain/corpus-ports"

export class InvalidCorpusError extends Error {
  constructor(readonly diagnostics: LineageDiagnostic[]) {
    super(
      diagnostics.length === 1
        ? diagnostics[0]?.message
        : `Corpus validation failed with ${diagnostics.length} diagnostics`,
    )
  }
}

export class InvalidReviewContractError extends InvalidCorpusError {
  constructor(readonly promptId: string) {
    super([
      {
        code: "structure.invalid",
        message: `Prompt ${promptId} violates the Lineage review-contract semantics`,
        path: "/prompts",
        severity: "error",
      },
    ])
  }
}

export async function importCorpus({
  input,
  ownerId,
  store,
  validator,
}: {
  input: unknown
  ownerId: string
  store: CorpusSnapshotStore
  validator: ReviewContractValidator
}): Promise<ImportedCorpus> {
  const validation = validator.validateCorpus?.(input)
  if (validation && !validation.valid)
    throw new InvalidCorpusError(validation.diagnostics)

  const document = validation?.valid
    ? validation.document
    : parseCorpusDocument(input)
  if (!validation) {
    for (const prompt of document.prompts) {
      if (!validator.isValid(prompt))
        throw new InvalidReviewContractError(prompt.id)
    }
  }
  const canonicalJson = serializeCorpusDocument(document)
  const digest = createHash("sha256").update(canonicalJson).digest("hex")
  await store.append(ownerId, {
    canonicalJson,
    corpusId: document.corpusId,
    digest,
    formatVersion: document.formatVersion,
  })
  return { digest, document }
}

export async function exportCorpus({
  corpusId,
  ownerId,
  store,
}: {
  corpusId: string
  ownerId: string
  store: CorpusSnapshotStore
}): Promise<CorpusDocument | null> {
  const snapshot = await store.latest(ownerId, corpusId)
  return snapshot
    ? parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
    : null
}
