import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewRecordStore } from "../domain/review"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { reviewCore } from "../infrastructure/review-core.server"
import { completeReview, loadReview, resolveReview } from "./review-flow.server"

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
      },
      userId: "user-1",
    })

    expect(completed.assessment).toBe("good")
    expect(records).toEqual([
      {
        assessment: "good",
        attemptedResponse: "Paris",
        corpusId: "lineage-demo",
        promptId: "capital-of-france",
        promptRevision: 1,
        userId: "user-1",
      },
    ])
  })
})
