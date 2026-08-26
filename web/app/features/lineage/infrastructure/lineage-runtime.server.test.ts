import { describe, expect, test } from "vitest"

import { lineageRuntime } from "./lineage-runtime.server"

const contract = {
  challenge: ["What is the capital of France?"],
  id: "capital-of-france",
  resolution: ["What is the capital of France?", "Paris"],
  response: "text" as const,
  revision: 1,
  withheld: ["Paris"],
}

describe("generated Lineage runtime", () => {
  test("given: a disclosure-safe contract, should: validate it through the packaged Agda core", () => {
    expect(lineageRuntime.isValid(contract)).toBe(true)
  })

  test("given: a contract leaking its answer, should: reject it through the packaged Agda core", () => {
    expect(
      lineageRuntime.isValid({
        ...contract,
        challenge: contract.resolution,
      }),
    ).toBe(false)
  })

  test("given: an unsafe corpus candidate, should: return stable localized diagnostics", () => {
    const result = lineageRuntime.validateCorpus?.({
      corpusId: "corpus-france",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [{ ...contract, challenge: ["Paris"] }],
    })
    if (!result) throw new Error("Structured validation is unavailable")

    expect(result).toEqual({
      diagnostics: [
        {
          code: "disclosure.answer-leaked",
          message: "Challenge content contains a withheld answer.",
          path: "/prompts/0/challenge/0",
          relatedPath: "/prompts/0/withheld/0",
          severity: "error",
        },
      ],
      valid: false,
    })
  })

  test("given: a minimal wire document, should: canonicalize optional fields before Agda validation", () => {
    const result = lineageRuntime.validateCorpus?.({
      corpusId: "corpus-france",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [contract],
    })
    if (!result) throw new Error("Structured validation is unavailable")

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid corpus")
    expect(result.document).toMatchObject({
      assets: [],
      extensions: [],
      interoperability: [],
      materials: [],
      migrations: [],
      prompts: [
        {
          assets: [],
          extensions: { optional: [], required: [] },
          kind: "basic",
          materials: [],
          presentationProfile: "lineage.review/1",
          provenance: [],
          sources: [],
          status: "active",
        },
      ],
      provenance: [],
      relationships: [],
      repetitionCorrections: [],
      repetitions: [],
      sources: [],
    })
  })

  test("given: an image-occlusion candidate without media, should: report dependency diagnostics", () => {
    const result = lineageRuntime.validateCorpus?.({
      corpusId: "corpus-image",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [
        {
          ...contract,
          id: "heart-region",
          kind: "image-occlusion",
          sourceAsset: "heart-image",
        },
      ],
    })
    if (!result) throw new Error("Structured validation is unavailable")

    expect(result.valid).toBe(false)
    if (result.valid) throw new Error("Expected invalid corpus")
    expect(
      result.diagnostics.map(({ code, path }) => ({ code, path })),
    ).toEqual([
      {
        code: "occlusion.regions-required",
        path: "/prompts/0/occlusionRegions",
      },
      { code: "asset.unresolved", path: "/prompts/0/sourceAsset" },
    ])
  })
})
