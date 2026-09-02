import {
  countDueRecalls,
  findNextRecallAt,
  selectNextRecall,
} from "@lineage/core/planning"

import type { ReviewContract } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { toRecallHistoryState } from "./review-scheduling"

export type QueuedPrompt = {
  dueAt: Date | null
  latest: ReviewHistoryEntry | null
  prompt: ReviewContract
  reviewed: boolean
}

export function selectNextPrompt(
  prompts: ReviewContract[],
  latestReviews: ReviewHistoryEntry[],
  now = new Date(),
): QueuedPrompt | null {
  return selectNextRecall<ReviewHistoryEntry>({
    asOf: now,
    latestReviews,
    prompts,
    toRecallState: toRecallHistoryState,
  })
}

export function countDuePrompts(
  prompts: ReviewContract[],
  latestReviews: ReviewHistoryEntry[],
  now = new Date(),
) {
  return countDueRecalls<ReviewHistoryEntry>({
    asOf: now,
    latestReviews,
    prompts,
    toRecallState: toRecallHistoryState,
  })
}

export function findNextReviewAt(latestReviews: ReviewHistoryEntry[]) {
  return findNextRecallAt<ReviewHistoryEntry>({
    latestReviews,
    toRecallState: toRecallHistoryState,
  })
}
