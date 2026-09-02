import type {
  CorpusDocument,
  CorpusValidationResult,
  ReviewContract,
} from "./corpus"

export type ReviewContractValidator = {
  isValid(contract: ReviewContract): boolean
  validateCorpus?(input: unknown): CorpusValidationResult
}

export type CorpusSnapshot = {
  canonicalJson: string
  corpusId: string
  digest: string
  formatVersion: number
}

export type OptimisticAppendResult =
  | { status: "appended" | "deduplicated" }
  | { status: "conflict"; reason: "active-corpus-changed" | "snapshot-changed" }

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

export type OptimisticCorpusSnapshotStore = CorpusSnapshotStore & {
  compareAndAppend(
    ownerId: string,
    expectedBase: { corpusId: string; digest: string },
    snapshot: CorpusSnapshot,
  ): Promise<OptimisticAppendResult>
}

export type ActiveCorpusPreferenceStore = {
  getActiveCorpusId(ownerId: string): Promise<string | null>
  listCorpusIdsByRecentActivity(ownerId: string): Promise<string[]>
  setActiveCorpusId(ownerId: string, corpusId: string): Promise<void>
}

export type ImportedCorpus = {
  document: CorpusDocument
  digest: string
}
