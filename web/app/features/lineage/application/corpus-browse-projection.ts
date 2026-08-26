import type { CorpusDocument } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { dueAt } from "./review-scheduling"

export type CorpusRevisionProjection = {
  createdAt: string
  digest: string
  formatVersion: number
  memoryCount: number
}

export type CorpusBrowseProjection = {
  advanced: {
    canonicalJson: string
    digest: string
    format: string
    formatVersion: number
    optionalExtensions: string[]
    requiredExtensions: string[]
  }
  compatibility: {
    extensions: Array<{
      fallback: string | null
      id: string
      requirement: "optional" | "required"
      version: string
    }>
    losses: string[]
    migrations: number
    status: "compatible" | "lossy" | "requires-support"
  }
  corpus: {
    assetCount: number
    corpusId: string
    memoryCount: number
    sourceCount: number
  }
  history: Array<{
    assessment: string
    id: number
    intervalMinutes: number
    promptId: string
    promptRevision: number
    reviewedAt: string
  }>
  memories: Array<{
    challenge: string
    due: boolean
    kind: "basic" | "cloze" | "image-occlusion"
    lastAssessment: string | null
    nextReviewAt: string | null
    promptId: string
    revision: number
    sourceIds: string[]
    status: "active" | "retired" | "suspended"
  }>
  revisions: CorpusRevisionProjection[]
  sources: Array<{
    assetCount: number
    contentPreview: string
    id: string
    memoryCount: number
    revision: number
    title: string
  }>
}

export function projectCorpusBrowse(input: {
  canonicalJson: string
  document: CorpusDocument
  now?: Date
  reviews: ReviewHistoryEntry[]
  revisions: CorpusRevisionProjection[]
  snapshotDigest: string
}): CorpusBrowseProjection {
  const now = input.now ?? new Date()
  const latestReviews = new Map<string, ReviewHistoryEntry>()
  for (const review of input.reviews) {
    if (!latestReviews.has(review.promptId))
      latestReviews.set(review.promptId, review)
  }
  const requiredExtensions = new Set<string>()
  const optionalExtensions = new Set<string>()
  for (const prompt of input.document.prompts) {
    for (const extension of prompt.extensions.required)
      requiredExtensions.add(extension)
    for (const extension of prompt.extensions.optional)
      optionalExtensions.add(extension)
  }
  const losses = input.document.interoperability.flatMap(
    (report) => report.losses,
  )

  return {
    advanced: {
      canonicalJson: input.canonicalJson,
      digest: input.snapshotDigest,
      format: input.document.format,
      formatVersion: input.document.formatVersion,
      optionalExtensions: [...optionalExtensions].sort(),
      requiredExtensions: [...requiredExtensions].sort(),
    },
    compatibility: {
      extensions: input.document.extensions.map((extension) => ({
        fallback: extension.fallback ?? null,
        id: extension.id,
        requirement: extension.requirement,
        version: extension.version,
      })),
      losses,
      migrations: input.document.migrations.length,
      status:
        losses.length > 0
          ? "lossy"
          : requiredExtensions.size > 0
            ? "requires-support"
            : "compatible",
    },
    corpus: {
      assetCount: input.document.assets.length,
      corpusId: input.document.corpusId,
      memoryCount: input.document.prompts.length,
      sourceCount: input.document.sources.length,
    },
    history: input.reviews.map((review) => ({
      assessment: review.assessment,
      id: review.id,
      intervalMinutes: review.nextIntervalMinutes,
      promptId: review.promptId,
      promptRevision: review.promptRevision,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    memories: input.document.prompts.map((prompt) => {
      const review = latestReviews.get(prompt.id) ?? null
      const scheduled = dueAt(review)
      return {
        challenge: prompt.challenge.join(" "),
        due:
          prompt.status === "active" &&
          (!review || (scheduled !== null && scheduled <= now)),
        kind: prompt.kind,
        lastAssessment: review?.assessment ?? null,
        nextReviewAt: scheduled?.toISOString() ?? null,
        promptId: prompt.id,
        revision: prompt.revision,
        sourceIds: prompt.sources,
        status: prompt.status,
      }
    }),
    revisions: input.revisions,
    sources: input.document.sources.map((source) => ({
      assetCount: source.assets.length,
      contentPreview: source.content.slice(0, 180),
      id: source.id,
      memoryCount: input.document.prompts.filter((prompt) =>
        prompt.sources.includes(source.id),
      ).length,
      revision: source.revision,
      title: source.title,
    })),
  }
}
