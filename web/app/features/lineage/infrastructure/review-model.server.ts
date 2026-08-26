import type { ReviewRecordStore } from "../domain/review"
import { prisma } from "~/utils/db.server"

export const reviewRecordStore: ReviewRecordStore = {
  async append(record) {
    await prisma.lineageReview.create({ data: record })
  },
  async countForUser(userId) {
    return prisma.lineageReview.count({ where: { userId } })
  },
}
