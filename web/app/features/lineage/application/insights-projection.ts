import type { CorpusDocument } from "../domain/corpus"
import type { ReviewAssessment, ReviewHistoryEntry } from "../domain/review"
import { dueAt } from "./review-scheduling"

const assessments: ReviewAssessment[] = ["again", "hard", "good", "easy"]

export type InsightsProjection = ReturnType<typeof projectInsights>

function dayKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).format(date)
}

export function projectInsights(input: {
  corpora: CorpusDocument[]
  now?: Date
  reviews: ReviewHistoryEntry[]
  timeZone?: string
}) {
  const now = input.now ?? new Date()
  const timeZone = input.timeZone ?? "UTC"
  const ratingDistribution = Object.fromEntries(
    assessments.map((assessment) => [
      assessment,
      input.reviews.filter((review) => review.assessment === assessment).length,
    ]),
  ) as Record<ReviewAssessment, number>
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now)
    date.setUTCDate(now.getUTCDate() - (6 - index))
    const dateKey = dayKey(date, timeZone)
    return {
      count: input.reviews.filter(
        (review) => dayKey(review.reviewedAt, timeZone) === dateKey,
      ).length,
      date: dateKey,
    }
  })
  const latestByMemory = new Map<string, ReviewHistoryEntry>()
  const difficulty = new Map<
    string,
    {
      again: number
      corpusId: string
      hard: number
      promptId: string
      total: number
    }
  >()
  for (const review of input.reviews) {
    const key = `${review.corpusId}\0${review.promptId}`
    if (!latestByMemory.has(key)) latestByMemory.set(key, review)
    const current = difficulty.get(key) ?? {
      again: 0,
      corpusId: review.corpusId,
      hard: 0,
      promptId: review.promptId,
      total: 0,
    }
    current.total += 1
    if (review.assessment === "again") current.again += 1
    if (review.assessment === "hard") current.hard += 1
    difficulty.set(key, current)
  }
  const corpusWorkload = input.corpora.map((corpus) => {
    const active = corpus.prompts.filter((prompt) => prompt.status === "active")
    let due = 0
    let upcoming = 0
    for (const prompt of active) {
      const review =
        latestByMemory.get(`${corpus.corpusId}\0${prompt.id}`) ?? null
      const scheduled = dueAt(review)
      if (!review || (scheduled && scheduled <= now)) due += 1
      else if (scheduled) upcoming += 1
    }
    return {
      corpusId: corpus.corpusId,
      due,
      memories: active.length,
      reviews: input.reviews.filter(
        (review) => review.corpusId === corpus.corpusId,
      ).length,
      upcoming,
    }
  })

  return {
    corpusWorkload,
    dailyActivity,
    difficultMemories: [...difficulty.values()]
      .filter((memory) => memory.again > 0 || memory.hard > 0)
      .sort(
        (left, right) =>
          right.again - left.again ||
          right.hard - left.hard ||
          right.total - left.total,
      )
      .slice(0, 10),
    ratingDistribution,
    summary: {
      activeMemories: corpusWorkload.reduce(
        (sum, corpus) => sum + corpus.memories,
        0,
      ),
      dueNow: corpusWorkload.reduce((sum, corpus) => sum + corpus.due, 0),
      reviewedLast7Days: dailyActivity.reduce((sum, day) => sum + day.count, 0),
      totalReviews: input.reviews.length,
    },
    timeline: input.reviews.map((review) => ({
      assessment: review.assessment,
      corpusId: review.corpusId,
      id: review.id,
      nextIntervalMinutes: review.nextIntervalMinutes,
      promptId: review.promptId,
      promptRevision: review.promptRevision,
      reviewedAt: review.reviewedAt.toISOString(),
      scheduler: review.scheduler,
      schedulerVersion: review.schedulerVersion,
    })),
  }
}
