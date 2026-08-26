import type { ReviewContract } from "../domain/corpus"
import { responseDescriptor } from "../domain/corpus"
import type { ReviewAssessment, ReviewCore } from "../domain/review"
import api from "../generated/lineage-core.mjs"

type Eliminator<T> = (visitor: {
  just: (value: T) => T
  nothing: () => null
}) => T | null

type CoreContract = unknown
type ChallengeSession = unknown
type ResolutionSession = unknown

function contractFrom(document: ReviewContract): CoreContract {
  const raw = api.rawReviewContract(document.challenge)(document.resolution)(
    responseDescriptor(document),
  )(document.withheld)
  const contract = api.validateReviewContract(raw)({
    just: (value) => value,
    nothing: () => null,
  })
  if (!contract) throw new Error(`Invalid Lineage Prompt ${document.id}`)
  return contract
}

function resolveSession(
  contract: ReviewContract,
  attempt: string | null,
): ResolutionSession {
  const session = api.beginReview(contractFrom(contract)) as ChallengeSession
  return attempt
    ? api.submitResponse(attempt)(session)
    : api.revealResolution(session)
}

function optionalValue<T>(value: Eliminator<T>): T | null {
  return value({ just: (item) => item, nothing: () => null })
}

export const reviewCore: ReviewCore = {
  begin(contract) {
    return api.presentChallenge(api.beginReview(contractFrom(contract)))
  },
  complete(contract, attempt, assessment: ReviewAssessment) {
    const session = resolveSession(contract, attempt)
    const completed = api.recordAssessment(assessment)(session)
    return {
      assessment,
      attempt: optionalValue(api.capturedCompletedAttempt(completed)),
      presentation: api.presentCompleted(completed),
    }
  },
  resolve(contract, attempt) {
    const session = resolveSession(contract, attempt)
    return {
      attempt: optionalValue(api.capturedResolutionAttempt(session)),
      presentation: api.presentResolution(session),
    }
  },
}
