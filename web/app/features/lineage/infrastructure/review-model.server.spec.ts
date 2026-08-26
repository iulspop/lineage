import { afterEach, describe, expect, test } from "vitest"

import { reviewRecordStore } from "./review-model.server"
import { prisma } from "~/utils/db.server"

afterEach(async () => {
  await prisma.lineageReview.deleteMany()
  await prisma.user.deleteMany({
    where: { email: "lineage-review@example.com" },
  })
})

describe("reviewRecordStore", () => {
  test("appends review facts and counts them for the learner", async () => {
    const user = await prisma.user.create({
      data: { email: "lineage-review@example.com" },
    })

    await reviewRecordStore.append({
      assessment: "good",
      attemptedResponse: "Paris",
      corpusId: "lineage-demo",
      nextIntervalMinutes: 1440,
      previousIntervalMinutes: 0,
      promptId: "capital-of-france",
      promptRevision: 1,
      scheduler: "lineage-prototype",
      schedulerVersion: "1",
      userId: user.id,
    })

    await expect(reviewRecordStore.countForUser(user.id)).resolves.toBe(1)
    await expect(
      reviewRecordStore.latestForPrompt({
        corpusId: "lineage-demo",
        promptId: "capital-of-france",
        userId: user.id,
      }),
    ).resolves.toMatchObject({
      assessment: "good",
      attemptedResponse: "Paris",
      nextIntervalMinutes: 1440,
      promptRevision: 1,
      scheduler: "lineage-prototype",
    })
    await expect(
      reviewRecordStore.recentForUser(user.id, 10),
    ).resolves.toHaveLength(1)
  })
})
