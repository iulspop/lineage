import type { CorpusDocument } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { dueAt } from "./review-scheduling"

export type MemoryDetailProjection = {
  assets: Array<{
    accessibleDescription: string | null
    id: string
    mediaType: string
  }>
  corpusId: string
  history: Array<{
    assessment: string
    id: number
    intervalMinutes: number
    promptRevision: number
    reviewedAt: string
  }>
  materials: Array<{ content: string; id: string; revision: number }>
  memory: {
    challenge: string[]
    due: boolean
    kind: "basic" | "cloze" | "image-occlusion"
    nextReviewAt: string | null
    promptId: string
    resolution: string[]
    responseMode: "self-check" | "text"
    revision: number
    status: "active" | "retired" | "suspended"
    withheldCount: number
  }
  relationships: Array<{
    direction: "incoming" | "outgoing"
    id: string
    kind: string
    relatedId: string
  }>
  revisions: Array<{ createdAt: string; digest: string; revision: number }>
  snapshotDigest: string
  sources: Array<{
    contentPreview: string
    id: string
    revision: number
    title: string
  }>
}

export function projectMemoryDetail(input: {
  document: CorpusDocument
  now?: Date
  promptId: string
  reviews: ReviewHistoryEntry[]
  snapshots: Array<{ canonicalJson: string; createdAt: Date; digest: string }>
  snapshotDigest: string
}): MemoryDetailProjection | null {
  const memory = input.document.prompts.find(
    (prompt) => prompt.id === input.promptId,
  )
  if (!memory) return null

  const latestReview = input.reviews[0] ?? null
  const scheduled = dueAt(latestReview)
  const sourceIds = new Set(memory.sources)
  const materialIds = new Set(memory.materials)
  const assetIds = new Set(memory.assets)
  if (memory.sourceAsset) assetIds.add(memory.sourceAsset)

  return {
    assets: input.document.assets
      .filter((asset) => assetIds.has(asset.id))
      .map((asset) => ({
        accessibleDescription: asset.accessibleDescription ?? null,
        id: asset.id,
        mediaType: asset.mediaType,
      })),
    corpusId: input.document.corpusId,
    history: input.reviews.map((review) => ({
      assessment: review.assessment,
      id: review.id,
      intervalMinutes: review.nextIntervalMinutes,
      promptRevision: review.promptRevision,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    materials: input.document.materials
      .filter((material) => materialIds.has(material.id))
      .map((material) => ({
        content: material.content.join(" "),
        id: material.id,
        revision: material.revision,
      })),
    memory: {
      challenge: memory.challenge,
      due:
        memory.status === "active" &&
        (!latestReview ||
          (scheduled !== null && scheduled <= (input.now ?? new Date()))),
      kind: memory.kind,
      nextReviewAt: scheduled?.toISOString() ?? null,
      promptId: memory.id,
      resolution: memory.resolution,
      responseMode: memory.response === "text" ? "text" : "self-check",
      revision: memory.revision,
      status: memory.status,
      withheldCount: memory.withheld.length,
    },
    relationships: input.document.relationships.reduce<
      MemoryDetailProjection["relationships"]
    >((relationships, relationship) => {
      if (relationship.source.id === memory.id)
        relationships.push({
          direction: "outgoing",
          id: relationship.id,
          kind: relationship.kind,
          relatedId: relationship.target.id,
        })
      else if (relationship.target.id === memory.id)
        relationships.push({
          direction: "incoming",
          id: relationship.id,
          kind: relationship.kind,
          relatedId: relationship.source.id,
        })
      return relationships
    }, []),
    revisions: input.snapshots.flatMap((snapshot) => {
      const document = JSON.parse(snapshot.canonicalJson) as CorpusDocument
      const prompt = document.prompts.find(
        (candidate) => candidate.id === memory.id,
      )
      return prompt
        ? [
            {
              createdAt: snapshot.createdAt.toISOString(),
              digest: snapshot.digest,
              revision: prompt.revision,
            },
          ]
        : []
    }),
    snapshotDigest: input.snapshotDigest,
    sources: input.document.sources
      .filter((source) => sourceIds.has(source.id))
      .map((source) => ({
        contentPreview: source.content.slice(0, 240),
        id: source.id,
        revision: source.revision,
        title: source.title,
      })),
  }
}
