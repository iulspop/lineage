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

  test("parses bulk basic memories from lines and Markdown fences", () => {
    const parsed = parseQuickMemoryCapture({
      corpusId: "math",
      input: `\`\`\`text
In quadratic standard form, what is the quadratic term? >> ax²
\`\`\`

\`\`\`text
In quadratic standard form, what is the linear term? >> bx
\`\`\`
In quadratic standard form, what symbol is the constant term? >> c`,
    })

    expect(parsed.valid).toBe(true)
    if (!parsed.valid) throw new Error("Expected valid bulk capture")
    expect(parsed.drafts).toMatchObject([
      {
        answer: "ax²",
        challenge: "In quadratic standard form, what is the quadratic term?",
      },
      {
        answer: "bx",
        challenge: "In quadratic standard form, what is the linear term?",
      },
      {
        answer: "c",
        challenge:
          "In quadratic standard form, what symbol is the constant term?",
      },
    ])
    expect(new Set(parsed.drafts.map(({ promptId }) => promptId)).size).toBe(3)

    const result = validateQuickMemoryCapture({
      base: null,
      drafts: parsed.drafts,
      validator: lineageRuntime,
    })
    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid bulk candidate")
    expect(result.preview.document.prompts).toHaveLength(3)
  })

  test("reports the source line when a bulk memory is malformed", () => {
    expect(
      parseQuickMemoryCapture({
        corpusId: "math",
        input: "Valid question? >> Valid answer\nMissing separator",
      }),
    ).toEqual({
      message:
        "Line 2: Use “question >> answer” or wrap a cloze answer in {{double braces}}.",
      valid: false,
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

  test("does not treat a symbolic answer inside another word as disclosed", () => {
    const result = validateManualMemoryDraft({
      base: null,
      draft: {
        answer: "c",
        challenge:
          "What is the constant term of the standard quadratic equation?",
        corpusId: "math",
        kind: "basic",
        promptId: "quadratic-constant-term",
        responseMode: "self-check",
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
  })

  test("still rejects a standalone symbolic answer in the challenge", () => {
    const result = validateManualMemoryDraft({
      base: null,
      draft: {
        answer: "c",
        challenge: "Which coefficient is c?",
        corpusId: "math",
        kind: "basic",
        promptId: "leaked-symbol",
        responseMode: "self-check",
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected leaked symbol diagnostics")
    expect(result.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "disclosure.answer-leaked" }),
      ]),
    )
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
