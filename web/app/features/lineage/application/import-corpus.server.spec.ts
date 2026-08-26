import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import {
  exportCorpus,
  InvalidReviewContractError,
  importCorpus,
} from "./import-corpus.server"

function memoryStore(): CorpusSnapshotStore {
  const snapshots = new Map<
    string,
    Parameters<CorpusSnapshotStore["append"]>[1]
  >()
  return {
    async append(ownerId, snapshot) {
      snapshots.set(`${ownerId}:${snapshot.corpusId}`, snapshot)
    },
    async find(ownerId, corpusId, digest) {
      const value = snapshots.get(`${ownerId}:${corpusId}`) ?? null
      return value?.digest === digest ? value : null
    },
    async latest(ownerId, corpusId) {
      return snapshots.get(`${ownerId}:${corpusId}`) ?? null
    },
    async listLatest(ownerId) {
      return [...snapshots.entries()]
        .filter(([key]) => key.startsWith(`${ownerId}:`))
        .map(([, snapshot]) => snapshot)
    },
  }
}

const document = {
  corpusId: "corpus-1",
  format: "lineage.corpus",
  formatVersion: 1,
  prompts: [
    {
      challenge: ["What is the capital of France?"],
      id: "prompt-1",
      resolution: ["What is the capital of France?", "Paris"],
      response: "text",
      revision: 1,
      withheld: ["Paris"],
    },
  ],
} as const

describe("corpus import and export", () => {
  test("persists a canonical snapshot after semantic validation", async () => {
    const store = memoryStore()
    const imported = await importCorpus({
      input: document,
      ownerId: "user-1",
      store,
      validator: { isValid: () => true },
    })

    expect(imported.digest).toMatch(/^[a-f0-9]{64}$/)
    await expect(
      exportCorpus({ corpusId: "corpus-1", ownerId: "user-1", store }),
    ).resolves.toEqual({
      ...document,
      assets: [],
      prompts: [{ ...document.prompts[0], kind: "basic" }],
    })
  })

  test("does not export another owner's corpus snapshot", async () => {
    const store = memoryStore()
    await importCorpus({
      input: document,
      ownerId: "user-1",
      store,
      validator: { isValid: () => true },
    })

    await expect(
      exportCorpus({ corpusId: "corpus-1", ownerId: "user-2", store }),
    ).resolves.toBeNull()
  })

  test("rejects disclosure-unsafe prompts before persistence", async () => {
    await expect(
      importCorpus({
        input: document,
        ownerId: "user-1",
        store: memoryStore(),
        validator: { isValid: () => false },
      }),
    ).rejects.toEqual(new InvalidReviewContractError("prompt-1"))
  })
})
