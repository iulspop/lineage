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

const now = new Date("2026-08-26T00:05:00Z")

describe("selectNextPrompt", () => {
  test("selects new Prompts before reviewed Prompts that are not due", () => {
    expect(
      selectNextPrompt(
        prompts,
        [review("first", "2026-08-26T00:00:00Z", 10)],
        now,
      )?.prompt.id,
    ).toBe("second")
  })

  test("selects due learning reviews before new Prompts", () => {
    expect(
      selectNextPrompt(
        prompts,
        [review("first", "2026-08-26T00:00:00Z", 1)],
        now,
      )?.prompt.id,
    ).toBe("first")
  })

  test("selects the earliest due reviewed Prompt", () => {
    const selected = selectNextPrompt(
      prompts.slice(0, 2),
      [
        review("first", "2026-08-26T00:00:00Z", 4),
        review("second", "2026-08-26T00:00:00Z", 2),
      ],
      now,
    )
    expect(selected?.prompt.id).toBe("second")
  })

  test("given: every reviewed Prompt is scheduled for the future, should: select no Prompt", () => {
    const actual = selectNextPrompt(
      prompts.slice(0, 2),
      [
        review("first", "2026-08-26T00:00:00Z", 10),
        review("second", "2026-08-26T00:00:00Z", 20),
      ],
      now,
    )
    const expected = null

    expect(actual).toEqual(expected)
  })

  test("uses corpus order as the stable tie-break", () => {
    const selected = selectNextPrompt(
      prompts.slice(0, 2),
      [
        review("first", "2026-08-26T00:00:00Z", 1),
        review("second", "2026-08-26T00:00:00Z", 1),
      ],
      now,
    )
    expect(selected?.prompt.id).toBe("first")
  })
})
