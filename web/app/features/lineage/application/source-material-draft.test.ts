import { describe, expect, test } from "vitest"

import type { CorpusDocument } from "../domain/corpus"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { validateKnowledgeDraft } from "./source-material-draft"

const corpus: CorpusDocument = {
  assets: [],
  collectionMemberships: [],
  collections: [],
  corpusId: "calculus",
  extensions: [],
  format: "lineage.corpus",
  formatVersion: 1,
  interoperability: [],
  learningObservations: [],
  materials: [],
  migrations: [],
  prompts: [
    {
      assets: [],
      challenge: ["What is a derivative?"],
      extensions: { optional: [], required: [] },
      id: "derivative",
      kind: "basic",
      materials: [],
      presentationProfile: "lineage.review/1",
      provenance: [],
      resolution: ["An instantaneous rate of change."],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      sources: [],
      status: "active",
      withheld: ["An instantaneous rate of change."],
    },
  ],
  provenance: [],
  readingSegments: [],
  relationships: [],
  repetitionCorrections: [],
  repetitions: [],
  sources: [],
}

describe("source and material drafts", () => {
  test("creates and links a source through authoritative validation", () => {
    const result = validateKnowledgeDraft({
      base: corpus,
      draft: {
        content: "A derivative measures instantaneous change.",
        id: "calculus-notes",
        kind: "source",
        linkedPromptIds: ["derivative"],
        title: "Calculus notes",
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid source draft")
    expect(result.preview.document.sources[0]).toMatchObject({
      id: "calculus-notes",
      revision: 1,
      title: "Calculus notes",
    })
    expect(result.preview.document.prompts[0]).toMatchObject({
      revision: 2,
      sources: ["calculus-notes"],
    })
  })

  test("creates material with source dependencies and memory links", () => {
    const withSource = structuredClone(corpus)
    withSource.sources = [
      {
        assets: [],
        content: "A derivative measures instantaneous change.",
        id: "calculus-notes",
        provenance: [],
        revision: 1,
        title: "Calculus notes",
      },
    ]
    const result = validateKnowledgeDraft({
      base: withSource,
      draft: {
        content: "Derivative definition\nLimit interpretation",
        id: "derivative-summary",
        kind: "material",
        linkedPromptIds: ["derivative"],
        sourceIds: ["calculus-notes"],
      },
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid material draft")
    expect(result.preview.document.materials[0]).toMatchObject({
      content: ["Derivative definition", "Limit interpretation"],
      id: "derivative-summary",
      revision: 1,
      sources: ["calculus-notes"],
    })
    expect(result.preview.document.prompts[0]).toMatchObject({
      materials: ["derivative-summary"],
      revision: 2,
    })
  })
})
