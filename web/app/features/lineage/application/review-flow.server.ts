import type { ReviewContract } from "../domain/corpus"
import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewCore, ReviewRecordStore } from "../domain/review"
import { reviewAssessmentSchema } from "../domain/review"
import { exportCorpus } from "./import-corpus.server"
import { selectNextPrompt } from "./review-queue"
import { dueAt, isDue, scheduleReview } from "./review-scheduling"

export async function listReviewCorpora({
  snapshotStore,
  userId,
}: {
  snapshotStore: CorpusSnapshotStore
  userId: string
}) {
  return (await snapshotStore.listLatest(userId)).map((snapshot) => ({
    corpusId: snapshot.corpusId,
    formatVersion: snapshot.formatVersion,
  }))
}

export async function loadReview({
  core,
  corpusId,
  reviewStore,
  snapshotStore,
  userId,
}: {
  core: ReviewCore
  corpusId: string
  reviewStore: ReviewRecordStore
  snapshotStore: CorpusSnapshotStore
  userId: string
}) {
  const corpus = await exportCorpus({
    corpusId,
    ownerId: userId,
    store: snapshotStore,
  })
  if (!corpus) throw new Error("The selected review corpus was not found")
  const latestReviews = await reviewStore.latestForCorpus({
    corpusId: corpus.corpusId,
    userId,
  })
  const queued = selectNextPrompt(corpus.prompts, latestReviews)
  if (!queued) throw new Error("The review corpus contains no Prompts")
  return {
    corpusId: corpus.corpusId,
    presentation: core.begin(queued.prompt),
    prompt: queued.prompt,
    queueDueAt: queued.dueAt?.toISOString() ?? null,
    queueReviewed: queued.reviewed,
  }
}

export async function loadReviewProgress({
  corpusId,
  promptId,
  store,
  userId,
}: {
  corpusId: string
  promptId: string
  store: ReviewRecordStore
  userId: string
}) {
  const [history, latest, reviewCount] = await Promise.all([
    store.recentForUser(userId, 10),
    store.latestForPrompt({ corpusId, promptId, userId }),
    store.countForUser(userId),
  ])
  return {
    due: isDue(latest),
    dueAt: dueAt(latest)?.toISOString() ?? null,
    history: history.map((review) => ({
      assessment: review.assessment,
      attemptedResponse: review.attemptedResponse,
      nextIntervalMinutes: review.nextIntervalMinutes,
      promptId: review.promptId,
      reviewedAt: review.reviewedAt.toISOString(),
    })),
    reviewCount,
  }
}

export function resolveReview({
  attempt,
  core,
  prompt,
}: {
  attempt: string | null
  core: ReviewCore
  prompt: ReviewContract
}) {
  return core.resolve(prompt, attempt?.trim() || null)
}

export async function completeReview({
  assessment,
  attempt,
  core,
  corpusId,
  prompt,
  store,
  userId,
}: {
  assessment: unknown
  attempt: string | null
  core: ReviewCore
  corpusId: string
  prompt: ReviewContract
  store: ReviewRecordStore
  userId: string
}) {
  const parsedAssessment = reviewAssessmentSchema.parse(assessment)
  const completed = core.complete(
    prompt,
    attempt?.trim() || null,
    parsedAssessment,
  )
  const previous = await store.latestForPrompt({
    corpusId,
    promptId: prompt.id,
    userId,
  })
  await store.append({
    assessment: completed.assessment,
    attemptedResponse: completed.attempt,
    corpusId,
    promptId: prompt.id,
    promptRevision: prompt.revision,
    userId,
    ...scheduleReview(completed.assessment, previous),
  })
  return completed
}
