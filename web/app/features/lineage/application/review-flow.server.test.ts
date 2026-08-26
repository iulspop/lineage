import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewRecordStore } from "../domain/review"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { reviewCore } from "../infrastructure/review-core.server"
import {
  completeReview,
  loadReview,
  loadReviewProgress,
  resolveReview,
} from "./review-flow.server"

function memorySnapshotStore(): CorpusSnapshotStore {
  let snapshot: Awaited<ReturnType<CorpusSnapshotStore["latest"]>> = null
  return {
    async append(value) {
      snapshot = value
    },
    async latest() {
      return snapshot
    },
  }
}

describe("review flow", () => {
  test("loads a validated Prompt and preserves the disclosure boundary", async () => {
    const review = await loadReview({
      core: reviewCore,
      snapshotStore: memorySnapshotStore(),
      validator: lineageRuntime,
    })

    expect(review.presentation).toEqual(["What is the capital of France?"])
    expect(review.presentation).not.toContain("Paris")

    const resolution = resolveReview({
      attempt: "Paris",
      core: reviewCore,
      prompt: review.prompt,
    })
    expect(resolution).toEqual({
      attempt: "Paris",
      presentation: ["What is the capital of France?", "Paris"],
    })
  })

  test("derives queue status and recent history from durable reviews", async () => {
    const reviewedAt = new Date("2020-08-26T00:00:00.000Z")
    const entry = {
      assessment: "good" as const,
      attemptedResponse: "Paris",
      corpusId: "lineage-demo",
      id: 1,
      nextIntervalMinutes: 1440,
      previousIntervalMinutes: 0,
      promptId: "capital-of-france",
      promptRevision: 1,
      reviewedAt,
      scheduler: "lineage-prototype",
      schedulerVersion: "1",
      userId: "user-1",
    }
    const progress = await loadReviewProgress({
      corpusId: entry.corpusId,
      promptId: entry.promptId,
      store: {
        async append() {},
        async countForUser() {
          return 1
        },
        async latestForPrompt() {
          return entry
        },
        async recentForUser() {
          return [entry]
        },
      },
      userId: entry.userId,
    })

    expect(progress).toMatchObject({
      due: true,
      dueAt: "2020-08-27T00:00:00.000Z",
      reviewCount: 1,
    })
    expect(progress.history[0]).toMatchObject({
      assessment: "good",
      nextIntervalMinutes: 1440,
      reviewedAt: "2020-08-26T00:00:00.000Z",
    })
  })

  test("records a completed review as a durable event", async () => {
    const review = await loadReview({
      core: reviewCore,
      snapshotStore: memorySnapshotStore(),
      validator: lineageRuntime,
    })
    const records: Parameters<ReviewRecordStore["append"]>[0][] = []

    const completed = await completeReview({
      assessment: "good",
      attempt: "Paris",
      core: reviewCore,
      corpusId: review.corpusId,
      prompt: review.prompt,
      store: {
        async append(record) {
          records.push(record)
        },
        async countForUser() {
          return records.length
        },
        async latestForPrompt() {
          return null
        },
        async recentForUser() {
          return []
        },
      },
      userId: "user-1",
    })

    expect(completed.assessment).toBe("good")
    expect(records).toEqual([
      {
        assessment: "good",
        attemptedResponse: "Paris",
        corpusId: "lineage-demo",
        nextIntervalMinutes: 1440,
        previousIntervalMinutes: 0,
        promptId: "capital-of-france",
        promptRevision: 1,
        scheduler: "lineage-prototype",
        schedulerVersion: "1",
        userId: "user-1",
      },
    ])
  })
})
