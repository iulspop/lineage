import { afterEach, describe, expect, test } from "vitest"

import { corpusSnapshotStore } from "./corpus-model.server"
import { prisma } from "~/utils/db.server"

afterEach(async () => {
  await prisma.lineageCorpusSnapshot.deleteMany()
})

describe("corpusSnapshotStore", () => {
  test("appends immutable snapshots and returns the latest", async () => {
    await corpusSnapshotStore.append({
      canonicalJson: '{"revision":1}',
      corpusId: "corpus-1",
      digest: "digest-1",
      formatVersion: 1,
    })
    await new Promise((resolve) => setTimeout(resolve, 2))
    await corpusSnapshotStore.append({
      canonicalJson: '{"revision":2}',
      corpusId: "corpus-1",
      digest: "digest-2",
      formatVersion: 1,
    })

    await expect(corpusSnapshotStore.latest("corpus-1")).resolves.toEqual({
      canonicalJson: '{"revision":2}',
      corpusId: "corpus-1",
      digest: "digest-2",
      formatVersion: 1,
    })
  })

  test("deduplicates a repeated canonical snapshot", async () => {
    const snapshot = {
      canonicalJson: "{}",
      corpusId: "corpus-1",
      digest: "digest-1",
      formatVersion: 1,
    }
    await corpusSnapshotStore.append(snapshot)
    await corpusSnapshotStore.append(snapshot)

    await expect(prisma.lineageCorpusSnapshot.count()).resolves.toBe(1)
  })
})
