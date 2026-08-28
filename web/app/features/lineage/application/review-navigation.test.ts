import { describe, expect, test } from "vitest"

import { createReviewContinuationUrl } from "./review-navigation"

describe("createReviewContinuationUrl", () => {
  test("given: a completed limited review, should: continue directly to the next Prompt", () => {
    const actual = createReviewContinuationUrl(
      "https://lineage.test/review?limit=10&completed=3",
    )
    const expected = "/review?limit=10&completed=4"

    expect(actual).toEqual(expected)
  })
})
