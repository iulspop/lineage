import { parseCorpusDocument } from "../domain/corpus"
import type { ReviewRecordStore } from "../domain/review"
import type { ActiveCorpusResolution } from "./active-corpus.server"
import { resolveActiveCorpus } from "./active-corpus.server"
import { dueAt } from "./review-scheduling"

export async function loadWorkspaceSummary(input: {
  now?: Date
  ownerId: string
  resolveActive?: (ownerId: string) => Promise<ActiveCorpusResolution>
  reviewStore: ReviewRecordStore
}) {
  const now = input.now ?? new Date()
  const resolution = await (input.resolveActive ?? resolveActiveCorpus)(
    input.ownerId,
  )
  if (resolution.status === "empty") {
    return {
      dueCount: 0,
      nextReviewAt: null,
      recentReviews: [],
      totalMemories: 0,
      workspace: null,
    }
  }

  const document = parseCorpusDocument(
    JSON.parse(resolution.snapshot.canonicalJson),
  )
  const latestReviews = await input.reviewStore.latestForCorpus({
    corpusId: resolution.corpusId,
    userId: input.ownerId,
  })
  const reviewsByPrompt = new Map(
    latestReviews.map((review) => [review.promptId, review]),
  )
  const activePrompts = document.prompts.filter(
    (prompt) => prompt.status === "active",
  )
  const dueCount = activePrompts.filter((prompt) => {
    const review = reviewsByPrompt.get(prompt.id) ?? null
    const scheduled = dueAt(review)
    return !review || (scheduled !== null && scheduled <= now)
  }).length
  const nextReviewAt =
    dueCount > 0
      ? null
      : (latestReviews
          .map(dueAt)
          .filter((value): value is Date => value !== null)
          .sort((left, right) => left.getTime() - right.getTime())[0] ?? null)
  const recentReviews = (
    await input.reviewStore.recentForUser(input.ownerId, 30)
  )
    .filter((review) => review.corpusId === resolution.corpusId)
    .slice(0, 6)

  return {
    dueCount,
    nextReviewAt: nextReviewAt?.toISOString() ?? null,
    recentReviews: recentReviews.map((review) => ({
      assessment: review.assessment,
      corpusId: review.corpusId,
      promptId: review.promptId,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    totalMemories: activePrompts.length,
    workspace: {
      collectionCount: document.collections.length,
      corpusId: resolution.corpusId,
      sourceCount: document.sources.length,
    },
  }
}
