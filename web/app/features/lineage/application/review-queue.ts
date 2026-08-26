import type { ReviewContract } from "../domain/corpus"
import type { ReviewHistoryEntry } from "../domain/review"
import { dueAt } from "./review-scheduling"

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
  const reviewsByPrompt = new Map(
    latestReviews.map((review) => [review.promptId, review]),
  )
  const queue = prompts.map((prompt, corpusOrder) => {
    const latest = reviewsByPrompt.get(prompt.id) ?? null
    const promptDueAt = dueAt(latest)
    const priority = !latest ? 1 : promptDueAt && promptDueAt <= now ? 0 : 2
    return {
      corpusOrder,
      dueAt: promptDueAt,
      latest,
      priority,
      prompt,
      reviewed: latest !== null,
    }
  })
  queue.sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority
    if (left.priority !== 1) {
      const dueDifference =
        (left.dueAt?.getTime() ?? 0) - (right.dueAt?.getTime() ?? 0)
      if (dueDifference !== 0) return dueDifference
    }
    return left.corpusOrder - right.corpusOrder
  })
  return queue[0] ?? null
}
