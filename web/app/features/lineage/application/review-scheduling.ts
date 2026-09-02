import type { RecallHistoryState } from "@lineage/core/scheduling"
import {
  FSRS6_IDENTITY,
  FSRS6_PARAMETERS,
  fsrs6,
} from "@lineage/core/scheduling"

import type { ReviewAssessment, ReviewHistoryEntry } from "../domain/review"

export const REVIEW_SCHEDULER = FSRS6_IDENTITY.family
export const REVIEW_SCHEDULER_VERSION = FSRS6_IDENTITY.version
export const REVIEW_SCHEDULER_IMPLEMENTATION = FSRS6_IDENTITY.implementation
export const REVIEW_SCHEDULER_PROFILE = FSRS6_IDENTITY.profile
export const REVIEW_PARAMETER_SET = FSRS6_IDENTITY.parameterSet
export const REVIEW_PARAMETERS = FSRS6_PARAMETERS

const policy = fsrs6()

export function toRecallHistoryState(
  previous: ReviewHistoryEntry,
): RecallHistoryState
export function toRecallHistoryState(previous: null): null
export function toRecallHistoryState(
  previous: ReviewHistoryEntry | null,
): RecallHistoryState | null
export function toRecallHistoryState(
  previous: ReviewHistoryEntry | null,
): RecallHistoryState | null {
  if (!previous) return null
  return {
    difficulty: previous.fsrsDifficulty,
    dueAt: previous.fsrsDueAt,
    elapsedDays: previous.fsrsElapsedDays,
    lapses: previous.fsrsLapses,
    lastReviewedAt: previous.reviewedAt,
    learningSteps: previous.fsrsLearningSteps,
    nextIntervalMinutes: previous.nextIntervalMinutes,
    reps: previous.fsrsReps,
    scheduledDays: previous.fsrsScheduledDays,
    scheduler: previous.scheduler,
    stability: previous.fsrsStability,
    state: previous.fsrsState,
  }
}

export function previewReview(
  previous: ReviewHistoryEntry | null,
  reviewedAt: Date,
) {
  return policy.preview(toRecallHistoryState(previous), reviewedAt)
}

export function scheduleReview(
  assessment: ReviewAssessment,
  previous: ReviewHistoryEntry | null,
  reviewedAt: Date,
) {
  const transition = policy.transition(
    assessment,
    toRecallHistoryState(previous),
    reviewedAt,
  )
  return {
    fsrsDifficulty: transition.difficulty,
    fsrsDueAt: transition.dueAt,
    fsrsElapsedDays: transition.elapsedDays,
    fsrsLapses: transition.lapses,
    fsrsLearningSteps: transition.learningSteps,
    fsrsReps: transition.reps,
    fsrsScheduledDays: transition.scheduledDays,
    fsrsStability: transition.stability,
    fsrsState: transition.state,
    nextIntervalMinutes: transition.nextIntervalMinutes,
    parameterSet: transition.parameterSet,
    previousIntervalMinutes: transition.previousIntervalMinutes,
    scheduler: transition.family,
    schedulerImplementation: transition.implementation,
    schedulerProfile: transition.profile,
    schedulerVersion: transition.version,
  }
}

export function dueAt(review: ReviewHistoryEntry | null) {
  return policy.dueAt(toRecallHistoryState(review))
}

export function isDue(review: ReviewHistoryEntry | null, now = new Date()) {
  return policy.isDue(toRecallHistoryState(review), now)
}
