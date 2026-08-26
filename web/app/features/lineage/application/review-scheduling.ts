import type { Card, Grade, State } from "ts-fsrs"
import { createEmptyCard, fsrs, generatorParameters, Rating } from "ts-fsrs"

import type { ReviewAssessment, ReviewHistoryEntry } from "../domain/review"

export const REVIEW_SCHEDULER = "fsrs"
export const REVIEW_SCHEDULER_VERSION = "6"
export const REVIEW_SCHEDULER_IMPLEMENTATION = "ts-fsrs@5.4.1"
export const REVIEW_SCHEDULER_PROFILE = "fsrs-6-default-r90-v1"
export const REVIEW_PARAMETER_SET =
  "sha256:68ec99cf2c9d3129f7e81f0ad77aaf08892e68417f3809d85c37442708dc6732"

export const REVIEW_PARAMETERS = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ["1m", "10m"],
  maximum_interval: 36_500,
  relearning_steps: ["10m"],
  request_retention: 0.9,
})

const scheduler = fsrs(REVIEW_PARAMETERS)

const ratings: Record<ReviewAssessment, Grade> = {
  again: Rating.Again,
  easy: Rating.Easy,
  good: Rating.Good,
  hard: Rating.Hard,
}

function previousCard(previous: ReviewHistoryEntry | null, now: Date): Card {
  if (
    previous?.scheduler === REVIEW_SCHEDULER &&
    previous.fsrsDueAt &&
    previous.fsrsState != null &&
    previous.fsrsStability != null &&
    previous.fsrsDifficulty != null &&
    previous.fsrsElapsedDays != null &&
    previous.fsrsScheduledDays != null &&
    previous.fsrsLearningSteps != null &&
    previous.fsrsReps != null &&
    previous.fsrsLapses != null
  ) {
    return {
      difficulty: previous.fsrsDifficulty,
      due: previous.fsrsDueAt,
      elapsed_days: previous.fsrsElapsedDays,
      lapses: previous.fsrsLapses,
      last_review: previous.reviewedAt,
      learning_steps: previous.fsrsLearningSteps,
      reps: previous.fsrsReps,
      scheduled_days: previous.fsrsScheduledDays,
      stability: previous.fsrsStability,
      state: previous.fsrsState as State,
    }
  }

  return createEmptyCard(now)
}

function intervalMinutes(due: Date, reviewedAt: Date) {
  return Math.max(
    1,
    Math.round((due.getTime() - reviewedAt.getTime()) / 60_000),
  )
}

export function previewReview(
  previous: ReviewHistoryEntry | null,
  reviewedAt: Date,
) {
  const preview = scheduler.repeat(
    previousCard(previous, reviewedAt),
    reviewedAt,
  )
  return {
    again: intervalMinutes(preview[Rating.Again].card.due, reviewedAt),
    easy: intervalMinutes(preview[Rating.Easy].card.due, reviewedAt),
    good: intervalMinutes(preview[Rating.Good].card.due, reviewedAt),
    hard: intervalMinutes(preview[Rating.Hard].card.due, reviewedAt),
  } satisfies Record<ReviewAssessment, number>
}

export function scheduleReview(
  assessment: ReviewAssessment,
  previous: ReviewHistoryEntry | null,
  reviewedAt: Date,
) {
  const result = scheduler.next(
    previousCard(previous, reviewedAt),
    reviewedAt,
    ratings[assessment],
  )
  const card = result.card

  return {
    fsrsDifficulty: card.difficulty,
    fsrsDueAt: card.due,
    fsrsElapsedDays: card.elapsed_days,
    fsrsLapses: card.lapses,
    fsrsLearningSteps: card.learning_steps,
    fsrsReps: card.reps,
    fsrsScheduledDays: card.scheduled_days,
    fsrsStability: card.stability,
    fsrsState: card.state,
    nextIntervalMinutes: intervalMinutes(card.due, reviewedAt),
    parameterSet: REVIEW_PARAMETER_SET,
    previousIntervalMinutes: previous?.nextIntervalMinutes ?? 0,
    scheduler: REVIEW_SCHEDULER,
    schedulerImplementation: REVIEW_SCHEDULER_IMPLEMENTATION,
    schedulerProfile: REVIEW_SCHEDULER_PROFILE,
    schedulerVersion: REVIEW_SCHEDULER_VERSION,
  }
}

export function dueAt(review: ReviewHistoryEntry | null) {
  if (!review) return null
  return (
    review.fsrsDueAt ??
    new Date(review.reviewedAt.getTime() + review.nextIntervalMinutes * 60_000)
  )
}

export function isDue(review: ReviewHistoryEntry | null, now = new Date()) {
  const due = dueAt(review)
  return !due || due <= now
}
