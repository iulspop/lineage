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

const demoCorpus = {
  corpusId: REVIEW_CORPUS_ID,
  format: "lineage.corpus" as const,
  formatVersion: 1 as const,
  prompts: [demoReviewContract],
}

export async function loadReview({
  core,
  snapshotStore,
  validator,
}: {
  core: ReviewCore
  snapshotStore: CorpusSnapshotStore
  validator: ReviewContractValidator
}) {
  let corpus = await exportCorpus({
    corpusId: REVIEW_CORPUS_ID,
    store: snapshotStore,
  })
  if (!corpus) {
    corpus = (
      await importCorpus({ input: demoCorpus, store: snapshotStore, validator })
    ).document
  }
  const prompt = corpus.prompts[0]
  if (!prompt) throw new Error("The review corpus contains no Prompts")
  return { corpusId: corpus.corpusId, presentation: core.begin(prompt), prompt }
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
  await store.append({
    assessment: completed.assessment,
    attemptedResponse: completed.attempt,
    corpusId,
    promptId: prompt.id,
    promptRevision: prompt.revision,
    userId,
  })
  return completed
}
