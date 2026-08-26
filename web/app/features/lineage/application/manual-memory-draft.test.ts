import { describe, expect, test } from "vitest"

import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { draftToPrompt, validateManualMemoryDraft } from "./manual-memory-draft"

describe("manual memory drafts", () => {
  test("maps a basic draft to a self-check Prompt", () => {
    expect(
      draftToPrompt({
        answer: "-1",
        challenge: "What is i squared?",
        corpusId: "powers-of-i",
        kind: "basic",
        promptId: "i-squared",
        responseMode: "self-check",
      }),
    ).toMatchObject({
      challenge: ["What is i squared?"],
      id: "i-squared",
      kind: "basic",
      resolution: ["-1"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["-1"],
    })
  })

  test("builds and validates a cloze candidate", () => {
    const result = validateManualMemoryDraft({
      base: null,
      draft: {
        answer: "Paris",
        challenge: "The capital of France is […].",
        corpusId: "geography",
        hint: "A European capital",
        kind: "cloze",
        promptId: "capital-of-france",
        responseMode: "self-check",
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid draft")
    expect(result.preview.document.prompts[0]).toMatchObject({
      clozeTargets: [
        {
          answer: "Paris",
          hints: ["A European capital"],
          id: "capital-of-france-target-1",
        },
      ],
      kind: "cloze",
    })
  })

  test("returns Agda diagnostics when the answer leaks into the challenge", () => {
    const result = validateManualMemoryDraft({
      base: null,
      draft: {
        answer: "Paris",
        challenge: "The answer is Paris.",
        corpusId: "geography",
        kind: "basic",
        promptId: "capital-of-france",
        responseMode: "text",
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected invalid draft")
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: "disclosure.answer-leaked" }),
    )
  })
})
