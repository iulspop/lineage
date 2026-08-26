import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import {
  StaleCorpusSnapshotError,
  updateMemoryStatus,
} from "./update-memory-status.server"

const document = {
  corpusId: "calculus",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      challenge: ["What is a derivative?"],
      id: "derivative",
      resolution: ["An instantaneous rate of change."],
      response: { capture: "none", mode: "self-check" },
      revision: 2,
      withheld: ["An instantaneous rate of change."],
    },
  ],
}

function setupStore() {
  const appended: Array<{ ownerId: string; snapshot: unknown }> = []
  const snapshot = {
    canonicalJson: JSON.stringify(document),
    corpusId: document.corpusId,
    digest: "base-digest",
    formatVersion: 1,
  }
  const store: CorpusSnapshotStore = {
    append: async (ownerId, value) => {
      appended.push({ ownerId, snapshot: value })
    },
    find: async () => null,
    latest: async () => snapshot,
    listLatest: async () => [snapshot],
  }
  return { appended, store }
}

describe("updateMemoryStatus", () => {
  test("creates an immutable snapshot with an incremented memory revision", async () => {
    const { appended, store } = setupStore()

    const result = await updateMemoryStatus({
      baseDigest: "base-digest",
      corpusId: "calculus",
      ownerId: "owner-1",
      promptId: "derivative",
      status: "suspended",
      store,
      validator: { isValid: () => true },
    })

    expect(result?.document.prompts[0]).toMatchObject({
      id: "derivative",
      revision: 3,
      status: "suspended",
    })
    expect(appended).toHaveLength(1)
    expect(appended[0]?.ownerId).toBe("owner-1")
  })

  test("rejects an action based on a stale immutable snapshot", async () => {
    const { store } = setupStore()

    await expect(
      updateMemoryStatus({
        baseDigest: "older-digest",
        corpusId: "calculus",
        ownerId: "owner-1",
        promptId: "derivative",
        status: "suspended",
        store,
        validator: { isValid: () => true },
      }),
    ).rejects.toBeInstanceOf(StaleCorpusSnapshotError)
  })
})
