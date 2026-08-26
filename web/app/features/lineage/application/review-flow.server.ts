import type { ReviewContract } from "../domain/corpus"
import type {
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import type { ReviewCore, ReviewRecordStore } from "../domain/review"
import {
  demoReviewContract,
  REVIEW_CORPUS_ID,
  reviewAssessmentSchema,
} from "../domain/review"
import { exportCorpus, importCorpus } from "./import-corpus.server"
import { selectNextPrompt } from "./review-queue"
import { dueAt, isDue, scheduleReview } from "./review-scheduling"

const demoCorpus = {
  corpusId: REVIEW_CORPUS_ID,
  format: "lineage.corpus" as const,
  formatVersion: 1 as const,
  prompts: [
    demoReviewContract,
    {
      challenge: ["Which planet is known as the Red Planet?"],
      id: "red-planet",
      resolution: ["Which planet is known as the Red Planet?", "Mars"],
      response: "text",
      revision: 1,
      withheld: ["Mars"],
    },
  ],
}

export async function loadReview({
  core,
  reviewStore,
  snapshotStore,
  userId,
  validator,
}: {
  core: ReviewCore
  reviewStore: ReviewRecordStore
  snapshotStore: CorpusSnapshotStore
  userId: string
  validator: ReviewContractValidator
}) {
  let corpus = await exportCorpus({
    corpusId: REVIEW_CORPUS_ID,
    ownerId: userId,
    store: snapshotStore,
  })
  if (!corpus) {
    corpus = (
      await importCorpus({
        input: demoCorpus,
        ownerId: userId,
        store: snapshotStore,
        validator,
      })
    ).document
  }
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
