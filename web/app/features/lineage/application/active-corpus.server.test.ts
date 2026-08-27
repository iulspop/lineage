import { describe, expect, test } from "vitest"

import type {
  ActiveCorpusPreferenceStore,
  CorpusSnapshot,
  CorpusSnapshotStore,
} from "../domain/corpus-ports"
import {
  activateImportedCorpus,
  CorpusWorkspaceConflictError,
  CorpusWorkspaceNotFoundError,
  createActiveCorpus,
  resolveActiveCorpus,
  selectActiveCorpus,
} from "./active-corpus.server"

function createStores(input?: {
  activeCorpusId?: string | null
  corpora?: CorpusSnapshot[]
}) {
  let activeCorpusId = input?.activeCorpusId ?? null
  const snapshots = new Map(
    (input?.corpora ?? []).map((snapshot) => [snapshot.corpusId, snapshot]),
  )
  const recentCorpusIds = (input?.corpora ?? []).map(
    (snapshot) => snapshot.corpusId,
  )
  const preferenceStore: ActiveCorpusPreferenceStore = {
    async getActiveCorpusId() {
      return activeCorpusId
    },
    async listCorpusIdsByRecentActivity() {
      return recentCorpusIds
    },
    async setActiveCorpusId(_ownerId, corpusId) {
      activeCorpusId = corpusId
    },
  }
  const snapshotStore: CorpusSnapshotStore = {
    async append(_ownerId, snapshot) {
      snapshots.set(snapshot.corpusId, snapshot)
      if (!recentCorpusIds.includes(snapshot.corpusId))
        recentCorpusIds.unshift(snapshot.corpusId)
    },
    async find(_ownerId, corpusId, digest) {
      const snapshot = snapshots.get(corpusId) ?? null
      return snapshot?.digest === digest ? snapshot : null
    },
    async latest(_ownerId, corpusId) {
      return snapshots.get(corpusId) ?? null
    },
    async listLatest() {
      return [...snapshots.values()]
    },
  }
  return {
    dependencies: { preferenceStore, snapshotStore },
    getActiveCorpusId: () => activeCorpusId,
  }
}

const olderSnapshot: CorpusSnapshot = {
  canonicalJson: "{}",
  corpusId: "older",
  digest: "older-digest",
  formatVersion: 1,
}
const recentSnapshot: CorpusSnapshot = {
  canonicalJson: "{}",
  corpusId: "recent",
  digest: "recent-digest",
  formatVersion: 1,
}

describe("active corpus", () => {
  test("returns and preserves an owned active corpus", async () => {
    const stores = createStores({
      activeCorpusId: "older",
      corpora: [recentSnapshot, olderSnapshot],
    })

    await expect(
      resolveActiveCorpus("owner-1", stores.dependencies),
    ).resolves.toEqual({
      corpusId: "older",
      snapshot: olderSnapshot,
      status: "ready",
    })
    expect(stores.getActiveCorpusId()).toBe("older")
  })

  test("repairs an invalid preference with the most recently active corpus", async () => {
    const stores = createStores({
      activeCorpusId: "another-owner-corpus",
      corpora: [recentSnapshot, olderSnapshot],
    })

    await expect(
      resolveActiveCorpus("owner-1", stores.dependencies),
    ).resolves.toEqual({
      corpusId: "recent",
      snapshot: recentSnapshot,
      status: "ready",
    })
    expect(stores.getActiveCorpusId()).toBe("recent")
  })

  test("returns an explicit empty-workspace state", async () => {
    const stores = createStores()

    await expect(
      resolveActiveCorpus("owner-1", stores.dependencies),
    ).resolves.toEqual({ status: "empty" })
  })

  test("activates imports automatically for empty accounts and requires an explicit established-account choice", async () => {
    const emptyStores = createStores()
    await expect(
      activateImportedCorpus({
        activation: null,
        corpusId: "imported",
        dependencies: emptyStores.dependencies,
        hadWorkspace: false,
        ownerId: "owner-1",
      }),
    ).resolves.toBe(true)
    expect(emptyStores.getActiveCorpusId()).toBe("imported")

    const establishedStores = createStores({
      activeCorpusId: "older",
      corpora: [olderSnapshot],
    })
    await expect(
      activateImportedCorpus({
        activation: "keep-inactive",
        corpusId: "imported",
        dependencies: establishedStores.dependencies,
        hadWorkspace: true,
        ownerId: "owner-1",
      }),
    ).resolves.toBe(false)
    expect(establishedStores.getActiveCorpusId()).toBe("older")
    await expect(
      activateImportedCorpus({
        activation: "activate",
        corpusId: "imported",
        dependencies: establishedStores.dependencies,
        hadWorkspace: true,
        ownerId: "owner-1",
      }),
    ).resolves.toBe(true)
    expect(establishedStores.getActiveCorpusId()).toBe("imported")
  })

  test("selects only a corpus owned by the user", async () => {
    const stores = createStores({ corpora: [recentSnapshot] })

    await expect(
      selectActiveCorpus("owner-1", "missing", stores.dependencies),
    ).rejects.toEqual(new CorpusWorkspaceNotFoundError("missing"))
    await expect(
      selectActiveCorpus("owner-1", "recent", stores.dependencies),
    ).resolves.toEqual({ corpusId: "recent", snapshot: recentSnapshot })
    expect(stores.getActiveCorpusId()).toBe("recent")
  })

  test("creates and activates a new empty corpus without replacing an existing ID", async () => {
    const stores = createStores({ corpora: [olderSnapshot] })

    const created = await createActiveCorpus({
      corpusId: " polypan ",
      dependencies: stores.dependencies,
      ownerId: "owner-1",
      validator: { isValid: () => true },
    })

    expect(created.document.corpusId).toBe("polypan")
    expect(stores.getActiveCorpusId()).toBe("polypan")
    await expect(
      createActiveCorpus({
        corpusId: "polypan",
        dependencies: stores.dependencies,
        ownerId: "owner-1",
        validator: { isValid: () => true },
      }),
    ).rejects.toEqual(new CorpusWorkspaceConflictError("polypan"))
  })
})
