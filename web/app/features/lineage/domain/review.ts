import { z } from "zod"

import type { ReviewContract } from "./corpus"

export const reviewAssessmentSchema = z.enum(["again", "hard", "good", "easy"])
export type ReviewAssessment = z.infer<typeof reviewAssessmentSchema>

export type ReviewResolution = {
  attempt: string | null
  presentation: string[]
}

export type CompletedReview = ReviewResolution & {
  assessment: ReviewAssessment
}

export type ReviewCore = {
  begin(contract: ReviewContract): string[]
  resolve(contract: ReviewContract, attempt: string | null): ReviewResolution
  complete(
    contract: ReviewContract,
    attempt: string | null,
    assessment: ReviewAssessment,
  ): CompletedReview
}

export type ReviewRecord = {
  assessment: ReviewAssessment
  attemptedResponse: string | null
  corpusId: string
  nextIntervalMinutes: number
  previousIntervalMinutes: number
  promptId: string
  promptRevision: number
  scheduler: string
  schedulerVersion: string
  userId: string
}

export type ReviewHistoryEntry = ReviewRecord & {
  id: number
  reviewedAt: Date
}

export type ReviewRecordStore = {
  append(record: ReviewRecord): Promise<void>
  countForUser(userId: string): Promise<number>
  latestForCorpus(input: {
    corpusId: string
    userId: string
  }): Promise<ReviewHistoryEntry[]>
  latestForPrompt(input: {
    corpusId: string
    promptId: string
    userId: string
  }): Promise<ReviewHistoryEntry | null>
  recentForUser(userId: string, limit: number): Promise<ReviewHistoryEntry[]>
}
