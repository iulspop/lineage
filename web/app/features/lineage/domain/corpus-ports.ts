import type { CorpusDocument, ReviewContract } from "./corpus"

export type ReviewContractValidator = {
  isValid(contract: ReviewContract): boolean
}

export type CorpusSnapshot = {
  canonicalJson: string
  corpusId: string
  digest: string
  formatVersion: number
}

export type CorpusSnapshotStore = {
  append(ownerId: string, snapshot: CorpusSnapshot): Promise<void>
  find(
    ownerId: string,
    corpusId: string,
    digest: string,
  ): Promise<CorpusSnapshot | null>
  latest(ownerId: string, corpusId: string): Promise<CorpusSnapshot | null>
  listLatest(ownerId: string): Promise<CorpusSnapshot[]>
}

export type ImportedCorpus = {
  document: CorpusDocument
  digest: string
}
