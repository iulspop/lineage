import { afterEach, beforeEach, describe, expect, test } from "vitest"

import { corpusSnapshotStore } from "./corpus-model.server"
import { prisma } from "~/utils/db.server"

const owner1 = "lineage-owner-1"
const owner2 = "lineage-owner-2"

beforeEach(async () => {
  await prisma.user.createMany({
    data: [
      { email: "lineage-owner-1@example.com", id: owner1 },
      { email: "lineage-owner-2@example.com", id: owner2 },
    ],
  })
})

afterEach(async () => {
  await prisma.lineageCorpusSnapshot.deleteMany()
  await prisma.user.deleteMany({ where: { id: { in: [owner1, owner2] } } })
})

describe("corpusSnapshotStore", () => {
  test("appends immutable snapshots and returns the owner's latest", async () => {
    await corpusSnapshotStore.append(owner1, {
      canonicalJson: '{"revision":1}',
      corpusId: "corpus-1",
      digest: "digest-1",
      formatVersion: 1,
    })
    await new Promise((resolve) => setTimeout(resolve, 2))
    await corpusSnapshotStore.append(owner1, {
      canonicalJson: '{"revision":2}',
      corpusId: "corpus-1",
      digest: "digest-2",
      formatVersion: 1,
    })

    await expect(
      corpusSnapshotStore.latest(owner1, "corpus-1"),
    ).resolves.toEqual({
      canonicalJson: '{"revision":2}',
      corpusId: "corpus-1",
      digest: "digest-2",
      formatVersion: 1,
    })
  })

  test("deduplicates a repeated canonical snapshot per owner", async () => {
    const snapshot = {
      canonicalJson: "{}",
      corpusId: "corpus-1",
      digest: "digest-1",
      formatVersion: 1,
    }
    await corpusSnapshotStore.append(owner1, snapshot)
    await corpusSnapshotStore.append(owner1, snapshot)
    await corpusSnapshotStore.append(owner2, snapshot)

    await expect(prisma.lineageCorpusSnapshot.count()).resolves.toBe(2)
  })

  test("rejects cross-owner reads", async () => {
    await corpusSnapshotStore.append(owner1, {
      canonicalJson: "{}",
      corpusId: "private-corpus",
      digest: "private-digest",
      formatVersion: 1,
    })

    await expect(
      corpusSnapshotStore.latest(owner2, "private-corpus"),
    ).resolves.toBeNull()
  })

  test("does not expose legacy unowned snapshots", async () => {
    await prisma.lineageCorpusSnapshot.create({
      data: {
        canonicalJson: "{}",
        corpusId: "legacy-corpus",
        digest: "legacy-digest",
        formatVersion: 1,
      },
    })

    await expect(
      corpusSnapshotStore.latest(owner1, "legacy-corpus"),
    ).resolves.toBeNull()
  })
})
