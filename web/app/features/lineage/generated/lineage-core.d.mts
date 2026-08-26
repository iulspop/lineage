type Eliminator<T> = (visitor: {
  just: (value: T) => T
  nothing: () => null
}) => T | null

type RawReviewContract = unknown
type ReviewContract = unknown
type ChallengeSession = unknown
type ResolutionSession = unknown
type CompletedSession = unknown

type LineageApi = {
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
