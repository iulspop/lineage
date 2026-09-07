import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import {
  canRestoreDeletedMemory,
  deletedAtForPrompt,
  deleteMemory,
  listRestorableDeletedMemories,
  restoreDeletedMemory,
} from "./delete-memory.server"
import { StaleCorpusSnapshotError } from "./update-memory-status.server"

const document = {
  corpusId: "calculus",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      challenge: ["What is a derivative?"],
      id: "derivative",
      provenance: [],
      resolution: ["An instantaneous rate of change."],
      response: { capture: "none", mode: "self-check" },
      revision: 2,
      status: "active",
      withheld: ["An instantaneous rate of change."],
    },
  ],
  provenance: [],
}

function setupStore() {
  let latest = {
    canonicalJson: JSON.stringify(document),
    corpusId: document.corpusId,
    digest: "base-digest",
    formatVersion: 1,
  }
  const store: CorpusSnapshotStore = {
    append: async (_ownerId, snapshot) => {
      latest = snapshot
    },
    find: async () => null,
    latest: async () => latest,
    listLatest: async () => [latest],
  }
  return { getLatest: () => latest, store }
}

const validator = { isValid: () => true }

describe("restorable Memory deletion", () => {
  test("retires a Memory, records deletion provenance, and restores it within 30 days", async () => {
    const { getLatest, store } = setupStore()
    const deletedAt = new Date("2026-09-07T12:00:00.000Z")

    const deleted = await deleteMemory({
      baseDigest: "base-digest",
      corpusId: "calculus",
      now: deletedAt,
      ownerId: "owner-1",
      promptId: "derivative",
      store,
      validator,
    })

    expect(deleted).not.toBeNull()
    if (!deleted) throw new Error("Expected the Memory to be deleted")
    expect(deleted.document.prompts[0]).toMatchObject({
      revision: 3,
      status: "retired",
    })
    expect(deletedAtForPrompt(deleted.document, "derivative")).toBe(
      deletedAt.toISOString(),
    )
    expect(
      listRestorableDeletedMemories(deleted.document, deletedAt),
    ).toHaveLength(1)

    const restored = await restoreDeletedMemory({
      baseDigest: getLatest().digest,
      corpusId: "calculus",
      now: new Date("2026-10-06T12:00:00.000Z"),
      ownerId: "owner-1",
      promptId: "derivative",
      store,
      validator,
    })

    expect(restored?.document.prompts[0]).toMatchObject({
      revision: 4,
      status: "active",
    })
  })

  test("rejects restoration after the 30-day window", async () => {
    expect(
      canRestoreDeletedMemory(
        "2026-09-07T12:00:00.000Z",
        new Date("2026-10-07T12:00:00.000Z"),
      ),
    ).toBe(false)
  })

  test("rejects deletion from a stale immutable snapshot", async () => {
    const { store } = setupStore()

    await expect(
      deleteMemory({
        baseDigest: "older-digest",
        corpusId: "calculus",
        now: new Date("2026-09-07T12:00:00.000Z"),
        ownerId: "owner-1",
        promptId: "derivative",
        store,
        validator,
      }),
    ).rejects.toBeInstanceOf(StaleCorpusSnapshotError)
  })
})
