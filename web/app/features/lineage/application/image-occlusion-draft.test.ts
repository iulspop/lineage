import { isCuid } from "@paralleldrive/cuid2"
import { describe, expect, test } from "vitest"

import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { validateImageOcclusionDraft } from "./image-occlusion-draft"

const draft = {
  accessibleDescription: "A map of France with its capital concealed",
  answer: "Paris",
  challenge: "Name the concealed capital city.",
  corpusId: "geography",
  height: 0.15,
  imageBase64: Buffer.from("test-image").toString("base64"),
  imageMediaType: "image/png",
  imageName: "france.png",
  promptId: "capital-of-france-map",
  regionDescription: "The concealed location of France's capital",
  regionLabel: "Capital city",
  width: 0.2,
  x: 0.4,
  y: 0.3,
} as const

describe("image occlusion drafts", () => {
  test("builds a canonical image-occlusion candidate with host-computed integrity", () => {
    const result = validateImageOcclusionDraft({
      base: null,
      draft,
      validator: lineageRuntime,
    })

    expect(result.valid).toBe(true)
    if (!result.valid) throw new Error("Expected valid image occlusion")
    const asset = result.preview.document.assets[0]
    expect(asset).toMatchObject({
      byteSize: 10,
      mediaType: "image/png",
    })
    expect(isCuid(asset?.id ?? "")).toBe(true)
    expect(asset?.path).toBe(`assets/${asset.id}.png`)
    expect(asset?.sha256).toMatch(/^[a-f0-9]{64}$/)
    expect(result.preview.document.prompts[0]).toMatchObject({
      kind: "image-occlusion",
      occlusionRegions: [
        {
          geometry: {
            height: 0.15,
            type: "rectangle",
            width: 0.2,
            x: 0.4,
            y: 0.3,
          },
        },
      ],
      sourceAsset: asset?.id,
    })
    expect(
      isCuid(
        result.preview.document.prompts[0]?.occlusionRegions?.[0]?.id ?? "",
      ),
    ).toBe(true)
  })

  test("increments the immutable Prompt revision when editing", () => {
    const first = validateImageOcclusionDraft({
      base: null,
      draft,
      validator: lineageRuntime,
    })
    if (!first.valid) throw new Error("Expected initial candidate")
    const revised = validateImageOcclusionDraft({
      base: first.preview.document,
      draft: { ...draft, answer: "Paris, France" },
      existingPromptId: draft.promptId,
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
