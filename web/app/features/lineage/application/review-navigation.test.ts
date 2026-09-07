import { describe, expect, test } from "vitest"

import {
  createReviewAfterDeletionUrl,
  createReviewContinuationUrl,
  parseReviewHistoryIndex,
} from "./review-navigation"

describe("createReviewContinuationUrl", () => {
  test("given: a completed limited review, should: continue directly to the next Prompt", () => {
    const actual = createReviewContinuationUrl(
      "https://lineage.test/review?limit=10&completed=3",
    )
    const expected = "/review?limit=10&completed=4"

    expect(actual).toEqual(expected)
  })
})

describe("parseReviewHistoryIndex", () => {
  test("given: no history parameter, should: keep the current Review queue selected", () => {
    expect(parseReviewHistoryIndex(null, 3)).toBeNull()
  })

  test("given: an explicit valid history parameter, should: select that completed Review", () => {
    expect(parseReviewHistoryIndex("0", 3)).toBe(0)
  })
})

describe("createReviewAfterDeletionUrl", () => {
  test("given: a deleted historical review, should: return to the current queue without incrementing progress", () => {
    const actual = createReviewAfterDeletionUrl(
      "https://lineage.test/review?limit=10&completed=3&history=0",
    )

    expect(actual).toEqual("/review?limit=10&completed=3")
  })
})
