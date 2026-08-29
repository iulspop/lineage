import { createHash } from "node:crypto"
import { createId } from "@paralleldrive/cuid2"

import type { CorpusDocument, LineageDiagnostic } from "../domain/corpus"
import type { ReviewContractValidator } from "../domain/corpus-ports"
import type { CorpusCandidatePreview } from "./author-corpus.server"
import { validateCorpusCandidate } from "./author-corpus.server"

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export type ImageOcclusionRegionDraft = {
  height: number
  hint?: string
  id?: string
  label: string
  promptId?: string
  width: number
  x: number
  y: number
}

export type ImageOcclusionDraft = {
  assetId?: string
  corpusId: string
  imageBase64: string
  imageMediaType: string
  imageName: string
  newImage?: boolean
  regions: ImageOcclusionRegionDraft[]
}

export type ImageOcclusionDraftResult =
  | {
      asset: CorpusDocument["assets"][number]
      promptIds: string[]
      valid: true
      preview: CorpusCandidatePreview
    }
  | { diagnostics: LineageDiagnostic[]; valid: false }

function baseDocument(corpusId: string): CorpusDocument {
  return {
    assets: [],
    collectionMemberships: [],
    collections: [],
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
    current && !draft.newImage && draft.assetId ? draft.assetId : createId()
  const extension = draft.imageMediaType === "image/jpeg" ? "jpg" : "png"
  const asset = {
    byteSize: bytes.byteLength,
    id: assetId,
    mediaType: draft.imageMediaType,
    path: `assets/${assetId}.${extension}`,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }
  const regions = draft.regions.map((region, index) => ({
    accessibleDescription: "Occluded image region",
    geometry: {
      height: region.height,
      type: "rectangle" as const,
      width: region.width,
      x: region.x,
      y: region.y,
    },
    hint: region.hint,
    id: current?.occlusionRegions?.[index]?.id ?? region.id ?? createId(),
    label: region.label.trim(),
    promptId:
      index === 0 && current ? current.id : (region.promptId ?? createId()),
  }))
  const prompts = regions.map((target) => ({
    ...(target.promptId === current?.id ? current : {}),
    assets: [assetId],
    challenge: target.hint?.trim() ? [target.hint.trim()] : [],
    id: target.promptId,
    kind: "image-occlusion" as const,
    occlusionRegions: [
      target,
      ...regions.filter((region) => region.id !== target.id),
    ].map(({ hint: _hint, promptId: _promptId, ...region }) => region),
    resolution: ["target region"],
    response: { capture: "none" as const, mode: "self-check" as const },
    revision: target.promptId === current?.id ? current.revision + 1 : 1,
    sourceAsset: assetId,
    withheld: ["target region"],
  }))
  const replacedPromptIds = new Set(prompts.map(({ id }) => id))
  const candidate = {
    ...document,
    assets: [...document.assets.filter(({ id }) => id !== assetId), asset],
    prompts: [
      ...document.prompts.filter(({ id }) => !replacedPromptIds.has(id)),
      ...prompts,
    ],
  }
  const result = validateCorpusCandidate({
    candidateJson: JSON.stringify(candidate),
    maxRepairs: 0,
    validator,
  })
  if (!result.valid) return result
  if (baseDigest && !base) throw new Error("A base digest requires a corpus")
  return {
    asset,
    preview: result.preview,
    promptIds: prompts.map(({ id }) => id),
    valid: true,
  }
}
