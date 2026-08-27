import { describe, expect, test } from "vitest"

import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import {
  draftToPrompt,
  parseQuickMemoryCapture,
  validateManualMemoryDraft,
  validateQuickMemoryCapture,
} from "./manual-memory-draft"

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

  test("parses a one-line basic memory and creates a stable collision-free ID", () => {
    expect(
      parseQuickMemoryCapture({
        corpusId: "math",
        existingPromptIds: ["what-is-i"],
        input: "What is i? >> √−1",
      }),
    ).toEqual({
      drafts: [
        {
          answer: "√−1",
          challenge: "What is i?",
          corpusId: "math",
          kind: "basic",
          promptId: "what-is-i-2",
          responseMode: "self-check",
        },
      ],
      valid: true,
    })
  })

  test("turns each double-braced answer into an independently scheduled cloze", () => {
    const parsed = parseQuickMemoryCapture({
      corpusId: "geography",
      input: "{{Paris}} is the capital of {{France}}.",
    })

    expect(parsed.valid).toBe(true)
    if (!parsed.valid) throw new Error("Expected valid quick capture")
    expect(parsed.drafts).toMatchObject([
      {
        answer: "Paris",
        challenge: "[…] is the capital of France.",
        kind: "cloze",
        promptId: "paris-is-the-capital-of-france-cloze-1",
      },
      {
        answer: "France",
        challenge: "Paris is the capital of […].",
        kind: "cloze",
        promptId: "paris-is-the-capital-of-france-cloze-2",
      },
    ])

    const result = validateQuickMemoryCapture({
      base: null,
      drafts: parsed.drafts,
      validator: lineageRuntime,
    })
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid cloze capture")
    expect(result.preview.document.prompts).toHaveLength(2)
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
