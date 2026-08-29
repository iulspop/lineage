import { isCuid } from "@paralleldrive/cuid2"
import { describe, expect, test } from "vitest"

import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { validateImageOcclusionDraft } from "./image-occlusion-draft"

const draft = {
  accessibleDescription: "A map of France with two cities concealed",
  challenge: "Name the highlighted city.",
  corpusId: "geography",
  imageBase64: Buffer.from("test-image").toString("base64"),
  imageMediaType: "image/png",
  imageName: "france.png",
  regions: [
    {
      accessibleDescription: "The concealed location of France's capital",
      answer: "Paris",
      height: 0.15,
      label: "Region 1",
      width: 0.2,
      x: 0.4,
      y: 0.3,
    },
    {
      accessibleDescription: "The concealed location of a southern city",
      answer: "Marseille",
      height: 0.12,
      label: "Region 2",
      width: 0.18,
      x: 0.55,
      y: 0.7,
    },
  ],
}

describe("image occlusion drafts", () => {
  test("creates one independently scheduled Prompt per drawn region", () => {
    const result = validateImageOcclusionDraft({
      base: null,
      draft,
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid image occlusion")
    const asset = result.preview.document.assets[0]
    expect(asset).toMatchObject({ byteSize: 10, mediaType: "image/png" })
    expect(isCuid(asset?.id ?? "")).toBe(true)
    expect(asset?.path).toBe(`assets/${asset.id}.png`)
    expect(asset?.sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(result.promptIds).toHaveLength(2)
    expect(result.preview.document.prompts).toHaveLength(2)
    expect(
      result.preview.document.prompts.map((prompt) => prompt.resolution[0]),
    ).toEqual(["Paris", "Marseille"])
    for (const prompt of result.preview.document.prompts) {
      expect(prompt.kind).toBe("image-occlusion")
      expect(prompt.sourceAsset).toBe(asset?.id)
      expect(prompt.occlusionRegions).toHaveLength(2)
      expect(isCuid(prompt.id)).toBe(true)
    }
    expect(
      result.preview.document.prompts.map(
        (prompt) => prompt.occlusionRegions?.[0]?.geometry,
      ),
    ).toEqual([
      { height: 0.15, type: "rectangle", width: 0.2, x: 0.4, y: 0.3 },
      {
        height: 0.12,
        type: "rectangle",
        width: 0.18,
        x: 0.55,
        y: 0.7,
      },
    ])
  })

  test("increments the immutable Prompt revision when editing", () => {
    const singleRegionDraft = { ...draft, regions: [draft.regions[0]] }
    const first = validateImageOcclusionDraft({
      base: null,
      draft: singleRegionDraft,
      validator: lineageRuntime,
    })
    if (!first.valid) throw new Error("Expected initial candidate")
    const promptId = first.promptIds[0]
    const revised = validateImageOcclusionDraft({
      base: first.preview.document,
      draft: {
        ...singleRegionDraft,
        regions: [{ ...singleRegionDraft.regions[0], answer: "Paris, France" }],
      },
      existingPromptId: promptId,
      validator: lineageRuntime,
    })

    expect(revised.valid).toBe(true)
    if (!revised.valid) throw new Error("Expected revised candidate")
    expect(revised.preview.document.prompts).toHaveLength(1)
    expect(revised.preview.document.prompts[0]?.revision).toBe(2)
    expect(revised.preview.document.prompts[0]?.occlusionRegions?.[0]?.id).toBe(
      first.preview.document.prompts[0]?.occlusionRegions?.[0]?.id,
    )
  })
})
