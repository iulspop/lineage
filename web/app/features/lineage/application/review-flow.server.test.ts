import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewRecordStore } from "../domain/review"
import { reviewCore } from "../infrastructure/review-core.server"
import {
  completeReview,
  loadReview,
  loadReviewProgress,
  loadReviewPrompt,
  resolveReview,
} from "./review-flow.server"

const demoCorpus = {
  corpusId: "lineage-demo",
  format: "lineage.corpus" as const,
  formatVersion: 1 as const,
  prompts: [
    {
      challenge: ["What is the capital of France?"],
      id: "capital-of-france",
      resolution: ["What is the capital of France?", "Paris"],
      response: "text" as const,
      revision: 1,
      withheld: ["Paris"],
    },
    {
      challenge: ["Which planet is known as the Red Planet?"],
      id: "red-planet",
      resolution: ["Which planet is known as the Red Planet?", "Mars"],
      response: "text" as const,
      revision: 1,
      withheld: ["Mars"],
    },
  ],
}

function memorySnapshotStore(seedDemo = true): CorpusSnapshotStore {
  const snapshots = new Map<
    string,
    Awaited<ReturnType<CorpusSnapshotStore["latest"]>>
  >()
  const snapshot = {
    canonicalJson: JSON.stringify(demoCorpus),
    corpusId: demoCorpus.corpusId,
    digest: "demo-digest",
    formatVersion: demoCorpus.formatVersion,
  }
  if (seedDemo) snapshots.set(`user-1:${snapshot.corpusId}`, snapshot)
  return {
    async append(ownerId, value) {
      snapshots.set(`${ownerId}:${value.corpusId}`, value)
    },
    async find(ownerId, corpusId, digest) {
      const value = snapshots.get(`${ownerId}:${corpusId}`) ?? null
      return value?.digest === digest ? value : null
    },
    async latest(ownerId, corpusId) {
      return snapshots.get(`${ownerId}:${corpusId}`) ?? null
    },
    async listLatest(ownerId) {
      return [...snapshots.entries()]
        .filter(([key]) => key.startsWith(`${ownerId}:`))
        .map(([, value]) => value)
        .filter((value) => value !== null)
    },
  }
}

describe("review flow", () => {
  test("requires an explicitly imported owner corpus", async () => {
    await expect(
      loadReview({
        core: reviewCore,
        corpusId: demoCorpus.corpusId,
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
        snapshotStore: memorySnapshotStore(false),
        userId: "user-1",
      }),
    ).rejects.toThrow("The selected review corpus was not found")
  })

  test("loads a validated Prompt and preserves the disclosure boundary", async () => {
    const review = await loadReview({
      core: reviewCore,
      corpusId: demoCorpus.corpusId,
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
    })

    expect(review.presentation).toEqual(["What is the capital of France?"])
    expect(review.presentation).not.toContain("Paris")
    expect(review.prompt).not.toBeNull()
    if (!review.prompt) throw new Error("Expected a queued Prompt")

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

  test("given a submitted review context, should load only the exact owned snapshot and Prompt revision", async () => {
    const store = memorySnapshotStore()

    await expect(
      loadReviewPrompt({
        corpusId: demoCorpus.corpusId,
        promptId: "capital-of-france",
        promptRevision: 1,
        snapshotDigest: "demo-digest",
        snapshotStore: store,
        userId: "user-1",
      }),
    ).resolves.toMatchObject({ id: "capital-of-france", revision: 1 })
    await expect(
      loadReviewPrompt({
        corpusId: demoCorpus.corpusId,
        promptId: "red-planet",
        promptRevision: 2,
        snapshotDigest: "demo-digest",
        snapshotStore: store,
        userId: "user-1",
      }),
    ).resolves.toBeNull()
    await expect(
      loadReviewPrompt({
        corpusId: demoCorpus.corpusId,
        promptId: "capital-of-france",
        promptRevision: 1,
        snapshotDigest: "tampered-digest",
        snapshotStore: store,
        userId: "user-1",
      }),
    ).resolves.toBeNull()
    await expect(
      loadReviewPrompt({
        corpusId: demoCorpus.corpusId,
        promptId: "capital-of-france",
        promptRevision: 1,
        snapshotDigest: "demo-digest",
        snapshotStore: store,
        userId: "user-2",
      }),
    ).resolves.toBeNull()
  })

  test("selects the next unreviewed Prompt from corpus order", async () => {
    const store = memorySnapshotStore()
    const first = await loadReview({
      core: reviewCore,
      corpusId: demoCorpus.corpusId,
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
    })
    expect(first.prompt).not.toBeNull()
    if (!first.prompt) throw new Error("Expected the first queued Prompt")
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
      corpusId: demoCorpus.corpusId,
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
    })

    expect(next.prompt).not.toBeNull()
    if (!next.prompt) throw new Error("Expected the next queued Prompt")
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
      corpusId: demoCorpus.corpusId,
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
    })
    expect(review.prompt).not.toBeNull()
    if (!review.prompt) throw new Error("Expected a queued Prompt")
    const records: Parameters<ReviewRecordStore["append"]>[0][] = []

    const completed = await completeReview({
      assessment: "good",
      attempt: "Paris",
      core: reviewCore,
      corpusId: review.corpusId,
      prompt: review.prompt,
      reviewedAt: new Date("2026-08-26T12:00:00.000Z"),
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

    expect(completed).toMatchObject({
      assessment: "good",
      nextIntervalMinutes: 10,
    })
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      assessment: "good",
      attemptedResponse: "Paris",
      corpusId: "lineage-demo",
      fsrsDueAt: new Date("2026-08-26T12:10:00.000Z"),
      nextIntervalMinutes: 10,
      parameterSet:
        "sha256:68ec99cf2c9d3129f7e81f0ad77aaf08892e68417f3809d85c37442708dc6732",
      previousIntervalMinutes: 0,
      promptId: "capital-of-france",
      promptRevision: 1,
      reviewedAt: new Date("2026-08-26T12:00:00.000Z"),
      scheduler: "fsrs",
      schedulerImplementation: "ts-fsrs@5.4.1",
      schedulerProfile: "fsrs-6-default-r90-v1",
      schedulerVersion: "6",
      userId: "user-1",
    })
  })
})
