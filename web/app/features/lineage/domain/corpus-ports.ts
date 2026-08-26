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
  append(snapshot: CorpusSnapshot): Promise<void>
  latest(corpusId: string): Promise<CorpusSnapshot | null>
}

export type ImportedCorpus = {
  document: CorpusDocument
  digest: string
}
