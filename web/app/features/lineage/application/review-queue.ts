import type { ReviewContract } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { dueAt } from "./review-scheduling"

export type QueuedPrompt = {
  dueAt: Date | null
  prompt: ReviewContract
  reviewed: boolean
}

export function selectNextPrompt(
  prompts: ReviewContract[],
  latestReviews: ReviewHistoryEntry[],
): QueuedPrompt | null {
  const latestByPrompt = new Map(
    latestReviews.map((review) => [review.promptId, review]),
  )
  const queue = prompts.map((prompt, corpusOrder) => {
    const latest = latestByPrompt.get(prompt.id) ?? null
    return {
      corpusOrder,
      dueAt: dueAt(latest),
      prompt,
      reviewed: latest !== null,
    }
  })

  queue.sort((left, right) => {
    if (!left.reviewed && right.reviewed) return -1
    if (left.reviewed && !right.reviewed) return 1
    if (left.dueAt && right.dueAt) {
      const dueDifference = left.dueAt.getTime() - right.dueAt.getTime()
      if (dueDifference !== 0) return dueDifference
    }
    return left.corpusOrder - right.corpusOrder
  })

  return queue[0] ?? null
}
