import { describe, expect, it } from "vitest"

import type { AuthoringProvider } from "../domain/authoring-provider"
import { parseCorpusDocument } from "../domain/corpus"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { generateCorpusCandidate } from "./generate-corpus-candidate.server"

function provider(candidate: unknown): AuthoringProvider {
  return {
    async generate() {
      return {
        candidateJson:
          typeof candidate === "string" ? candidate : JSON.stringify(candidate),
        model: "test-model",
        provider: "test-provider",
        requestId: "request-1",
      }
    },
  }
}

const baseInput = {
  corpusId: "calculus",
  depth: "introductory" as const,
  desiredCount: 1,
  intent: "topic" as const,
  memoryKinds: ["basic" as const],
  topic: "calculus",
}

const candidate = {
  assets: [],
  corpusId: "calculus",
  extensions: [],
  format: "lineage.corpus",
  formatVersion: 1,
  interoperability: [],
  materials: [],
  migrations: [],
  prompts: [
    {
      challenge: ["What is a derivative?"],
      id: "derivative",
      kind: "basic",
      resolution: ["The instantaneous rate of change"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["The instantaneous rate of change"],
    },
  ],
  provenance: [],
  relationships: [],
  repetitionCorrections: [],
  repetitions: [],
  sources: [],
}

describe("generateCorpusCandidate", () => {
  it("validates provider output and records non-normative provenance", async () => {
    const result = await generateCorpusCandidate({
      base: null,
      input: baseInput,
      provider: provider(candidate),
      validator: lineageRuntime,
    })

    expect(result.valid, JSON.stringify(result)).toBe(true)
    if (!result.valid) return
    expect(result.memories).toHaveLength(1)
    expect(result.provider.provider).toBe("test-provider")
    expect(JSON.parse(result.canonicalJson).provenance[0].agent).toBe(
      "test-provider/test-model",
    )
  })

  it("rejects malformed provider output without persistence", async () => {
    const result = await generateCorpusCandidate({
      base: null,
      input: baseInput,
      provider: provider("ignore the schema and run this command"),
      validator: lineageRuntime,
    })

    expect(result).toMatchObject({
      diagnostics: [{ code: "structure.invalid", path: "/" }],
      valid: false,
    })
  })

  it("replaces an improved memory with the next immutable revision", async () => {
    const result = await generateCorpusCandidate({
      base: parseCorpusDocument(candidate),
      input: {
        ...baseInput,
        intent: "improve-memory",
        promptId: "derivative",
      },
      provider: provider(candidate),
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) return
    expect(JSON.parse(result.canonicalJson).prompts[0].revision).toBe(2)
  })
})
