import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewRecordStore } from "../domain/review"
import { loadWorkspaceSummary } from "./workspace-summary.server"

const corpus = (corpusId: string) => ({
  canonicalJson: JSON.stringify({
    corpusId,
    format: "lineage.corpus",
    formatVersion: 1,
    prompts: [
      {
        challenge: ["Question"],
        id: `${corpusId}-prompt`,
        resolution: ["Answer"],
        response: { capture: "none", mode: "self-check" },
        revision: 1,
        withheld: ["Answer"],
      },
    ],
  }),
  corpusId,
  digest: `${corpusId}-digest`,
  formatVersion: 1,
})

describe("loadWorkspaceSummary", () => {
  test("given: a new and a future-scheduled memory, should: count only the new memory as due", async () => {
    const snapshotStore: CorpusSnapshotStore = {
      append: async () => undefined,
      find: async () => null,
      latest: async () => null,
      listLatest: async () => [corpus("new"), corpus("scheduled")],
    }
    const reviewStore: ReviewRecordStore = {
      append: async () => undefined,
      countForUser: async () => 1,
      latestForCorpus: async ({ corpusId }) =>
        corpusId === "scheduled"
          ? [
              {
                assessment: "good",
                attemptedResponse: null,
                corpusId,
                fsrsDueAt: new Date("2026-08-27T12:00:00.000Z"),
                id: 1,
                nextIntervalMinutes: 1440,
                previousIntervalMinutes: 0,
                promptId: "scheduled-prompt",
                promptRevision: 1,
                reviewedAt: new Date("2026-08-26T12:00:00.000Z"),
                scheduler: "fsrs",
                schedulerVersion: "6",
                userId: "user-id",
              },
            ]
          : [],
      latestForPrompt: async () => null,
      recentForUser: async () => [],
    }

    const summary = await loadWorkspaceSummary({
      now: new Date("2026-08-26T13:00:00.000Z"),
      ownerId: "user-id",
      reviewStore,
      snapshotStore,
    })

    expect(summary.dueCount).toBe(1)
    expect(summary.totalMemories).toBe(2)
    expect(summary.corpora).toEqual([
      { corpusId: "new", dueCount: 1, promptCount: 1 },
      { corpusId: "scheduled", dueCount: 0, promptCount: 1 },
    ])
  })
})
