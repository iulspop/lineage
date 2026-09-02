import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { corpusSnapshotStore } from "./corpus-model.server"
import { prisma } from "~/utils/db.server"

let ownerId: string
const corpusId = "optimistic-corpus"
const base = {
  canonicalJson: "{}",
  corpusId,
  digest: "base-digest",
  formatVersion: 1,
}

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      activeLineageCorpusId: corpusId,
      email: `optimistic-${crypto.randomUUID()}@example.com`,
    },
  })
  ownerId = user.id
  await corpusSnapshotStore.append(ownerId, base)
})

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: ownerId } })
})

describe("corpusSnapshotStore.compareAndAppend", () => {
  it("appends only from the active latest snapshot", async () => {
    await expect(
      corpusSnapshotStore.compareAndAppend(
        ownerId,
        { corpusId, digest: base.digest },
        { ...base, digest: "next-digest" },
      ),
    ).resolves.toEqual({ status: "appended" })
  })

  it("rejects stale snapshots without appending", async () => {
    await corpusSnapshotStore.append(ownerId, {
      ...base,
      digest: "newer-digest",
    })
    await expect(
      corpusSnapshotStore.compareAndAppend(
        ownerId,
        { corpusId, digest: base.digest },
        { ...base, digest: "stale-successor" },
      ),
    ).resolves.toEqual({ reason: "snapshot-changed", status: "conflict" })
    await expect(
      corpusSnapshotStore.find(ownerId, corpusId, "stale-successor"),
    ).resolves.toBeNull()
  })

  it("rejects an active workspace switch", async () => {
    await prisma.user.update({
      data: { activeLineageCorpusId: "another-corpus" },
      where: { id: ownerId },
    })
    await expect(
      corpusSnapshotStore.compareAndAppend(
        ownerId,
        { corpusId, digest: base.digest },
        { ...base, digest: "wrong-workspace" },
      ),
    ).resolves.toEqual({
      reason: "active-corpus-changed",
      status: "conflict",
    })
  })
})
