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
  const snapshots = new Map<
    string,
    Awaited<ReturnType<CorpusSnapshotStore["latest"]>>
  >()
  return {
    async append(ownerId, value) {
      snapshots.set(`${ownerId}:${value.corpusId}`, value)
    },
    async latest(ownerId, corpusId) {
      return snapshots.get(`${ownerId}:${corpusId}`) ?? null
    },
  }
}

describe("review flow", () => {
  test("loads a validated Prompt and preserves the disclosure boundary", async () => {
    const review = await loadReview({
      core: reviewCore,
      reviewStore: {
        async append() {},
        async countForUser() {
          return 0
        },
        async latestForCorpus() {
          return []
        },
        async latestForPrompt() {
          return null
        },
        async recentForUser() {
          return []
        },
      },
      snapshotStore: memorySnapshotStore(),
      userId: "user-1",
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

  test("selects the next unreviewed Prompt from corpus order", async () => {
    const store = memorySnapshotStore()
    const first = await loadReview({
      core: reviewCore,
      reviewStore: {
        async append() {},
        async countForUser() {
          return 0
        },
        async latestForCorpus() {
          return []
        },
        async latestForPrompt() {
          return null
        },
        async recentForUser() {
          return []
        },
      },
      snapshotStore: store,
      userId: "user-1",
      validator: lineageRuntime,
    })
    const reviewedFirst = {
      assessment: "good" as const,
      attemptedResponse: "Paris",
      corpusId: first.corpusId,
      id: 1,
      nextIntervalMinutes: 1440,
      previousIntervalMinutes: 0,
      promptId: first.prompt.id,
      promptRevision: first.prompt.revision,
      reviewedAt: new Date("2026-08-26T00:00:00.000Z"),
      scheduler: "lineage-prototype",
      schedulerVersion: "1",
      userId: "user-1",
    }
    const next = await loadReview({
      core: reviewCore,
      reviewStore: {
        async append() {},
        async countForUser() {
          return 1
        },
        async latestForCorpus() {
          return [reviewedFirst]
        },
        async latestForPrompt() {
          return reviewedFirst
        },
        async recentForUser() {
          return [reviewedFirst]
        },
      },
      snapshotStore: store,
      userId: "user-1",
      validator: lineageRuntime,
    })

    expect(next.prompt.id).toBe("red-planet")
    expect(next.presentation).toEqual([
      "Which planet is known as the Red Planet?",
    ])
    expect(next.presentation).not.toContain("Mars")
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
        async latestForCorpus() {
          return [entry]
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
      reviewStore: {
        async append() {},
        async countForUser() {
          return 0
        },
        async latestForCorpus() {
          return []
        },
        async latestForPrompt() {
          return null
        },
        async recentForUser() {
          return []
        },
      },
      snapshotStore: memorySnapshotStore(),
      userId: "user-1",
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
        async latestForCorpus() {
          return []
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
