import type { ReviewContract } from "../domain/corpus"
import { capturesResponse, parseCorpusDocument } from "../domain/corpus"
import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import type { ReviewCore, ReviewRecordStore } from "../domain/review"
import { reviewAssessmentSchema } from "../domain/review"
import {
  countDuePrompts,
  findNextReviewAt,
  selectNextPrompt,
} from "./review-queue"
import {
  dueAt,
  isDue,
  previewReview,
  scheduleReview,
} from "./review-scheduling"

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
  const snapshot = await snapshotStore.latest(userId, corpusId)
  if (!snapshot) throw new Error("The selected review corpus was not found")
  const corpus = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const latestReviews = await reviewStore.latestForCorpus({
    corpusId: corpus.corpusId,
    userId,
  })
  const reviewedAt = new Date()
  const queued = selectNextPrompt(corpus.prompts, latestReviews, reviewedAt)
  const dueCount = countDuePrompts(corpus.prompts, latestReviews, reviewedAt)
  if (!queued) {
    return {
      assessmentPreviews: null,
      captureResponse: false as const,
      corpusId: corpus.corpusId,
      dueCount,
      presentation: [],
      prompt: null,
      queueDueAt: findNextReviewAt(latestReviews)?.toISOString() ?? null,
      queueReviewed: true,
      reviewedAt: reviewedAt.toISOString(),
      snapshotDigest: snapshot.digest,
    }
  }
  return {
    assessmentPreviews: previewReview(queued.latest, reviewedAt),
    captureResponse: capturesResponse(queued.prompt),
    corpusId: corpus.corpusId,
    dueCount,
    presentation: core.begin(queued.prompt),
    prompt: queued.prompt,
    queueDueAt: queued.dueAt?.toISOString() ?? null,
    queueReviewed: queued.reviewed,
    reviewedAt: reviewedAt.toISOString(),
    snapshotDigest: snapshot.digest,
  }
}

export async function loadReviewPrompt({
  corpusId,
  promptId,
  promptRevision,
  snapshotDigest,
  snapshotStore,
  userId,
}: {
  corpusId: string
  promptId: string
  promptRevision: number
  snapshotDigest: string
  snapshotStore: CorpusSnapshotStore
  userId: string
}) {
  const snapshot = await snapshotStore.find(userId, corpusId, snapshotDigest)
  if (!snapshot) return null
  const corpus = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  return (
    corpus.prompts.find(
      (prompt) => prompt.id === promptId && prompt.revision === promptRevision,
    ) ?? null
  )
}

export async function loadReviewProgress({
  corpusId,
  nextDueAt = null,
  promptId,
  store,
  userId,
}: {
  corpusId: string
  nextDueAt?: Date | null
  promptId: string | null
  store: ReviewRecordStore
  userId: string
}) {
  const [history, latest, reviewCount] = await Promise.all([
    store.recentForCorpus?.({ corpusId, limit: 10, userId }) ??
      store.recentForUser(userId, 10),
    promptId
      ? store.latestForPrompt({ corpusId, promptId, userId })
      : Promise.resolve(null),
    store.countForCorpus?.({ corpusId, userId }) ?? store.countForUser(userId),
  ])
  return {
    due: promptId ? isDue(latest) : false,
    dueAt: (promptId ? dueAt(latest) : nextDueAt)?.toISOString() ?? null,
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
  reviewedAt,
  store,
  userId,
}: {
  assessment: unknown
  attempt: string | null
  core: ReviewCore
  corpusId: string
  prompt: ReviewContract
  reviewedAt: Date
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
  const scheduling = scheduleReview(completed.assessment, previous, reviewedAt)
  await store.append({
    assessment: completed.assessment,
    attemptedResponse: completed.attempt,
    corpusId,
    promptId: prompt.id,
    promptRevision: prompt.revision,
    reviewedAt,
    userId,
    ...scheduling,
  })
  return { ...completed, nextIntervalMinutes: scheduling.nextIntervalMinutes }
}
