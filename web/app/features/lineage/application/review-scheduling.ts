import type { ReviewAssessment, ReviewHistoryEntry } from "../domain/review"

export const REVIEW_SCHEDULER = "lineage-prototype"
export const REVIEW_SCHEDULER_VERSION = "1"

const initialIntervals: Record<ReviewAssessment, number> = {
  again: 1,
  easy: 4 * 24 * 60,
  good: 24 * 60,
  hard: 10,
}

const intervalMultipliers: Record<ReviewAssessment, number> = {
  again: 0,
  easy: 2.5,
  good: 2,
  hard: 1.2,
}

export function scheduleReview(
  assessment: ReviewAssessment,
  previous: ReviewHistoryEntry | null,
) {
  const previousIntervalMinutes = previous?.nextIntervalMinutes ?? 0
  const nextIntervalMinutes = previousIntervalMinutes
    ? Math.max(
        initialIntervals[assessment],
        Math.round(previousIntervalMinutes * intervalMultipliers[assessment]),
      )
    : initialIntervals[assessment]

  return {
    nextIntervalMinutes,
    previousIntervalMinutes,
    scheduler: REVIEW_SCHEDULER,
    schedulerVersion: REVIEW_SCHEDULER_VERSION,
  }
}

export function dueAt(review: ReviewHistoryEntry | null) {
  if (!review) return null
  return new Date(
    review.reviewedAt.getTime() + review.nextIntervalMinutes * 60_000,
  )
}

export function isDue(review: ReviewHistoryEntry | null, now = new Date()) {
  const due = dueAt(review)
  return !due || due <= now
}
