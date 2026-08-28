import { describe, expect, test } from "vitest"

import { parseCorpusDocument } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { projectInsights } from "./insights-projection"

const corpus = parseCorpusDocument({
  corpusId: "math",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      challenge: ["One plus one?"],
      id: "addition",
      resolution: ["Two"],
      response: "text",
      revision: 1,
      withheld: ["Two"],
    },
    {
      challenge: ["Two plus two?"],
      id: "more-addition",
      resolution: ["Four"],
      response: "text",
      revision: 1,
      withheld: ["Four"],
    },
  ],
})

function review(input: Partial<ReviewHistoryEntry> = {}): ReviewHistoryEntry {
  return {
    assessment: "good",
    attemptedResponse: null,
    corpusId: "math",
    id: 1,
    nextIntervalMinutes: 1440,
    previousIntervalMinutes: 10,
    promptId: "addition",
    promptRevision: 1,
    reviewedAt: new Date("2026-08-26T10:00:00Z"),
    scheduler: "fsrs",
    schedulerVersion: "6",
    userId: "user-1",
    ...input,
  }
}

describe("Insights projection", () => {
  test("derives activity, ratings, workload, and difficult memories", () => {
    const insights = projectInsights({
      corpora: [corpus],
      now: new Date("2026-08-26T12:00:00Z"),
      reviews: [
        review(),
        review({
          assessment: "again",
          id: 2,
          nextIntervalMinutes: 10,
          promptId: "more-addition",
          reviewedAt: new Date("2026-08-25T10:00:00Z"),
        }),
      ],
    })

    expect(insights.summary).toEqual({
      activeMemories: 2,
      dueNow: 1,
      reviewedLast7Days: 2,
      totalReviews: 2,
    })
    expect(insights.ratingDistribution).toMatchObject({ again: 1, good: 1 })
    expect(insights.corpusWorkload).toEqual([
      { corpusId: "math", due: 1, memories: 2, reviews: 2, upcoming: 1 },
    ])
    expect(insights.difficultMemories[0]).toMatchObject({
      again: 1,
      promptId: "more-addition",
    })
  })

  test("groups review activity by the client-hinted calendar day", () => {
    const insights = projectInsights({
      corpora: [corpus],
      now: new Date("2026-08-27T12:00:00Z"),
      reviews: [review({ reviewedAt: new Date("2026-08-27T01:00:00Z") })],
      timeZone: "America/Los_Angeles",
    })

    expect(insights.dailyActivity.at(-2)).toEqual({
      count: 1,
      date: "2026-08-26",
    })
    expect(insights.dailyActivity.at(-1)).toEqual({
      count: 0,
      date: "2026-08-27",
    })
  })

  test("keeps unseen active memories due and excludes suspended memories", () => {
    const suspendedCorpus = parseCorpusDocument({
      ...corpus,
      prompts: [
        corpus.prompts[0],
        { ...corpus.prompts[1], status: "suspended" },
      ],
    })
    const insights = projectInsights({
      corpora: [suspendedCorpus],
      now: new Date("2026-08-26T12:00:00Z"),
      reviews: [],
    })
    expect(insights.corpusWorkload[0]).toMatchObject({ due: 1, memories: 1 })
  })
})
