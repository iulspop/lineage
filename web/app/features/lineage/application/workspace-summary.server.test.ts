import { describe, expect, test } from "vitest"

import type { ReviewRecordStore } from "../domain/review"
import { loadWorkspaceSummary } from "./workspace-summary.server"

const snapshot = {
  canonicalJson: JSON.stringify({
    collections: [{ id: "math", title: "Mathematics" }],
    corpusId: "polypan",
    format: "lineage.corpus",
    formatVersion: 1,
    prompts: [
      {
        challenge: ["Question"],
        id: "prompt",
        resolution: ["Answer"],
        response: { capture: "none", mode: "self-check" },
        revision: 1,
        withheld: ["Answer"],
      },
    ],
    sources: [
      { content: "Source", id: "source", revision: 1, title: "Source" },
    ],
  }),
  corpusId: "polypan",
  digest: "digest",
  formatVersion: 1,
}

describe("loadWorkspaceSummary", () => {
  test("counts only the active workspace and excludes reviews from inactive workspaces", async () => {
    const reviewStore: ReviewRecordStore = {
      append: async () => undefined,
      countForUser: async () => 2,
      latestForCorpus: async () => [],
      latestForPrompt: async () => null,
      recentForUser: async () => [
        {
          assessment: "good",
          attemptedResponse: null,
          corpusId: "polypan",
          id: 1,
          nextIntervalMinutes: 10,
          previousIntervalMinutes: 0,
          promptId: "prompt",
          promptRevision: 1,
          reviewedAt: new Date("2026-08-27T12:00:00.000Z"),
          scheduler: "fsrs",
          schedulerVersion: "6",
          userId: "user-id",
        },
        {
          assessment: "again",
          attemptedResponse: null,
          corpusId: "archive",
          id: 2,
          nextIntervalMinutes: 1,
          previousIntervalMinutes: 0,
          promptId: "other",
          promptRevision: 1,
          reviewedAt: new Date("2026-08-27T11:00:00.000Z"),
          scheduler: "fsrs",
          schedulerVersion: "6",
          userId: "user-id",
        },
      ],
    }

    const summary = await loadWorkspaceSummary({
      now: new Date("2026-08-27T13:00:00.000Z"),
      ownerId: "user-id",
      resolveActive: async () => ({
        corpusId: "polypan",
        snapshot,
        status: "ready",
      }),
      reviewStore,
    })

    expect(summary.dueCount).toBe(1)
    expect(summary.totalMemories).toBe(1)
    expect(summary.workspace).toEqual({
      collectionCount: 1,
      corpusId: "polypan",
      sourceCount: 1,
    })
    expect(summary.recentReviews).toHaveLength(1)
  })
})
