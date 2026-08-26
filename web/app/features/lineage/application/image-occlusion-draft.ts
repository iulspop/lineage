import { createHash } from "node:crypto"

import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import type { CorpusCandidatePreview } from "./author-corpus.server"
import { validateCorpusCandidate } from "./author-corpus.server"

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ImageOcclusionDraft = {
  accessibleDescription: string
  answer: string
  assetId?: string
  challenge: string
  corpusId: string
  height: number
  imageBase64: string
  imageMediaType: string
  imageName: string
  newImage?: boolean
  promptId: string
  regionDescription: string
  regionLabel: string
  width: number
  x: number
  y: number
}

export type ImageOcclusionDraftResult =
  | {
      asset: CorpusDocument["assets"][number]
      valid: true
      preview: CorpusCandidatePreview
    }
  | { diagnostics: LineageDiagnostic[]; valid: false }

function lines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function baseDocument(corpusId: string): CorpusDocument {
  return {
    assets: [],
    corpusId,
    extensions: [],
    format: "lineage.corpus",
    formatVersion: 1,
    interoperability: [],
    materials: [],
    migrations: [],
    prompts: [],
    provenance: [],
    relationships: [],
    repetitionCorrections: [],
    repetitions: [],
    sources: [],
  }
}

export function imageBytes(draft: ImageOcclusionDraft) {
  return Uint8Array.from(Buffer.from(draft.imageBase64, "base64"))
}

export function validateImageOcclusionDraft({
  base,
  baseDigest,
  draft,
  existingPromptId,
  validator,
}: {
  base: CorpusDocument | null
  baseDigest?: string
  draft: ImageOcclusionDraft
  existingPromptId?: string
  validator: ReviewContractValidator
}): ImageOcclusionDraftResult {
  const bytes = imageBytes(draft)
  const document = structuredClone(base ?? baseDocument(draft.corpusId.trim()))
  const current = existingPromptId
    ? document.prompts.find((prompt) => prompt.id === existingPromptId)
    : null
  const assetId =
    current && !draft.newImage && draft.assetId
      ? draft.assetId
      : `${draft.promptId.trim()}-image-r${current ? current.revision + 1 : 1}`
  const extension = draft.imageMediaType === "image/jpeg" ? "jpg" : "png"
  const asset = {
    accessibleDescription: draft.accessibleDescription.trim(),
    byteSize: bytes.byteLength,
    id: assetId,
    mediaType: draft.imageMediaType,
    path: `assets/${assetId}.${extension}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }
  const prompt = {
    ...(current ?? {}),
    assets: [assetId],
    challenge: lines(draft.challenge),
    id: current?.id ?? draft.promptId.trim(),
    kind: "image-occlusion" as const,
    occlusionRegions: [
      {
        accessibleDescription: draft.regionDescription.trim(),
        geometry: {
          height: draft.height,
          type: "rectangle" as const,
          width: draft.width,
          x: draft.x,
          y: draft.y,
        },
        id: `${current?.id ?? draft.promptId.trim()}-region-1`,
        label: draft.regionLabel.trim(),
      },
    ],
    resolution: lines(draft.answer),
    response: { capture: "none" as const, mode: "self-check" as const },
    revision: current ? current.revision + 1 : 1,
    sourceAsset: assetId,
    withheld: lines(draft.answer),
  }
  const candidate = {
    ...document,
    assets: [...document.assets.filter(({ id }) => id !== assetId), asset],
    prompts: current
      ? document.prompts.map((item) => (item.id === current.id ? prompt : item))
      : [...document.prompts, prompt],
  }
  const result = validateCorpusCandidate({
    candidateJson: JSON.stringify(candidate),
    maxRepairs: 0,
    validator,
  })
  if (!result.valid) return result
  if (baseDigest && !base) throw new Error("A base digest requires a corpus")
  return { asset, preview: result.preview, valid: true }
}
