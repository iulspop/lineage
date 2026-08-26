import type { ReviewHistoryEntry, ReviewRecordStore } from "../domain/review"
import { reviewAssessmentSchema } from "../domain/review"
import { prisma } from "~/utils/db.server"

function toHistoryEntry(
  record: NonNullable<
    Awaited<ReturnType<typeof prisma.lineageReview.findFirst>>
  >,
) {
  return {
    ...record,
    assessment: reviewAssessmentSchema.parse(record.assessment),
  } satisfies ReviewHistoryEntry
}

export const reviewRecordStore: ReviewRecordStore = {
  async append(record) {
    await prisma.lineageReview.create({ data: record })
  },
  async countForUser(userId) {
    return prisma.lineageReview.count({ where: { userId } })
  },
  async latestForCorpus({ corpusId, userId }) {
    const records = await prisma.lineageReview.findMany({
      orderBy: [{ reviewedAt: "desc" }, { id: "desc" }],
      where: { corpusId, userId },
    })
    const latest = new Map<string, ReviewHistoryEntry>()
    for (const record of records) {
      if (!latest.has(record.promptId)) {
        latest.set(record.promptId, toHistoryEntry(record))
      }
    }
    return [...latest.values()]
  },
  async latestForPrompt({ corpusId, promptId, userId }) {
    const record = await prisma.lineageReview.findFirst({
      orderBy: { reviewedAt: "desc" },
      where: { corpusId, promptId, userId },
    })
    return record ? toHistoryEntry(record) : null
  },
  async recentForUser(userId, limit) {
    const records = await prisma.lineageReview.findMany({
      orderBy: { reviewedAt: "desc" },
      take: limit,
      where: { userId },
    })
    return records.map(toHistoryEntry)
  },
}
