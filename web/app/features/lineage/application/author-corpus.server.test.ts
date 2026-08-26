import { describe, expect, test } from "vitest"

import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { validateCorpusCandidate } from "./author-corpus.server"

const safeCandidate = {
  corpusId: "generated-geography",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      challenge: ["What is the capital of France?"],
      id: "capital-of-france",
      resolution: ["What is the capital of France?", "Paris"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["Paris"],
    },
  ],
}

describe("AI corpus candidate validation", () => {
  test("previews a structurally and semantically valid candidate", () => {
    const result = validateCorpusCandidate({
      candidateJson: JSON.stringify(safeCandidate),
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid candidate")
    expect(result.preview.document.prompts[0]?.kind).toBe("basic")
    expect(result.preview.repairCount).toBe(0)
  })

  test("repairs a localized disclosure leak before preview", () => {
    const result = validateCorpusCandidate({
      candidateJson: JSON.stringify({
        ...safeCandidate,
        prompts: [{ ...safeCandidate.prompts[0], challenge: ["Paris"] }],
      }),
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected repaired candidate")
    expect(result.preview.document.prompts[0]?.challenge).toEqual([])
    expect(result.preview.repairCount).toBe(1)
  })

  test("returns stable diagnostics when repair cannot establish validity", () => {
    const result = validateCorpusCandidate({
      candidateJson: JSON.stringify({
        ...safeCandidate,
        prompts: [{ ...safeCandidate.prompts[0], revision: 0 }],
      }),
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected invalid candidate")
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "revision.non-positive",
        path: "/prompts/0/revision",
      }),
    )
  })

  test("does not invent missing media integrity metadata", () => {
    const result = validateCorpusCandidate({
      candidateJson: JSON.stringify({
        ...safeCandidate,
        assets: [
          {
            byteSize: "HOST_COMPUTED_BYTE_SIZE",
            digest: "HOST_COMPUTED_SHA256",
            id: "diagram",
            mediaType: "image/png",
            path: "assets/diagram.png",
          },
        ],
      }),
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected invalid media candidate")
    expect(result.diagnostics[0]?.code).toBe("structure.invalid")
  })
})
