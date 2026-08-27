import type { Prisma } from "generated/prisma/client"

import type { ReviewHistoryEntry, ReviewRecordStore } from "../domain/review"
import { reviewAssessmentSchema } from "../domain/review"
import { prisma } from "~/utils/db.server"

const reviewSelect = {
  assessment: true,
  attemptedResponse: true,
  corpusId: true,
  fsrsDifficulty: true,
  fsrsDueAt: true,
  fsrsElapsedDays: true,
  fsrsLapses: true,
  fsrsLearningSteps: true,
  fsrsReps: true,
  fsrsScheduledDays: true,
  fsrsStability: true,
  fsrsState: true,
  id: true,
  nextIntervalMinutes: true,
  parameterSet: true,
  previousIntervalMinutes: true,
  promptId: true,
  promptRevision: true,
  reviewedAt: true,
  scheduler: true,
  schedulerImplementation: true,
  schedulerProfile: true,
  schedulerVersion: true,
  userId: true,
} satisfies Prisma.LineageReviewSelect

type ReviewRow = Prisma.LineageReviewGetPayload<{ select: typeof reviewSelect }>

function toHistoryEntry(row: ReviewRow): ReviewHistoryEntry {
  return {
    ...row,
    assessment: reviewAssessmentSchema.parse(row.assessment),
  }
}

export async function listUserReviewHistory(input: {
  limit?: number
  userId: string
}) {
  const reviews = await prisma.lineageReview.findMany({
    orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
    select: reviewSelect,
    take: input.limit,
    where: { userId: input.userId },
  })
  return reviews.map(toHistoryEntry)
}

export async function listCorpusReviewHistory(input: {
  corpusId: string
  limit?: number
  promptId?: string
  userId: string
}) {
  const reviews = await prisma.lineageReview.findMany({
    orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
    select: reviewSelect,
    take: input.limit,
    where: {
      corpusId: input.corpusId,
      promptId: input.promptId,
      userId: input.userId,
    },
  })
  return reviews.map(toHistoryEntry)
}

export const reviewRecordStore: ReviewRecordStore = {
  async append(record) {
    await prisma.lineageReview.create({ data: record })
  },

  countForCorpus({ corpusId, userId }) {
    return prisma.lineageReview.count({ where: { corpusId, userId } })
  },

  countForUser(userId) {
    return prisma.lineageReview.count({ where: { userId } })
  },

  async latestForCorpus({ corpusId, userId }) {
    const reviews = await prisma.lineageReview.findMany({
      distinct: ["promptId"],
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      select: reviewSelect,
      where: { corpusId, userId },
    })
    return reviews.map(toHistoryEntry)
  },

  async latestForPrompt({ corpusId, promptId, userId }) {
    const review = await prisma.lineageReview.findFirst({
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      select: reviewSelect,
      where: { corpusId, promptId, userId },
    })
    return review ? toHistoryEntry(review) : null
  },

  async recentForCorpus({ corpusId, limit, userId }) {
    const reviews = await prisma.lineageReview.findMany({
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      select: reviewSelect,
      take: limit,
      where: { corpusId, userId },
    })
    return reviews.map(toHistoryEntry)
  },

  async recentForUser(userId, limit) {
    const reviews = await prisma.lineageReview.findMany({
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      select: reviewSelect,
      take: limit,
      where: { userId },
    })
    return reviews.map(toHistoryEntry)
  },
}
