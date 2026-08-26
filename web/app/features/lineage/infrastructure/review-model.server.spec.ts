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
      fsrsDifficulty: 2.1,
      fsrsDueAt: new Date("2026-08-26T12:10:00.000Z"),
      fsrsElapsedDays: 0,
      fsrsLapses: 0,
      fsrsLearningSteps: 1,
      fsrsReps: 1,
      fsrsScheduledDays: 0,
      fsrsStability: 2.3,
      fsrsState: 1,
      nextIntervalMinutes: 10,
      parameterSet:
        "sha256:68ec99cf2c9d3129f7e81f0ad77aaf08892e68417f3809d85c37442708dc6732",
      previousIntervalMinutes: 0,
      promptId: "capital-of-france",
      promptRevision: 1,
      reviewedAt: new Date("2026-08-26T12:00:00.000Z"),
      scheduler: "fsrs",
      schedulerImplementation: "ts-fsrs@5.4.1",
      schedulerProfile: "fsrs-6-default-r90-v1",
      schedulerVersion: "6",
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
      fsrsDueAt: new Date("2026-08-26T12:10:00.000Z"),
      nextIntervalMinutes: 10,
      parameterSet:
        "sha256:68ec99cf2c9d3129f7e81f0ad77aaf08892e68417f3809d85c37442708dc6732",
      promptRevision: 1,
      scheduler: "fsrs",
    })
    await expect(
      reviewRecordStore.recentForUser(user.id, 10),
    ).resolves.toHaveLength(1)
    await expect(
      reviewRecordStore.latestForCorpus({
        corpusId: "lineage-demo",
        userId: user.id,
      }),
    ).resolves.toMatchObject([
      {
        promptId: "capital-of-france",
        promptRevision: 1,
      },
    ])
  })
})
