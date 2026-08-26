type Eliminator<T> = (visitor: {
  just: (value: T) => T
  nothing: () => null
}) => T | null

type RawReviewContract = unknown
type ReviewContract = unknown
type ChallengeSession = unknown
type ResolutionSession = unknown
type CompletedSession = unknown

type AgdaValue = unknown
type AgdaConstructor = (value: unknown) => AgdaValue

type LineageApi = {
  formatDescription: unknown
  some: (erased: unknown) => AgdaConstructor
  none: AgdaConstructor
  promptKind: AgdaConstructor
  lifecycle: AgdaConstructor
  requirementLevel: AgdaConstructor
  relationshipKind: AgdaConstructor
  repetitionRating: AgdaConstructor
  provenanceKind: AgdaConstructor
  conversionStatus: AgdaConstructor
  responseInteraction: AgdaConstructor
  disclosureContains: (wanted: string) => (content: string) => boolean
  entityReference: AgdaConstructor
  extensionSet: AgdaConstructor
  normalizedPoint: AgdaConstructor
  rectangleGeometry: AgdaConstructor
  polygonGeometry: AgdaConstructor
  rectangleGeometryValue: AgdaConstructor
  polygonGeometryValue: AgdaConstructor
  assetReference: AgdaConstructor
  clozeTarget: AgdaConstructor
  occlusionRegion: AgdaConstructor
  sourceRevision: AgdaConstructor
  materialRevision: AgdaConstructor
  prompt: AgdaConstructor
  schedulerObservation: AgdaConstructor
  repetition: AgdaConstructor
  repetitionCorrection: AgdaConstructor
  relationship: AgdaConstructor
  provenanceRecord: AgdaConstructor
  extensionDeclaration: AgdaConstructor
  migrationRecord: AgdaConstructor
  interoperabilityReport: AgdaConstructor
  corpusDocument: AgdaConstructor
  validateCorpus: (document: AgdaValue) => AgdaValue[]
  isValidCorpus: (document: AgdaValue) => boolean
  rawReviewContract: (
    challenge: string[],
  ) => (
    resolution: string[],
  ) => (response: string) => (withheld: string[]) => RawReviewContract
  isValidReviewContract: (raw: RawReviewContract) => boolean
  validateReviewContract: (raw: RawReviewContract) => Eliminator<ReviewContract>
  beginReview: (contract: ReviewContract) => ChallengeSession
  submitResponse: (
    response: string,
  ) => (session: ChallengeSession) => ResolutionSession
  revealResolution: (session: ChallengeSession) => ResolutionSession
  recordAssessment: (
    assessment: string,
  ) => (session: ResolutionSession) => CompletedSession
  presentChallenge: (session: ChallengeSession) => string[]
  presentResolution: (session: ResolutionSession) => string[]
  presentCompleted: (session: CompletedSession) => string[]
  capturedResolutionAttempt: (session: ResolutionSession) => Eliminator<string>
  capturedCompletedAttempt: (session: CompletedSession) => Eliminator<string>
}

declare const api: LineageApi
export default api
