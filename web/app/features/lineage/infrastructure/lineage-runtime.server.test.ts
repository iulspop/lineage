import { describe, expect, test } from "vitest"

import lineageCore from "../generated/lineage-core.mjs"
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
  test("given: differently cased disclosure text, should: match inside the compiled Agda core", () => {
    expect(
      lineageCore.disclosureContains("Paris")("The answer is PARIS."),
    ).toBe(true)
  })

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

  test("given: malformed self-check capture, should: return the declared stable diagnostic", () => {
    const result = lineageRuntime.validateCorpus?.({
      corpusId: "invalid-self-check",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [
        {
          ...contract,
          response: { capture: "text", mode: "self-check" },
        },
      ],
    })
    if (!result) throw new Error("Structured validation is unavailable")
    expect(result).toMatchObject({
      diagnostics: [
        {
          code: "response.invalid-self-check",
          path: "/prompts/0/response/capture",
          severity: "error",
        },
      ],
      valid: false,
    })
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

  test("given: embedded case-varied disclosure, should: enforce normalized containment", () => {
    const leaked = lineageRuntime.validateCorpus?.({
      corpusId: "corpus-france",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [{ ...contract, challenge: ["The answer is PARIS."] }],
    })
    const disclosed = lineageRuntime.validateCorpus?.({
      corpusId: "corpus-france",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [{ ...contract, resolution: ["The answer is Paris."] }],
    })

    expect(leaked?.valid).toBe(false)
    expect(leaked?.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "disclosure.answer-leaked",
        path: "/prompts/0/challenge/0",
      }),
    )
    expect(disclosed?.valid).toBe(true)
  })

  test("given: duplicated durable identities and unresolved graph links, should: report them", () => {
    const result = lineageRuntime.validateCorpus?.({
      assets: [
        {
          byteSize: 1,
          id: "asset-1",
          mediaType: "image/png",
          path: "assets/one.png",
          sha256: "0".repeat(64),
        },
        {
          byteSize: 1,
          id: "asset-1",
          mediaType: "image/png",
          path: "assets/two.png",
          sha256: "1".repeat(64),
        },
      ],
      corpusId: "corpus-graph",
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [contract],
      provenance: [
        {
          id: "provenance-1",
          kind: "authored",
          recordedAt: "2026-08-26T12:00:00Z",
          sources: ["missing-provenance"],
        },
      ],
      relationships: [
        {
          id: "relationship-1",
          kind: "related",
          source: { id: "capital-of-france", revision: 1 },
          target: { id: "missing", revision: 1 },
        },
      ],
    })

    expect(result?.valid).toBe(false)
    expect(result?.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "identity.duplicate" }),
        expect.objectContaining({
          code: "reference.unresolved",
          path: "/relationships/0/target",
        }),
        expect.objectContaining({
          code: "reference.unresolved",
          path: "/provenance/0/sources/0",
        }),
      ]),
    )
  })

  test("given: every canonical field family, should: map the complete host document into Agda", () => {
    const result = lineageRuntime.validateCorpus?.({
      assets: [
        {
          accessibleDescription: "A diagram with no concealed answer.",
          byteSize: 1,
          id: "asset-1",
          mediaType: "image/png",
          path: "assets/one.png",
          sha256: "0".repeat(64),
        },
      ],
      corpusId: "corpus-complete",
      extensions: [
        {
          fallback: "Portable fallback",
          id: "extension-1",
          requirement: "optional",
          version: "1",
        },
      ],
      format: "lineage.corpus",
      formatVersion: 1,
      interoperability: [
        {
          id: "interop-1",
          losses: [],
          preservedArtifacts: ["asset-1"],
          sourceFormat: "lineage.corpus/1",
          status: "exact",
          targetFormat: "lineage.corpus/1",
        },
      ],
      materials: [
        {
          assets: ["asset-1"],
          content: ["Supporting material"],
          id: "material-1",
          provenance: ["provenance-1"],
          revision: 1,
          sources: ["source-1"],
        },
      ],
      migrations: [
        {
          appliedAt: "2026-08-26T12:00:00Z",
          fromVersion: 0,
          id: "migration-1",
          tool: "lineage",
          toolVersion: "1",
          toVersion: 1,
        },
      ],
      prompts: [
        {
          ...contract,
          assets: ["asset-1"],
          extensions: { optional: ["extension-1"], required: [] },
          materials: ["material-1"],
          provenance: ["provenance-1"],
          sources: ["source-1"],
        },
      ],
      provenance: [
        {
          agent: "author",
          citation: "citation",
          id: "provenance-1",
          kind: "authored",
          license: "CC0",
          note: "note",
          recordedAt: "2026-08-26T12:00:00Z",
          sources: [],
        },
      ],
      relationships: [
        {
          id: "relationship-1",
          kind: "derived-from",
          source: { id: "capital-of-france", revision: 1 },
          target: { id: "source-1", revision: 1 },
        },
      ],
      repetitionCorrections: [
        {
          correctedAt: "2026-08-26T12:02:00Z",
          id: "correction-1",
          provenance: ["provenance-1"],
          reason: "Corrected rating",
          replacementAssessment: "easy",
          replacementResponse: "Paris",
          targetRepetitionId: "review-1",
        },
      ],
      repetitions: [
        {
          assessment: "good",
          capturedResponse: "Paris",
          durationMilliseconds: 1000,
          id: "review-1",
          presentationDigest: "1".repeat(64),
          promptId: "capital-of-france",
          promptRevision: 1,
          provenance: ["provenance-1"],
          reviewedAt: "2026-08-26T12:01:00Z",
          scheduler: {
            dueAt: "2026-08-27T12:01:00Z",
            family: "fsrs",
            nextIntervalMinutes: 1440,
            parameterDigest: "2".repeat(64),
            previousIntervalMinutes: 10,
            version: "6",
          },
          snapshotDigest: "3".repeat(64),
        },
      ],
      sources: [
        {
          assets: ["asset-1"],
          content: "Source content",
          id: "source-1",
          provenance: ["provenance-1"],
          revision: 1,
          title: "Source",
        },
      ],
    })

    expect(result?.valid).toBe(true)
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
