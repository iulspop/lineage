import { describe, expect, test } from "vitest"

import type { ReviewContract } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { selectNextPrompt } from "./review-queue"

const prompts: ReviewContract[] = ["first", "second", "third"].map((id) => ({
  challenge: [`Challenge ${id}`],
  id,
  resolution: [`Challenge ${id}`, `Answer ${id}`],
  response: "text",
  revision: 1,
  withheld: [`Answer ${id}`],
}))

function review(
  promptId: string,
  reviewedAt: string,
  interval: number,
): ReviewHistoryEntry {
  return {
    assessment: "good",
    attemptedResponse: null,
    corpusId: "corpus",
    id: prompts.findIndex((prompt) => prompt.id === promptId) + 1,
    nextIntervalMinutes: interval,
    previousIntervalMinutes: 0,
    promptId,
    promptRevision: 1,
    reviewedAt: new Date(reviewedAt),
    scheduler: "lineage-prototype",
    schedulerVersion: "1",
    userId: "user",
  }
}

describe("selectNextPrompt", () => {
  test("selects unreviewed Prompts before reviewed Prompts in corpus order", () => {
    expect(
      selectNextPrompt(prompts, [review("first", "2026-08-26T00:00:00Z", 1)])
        ?.prompt.id,
    ).toBe("second")
  })

  test("selects the earliest due reviewed Prompt", () => {
    const selected = selectNextPrompt(prompts.slice(0, 2), [
      review("first", "2026-08-26T00:00:00Z", 20),
      review("second", "2026-08-26T00:00:00Z", 10),
    ])
    expect(selected?.prompt.id).toBe("second")
  })

  test("uses corpus order as the stable tie-break", () => {
    const selected = selectNextPrompt(prompts.slice(0, 2), [
      review("first", "2026-08-26T00:00:00Z", 10),
      review("second", "2026-08-26T00:00:00Z", 10),
    ])
    expect(selected?.prompt.id).toBe("first")
  })
})
