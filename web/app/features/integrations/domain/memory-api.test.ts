import { describe, expect, it } from "vitest"

import {
  countCreatedPrompts,
  createMemoriesRequestSchema,
  parseClozeText,
} from "./memory-api"

describe("integration Memory API domain", () => {
  it("accepts strict atomic basic and cloze batches", () => {
    const result = createMemoriesRequestSchema.parse({
      items: [
        { answer: "4", challenge: "2 + 2", kind: "basic" },
        { kind: "cloze", text: "The {{first}} and {{second}} targets." },
      ],
    })
    expect(result.items[0]?.responseMode).toBe("self-check")
    expect(countCreatedPrompts(result)).toBe(3)
  })

  it("creates one independent target for every cloze", () => {
    const result = parseClozeText("The {{first}} and {{second}} targets.")
    expect(result).toEqual({
      targets: [
        {
          answer: "first",
          challenge: "The […] and second targets.",
          targetIndex: 0,
        },
        {
          answer: "second",
          challenge: "The first and […] targets.",
          targetIndex: 1,
        },
      ],
      valid: true,
    })
  })

  it("rejects malformed clozes and unsupported public fields", () => {
    expect(
      createMemoriesRequestSchema.safeParse({
        items: [{ kind: "cloze", text: "Missing target" }],
      }).success,
    ).toBe(false)
    expect(
      createMemoriesRequestSchema.safeParse({
        items: [
          {
            answer: "answer",
            challenge: "challenge",
            id: "caller-controlled",
            kind: "basic",
          },
        ],
      }).success,
    ).toBe(false)
  })

  it("limits a request to 100 items", () => {
    expect(
      createMemoriesRequestSchema.safeParse({
        items: Array.from({ length: 101 }, (_, index) => ({
          answer: `answer ${index}`,
          challenge: `challenge ${index}`,
          kind: "basic",
        })),
      }).success,
    ).toBe(false)
  })
})
