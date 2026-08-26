import { describe, expect, test } from "vitest"

import type { ReviewHistoryEntry } from "../domain/review"
import { dueAt, isDue, scheduleReview } from "./review-scheduling"

const previous: ReviewHistoryEntry = {
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

describe("review scheduling projection", () => {
  test("records the scheduler transition used for the next interval", () => {
    expect(scheduleReview("easy", previous)).toEqual({
      nextIntervalMinutes: 5760,
      previousIntervalMinutes: 1440,
      scheduler: "lineage-prototype",
      schedulerVersion: "1",
    })
  })

  test("derives due state from durable review facts", () => {
    expect(dueAt(previous)?.toISOString()).toBe("2026-08-21T00:00:00.000Z")
    expect(isDue(previous, new Date("2026-08-20T23:59:00.000Z"))).toBe(false)
    expect(isDue(previous, new Date("2026-08-21T00:00:00.000Z"))).toBe(true)
  })
})
