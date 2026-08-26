import { describe, expect, test } from "vitest"

import type { ReviewHistoryEntry } from "../domain/review"
import {
  dueAt,
  isDue,
  previewReview,
  REVIEW_PARAMETER_SET,
  REVIEW_SCHEDULER,
  REVIEW_SCHEDULER_IMPLEMENTATION,
  REVIEW_SCHEDULER_PROFILE,
  REVIEW_SCHEDULER_VERSION,
  scheduleReview,
} from "./review-scheduling"

const reviewedAt = new Date("2026-08-26T12:00:00.000Z")

const legacyReview: ReviewHistoryEntry = {
  assessment: "good",
  attemptedResponse: "Paris",
  corpusId: "lineage-demo",
  id: 1,
  nextIntervalMinutes: 1440,
  previousIntervalMinutes: 0,
  promptId: "capital-of-france",
  promptRevision: 1,
  reviewedAt: new Date("2026-08-20T00:00:00.000Z"),
  scheduler: "lineage-prototype",
  schedulerVersion: "1",
  userId: "user-1",
}

describe("FSRS review scheduling projection", () => {
  test("previews all four ratings from the same card state", () => {
    expect(previewReview(null, reviewedAt)).toEqual({
      again: 1,
      easy: 8640,
      good: 10,
      hard: 6,
    })
  })

  test("records the complete FSRS transition used for the next review", () => {
    expect(scheduleReview("easy", null, reviewedAt)).toMatchObject({
      fsrsDifficulty: 1,
      fsrsDueAt: new Date("2026-09-01T12:00:00.000Z"),
      fsrsElapsedDays: 0,
      fsrsLapses: 0,
      fsrsLearningSteps: 0,
      fsrsReps: 1,
      fsrsScheduledDays: 6,
      fsrsState: 2,
      nextIntervalMinutes: 8640,
      parameterSet: REVIEW_PARAMETER_SET,
      previousIntervalMinutes: 0,
      scheduler: REVIEW_SCHEDULER,
      schedulerImplementation: REVIEW_SCHEDULER_IMPLEMENTATION,
      schedulerProfile: REVIEW_SCHEDULER_PROFILE,
      schedulerVersion: REVIEW_SCHEDULER_VERSION,
    })
  })

  test("derives legacy due state while old history is migrated by replay", () => {
    expect(dueAt(legacyReview)?.toISOString()).toBe("2026-08-21T00:00:00.000Z")
    expect(isDue(legacyReview, new Date("2026-08-20T23:59:00.000Z"))).toBe(
      false,
    )
    expect(isDue(legacyReview, new Date("2026-08-21T00:00:00.000Z"))).toBe(true)
  })
})
