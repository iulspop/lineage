import { describe, expect, test } from "vitest"

import type { CorpusSnapshotStore } from "../domain/corpus-ports"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import {
  acceptMemoryRevision,
  previewMemoryRevision,
} from "./revise-memory.server"
import { StaleCorpusSnapshotError } from "./update-memory-status.server"

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
  const appended: unknown[] = []
  const snapshot = {
    canonicalJson: JSON.stringify(document),
    corpusId: document.corpusId,
    digest: "base-digest",
    formatVersion: 1,
  }
  const store: CorpusSnapshotStore = {
    append: async (_ownerId, value) => {
      appended.push(value)
    },
    find: async () => null,
    latest: async () => snapshot,
    listLatest: async () => [snapshot],
  }
  return { appended, store }
}

describe("memory revisions", () => {
  test("previews and accepts an incremented immutable revision", async () => {
    const { appended, store } = setupStore()
    const result = await previewMemoryRevision({
      baseDigest: "base-digest",
      corpusId: "calculus",
      draft: {
        answer: "The instantaneous rate of change of a function.",
        challenge: "What does a derivative measure?",
        corpusId: "calculus",
        kind: "basic",
        promptId: "derivative",
        responseMode: "self-check",
      },
      ownerId: "owner-1",
      promptId: "derivative",
      store,
      validator: lineageRuntime,
    })

    expect(result?.valid).toBe(true)
    if (!result?.valid) throw new Error("Expected a valid revision preview")
    expect(result.preview.nextRevision).toBe(3)
    expect(result.preview.changedFields).toEqual(
      expect.arrayContaining(["challenge", "withheld", "resolution"]),
    )

    const accepted = await acceptMemoryRevision({
      baseDigest: "base-digest",
      candidateJson: result.preview.canonicalJson,
      corpusId: "calculus",
      ownerId: "owner-1",
      store,
      validator: lineageRuntime,
    })
    expect(accepted?.document.prompts[0]?.revision).toBe(3)
    expect(appended).toHaveLength(1)
  })

  test("rejects previews based on stale corpus state", async () => {
    const { store } = setupStore()
    await expect(
      previewMemoryRevision({
        baseDigest: "old-digest",
        corpusId: "calculus",
        draft: {
          answer: "A rate of change.",
          challenge: "What is a derivative?",
          corpusId: "calculus",
          kind: "basic",
          promptId: "derivative",
          responseMode: "self-check",
        },
        ownerId: "owner-1",
        promptId: "derivative",
        store,
        validator: lineageRuntime,
      }),
    ).rejects.toBeInstanceOf(StaleCorpusSnapshotError)
  })
})
