import { parseCorpusDocument } from "../domain/corpus"
import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewRecordStore } from "../domain/review"
import { dueAt } from "./review-scheduling"

export async function loadWorkspaceSummary(input: {
  now?: Date
  ownerId: string
  reviewStore: ReviewRecordStore
  snapshotStore: CorpusSnapshotStore
}) {
  const now = input.now ?? new Date()
  const snapshots = await input.snapshotStore.listLatest(input.ownerId)
  const corpora = await Promise.all(
    snapshots.map(async (snapshot) => {
      const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
      const latestReviews = await input.reviewStore.latestForCorpus({
        corpusId: snapshot.corpusId,
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

      return {
        corpusId: snapshot.corpusId,
        dueCount,
        promptCount: activePrompts.length,
      }
    }),
  )
  const recentReviews = await input.reviewStore.recentForUser(input.ownerId, 6)
  const nextReviewAt = corpora.some((corpus) => corpus.dueCount > 0)
    ? null
    : ((
        await Promise.all(
          snapshots.map(async (snapshot) => {
            const latest = await input.reviewStore.latestForCorpus({
              corpusId: snapshot.corpusId,
              userId: input.ownerId,
            })
            return latest
              .map(dueAt)
              .filter((value): value is Date => value !== null)
          }),
        )
      )
        .flat()
        .sort((left, right) => left.getTime() - right.getTime())[0] ?? null)

  return {
    corpora,
    dueCount: corpora.reduce((sum, corpus) => sum + corpus.dueCount, 0),
    nextReviewAt: nextReviewAt?.toISOString() ?? null,
    recentReviews: recentReviews.map((review) => ({
      assessment: review.assessment,
      corpusId: review.corpusId,
      promptId: review.promptId,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    totalMemories: corpora.reduce((sum, corpus) => sum + corpus.promptCount, 0),
  }
}
