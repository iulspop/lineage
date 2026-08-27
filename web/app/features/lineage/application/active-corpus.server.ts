import type {
  ActiveCorpusPreferenceStore,
  CorpusSnapshot,
  CorpusSnapshotStore,
  ReviewContractValidator,
} from "../domain/corpus-ports"
import {
  activeCorpusPreferenceStore,
  corpusSnapshotStore,
} from "../infrastructure/corpus-model.server"
import { lineageRuntime } from "../infrastructure/lineage-runtime.server"
import { importCorpus } from "./import-corpus.server"

export type ActiveCorpusResolution =
  | { status: "empty" }
  | { corpusId: string; snapshot: CorpusSnapshot; status: "ready" }

export class CorpusWorkspaceNotFoundError extends Error {
  constructor(readonly corpusId: string) {
    super(`Workspace ${corpusId} was not found`)
  }
}

export class CorpusWorkspaceConflictError extends Error {
  constructor(readonly corpusId: string) {
    super(`Workspace ${corpusId} already exists`)
  }
}

type ActiveCorpusDependencies = {
  preferenceStore: ActiveCorpusPreferenceStore
  snapshotStore: CorpusSnapshotStore
}

const defaultDependencies: ActiveCorpusDependencies = {
  preferenceStore: activeCorpusPreferenceStore,
  snapshotStore: corpusSnapshotStore,
}

export async function resolveActiveCorpus(
  ownerId: string,
  dependencies: ActiveCorpusDependencies = defaultDependencies,
): Promise<ActiveCorpusResolution> {
  const preferredCorpusId =
    await dependencies.preferenceStore.getActiveCorpusId(ownerId)
  if (preferredCorpusId) {
    const snapshot = await dependencies.snapshotStore.latest(
      ownerId,
      preferredCorpusId,
    )
    if (snapshot) {
      return { corpusId: preferredCorpusId, snapshot, status: "ready" }
    }
  }

  const [fallbackCorpusId] =
    await dependencies.preferenceStore.listCorpusIdsByRecentActivity(ownerId)
  if (!fallbackCorpusId) return { status: "empty" }

  const snapshot = await dependencies.snapshotStore.latest(
    ownerId,
    fallbackCorpusId,
  )
  if (!snapshot) return { status: "empty" }

  await dependencies.preferenceStore.setActiveCorpusId(
    ownerId,
    fallbackCorpusId,
  )
  return { corpusId: fallbackCorpusId, snapshot, status: "ready" }
}

export type ImportedWorkspaceActivation = "activate" | "keep-inactive"

export async function activateImportedCorpus({
  activation,
  corpusId,
  hadWorkspace,
  ownerId,
  dependencies = defaultDependencies,
}: {
  activation: ImportedWorkspaceActivation | null
  corpusId: string
  hadWorkspace: boolean
  ownerId: string
  dependencies?: ActiveCorpusDependencies
}) {
  if (!hadWorkspace || activation === "activate") {
    await dependencies.preferenceStore.setActiveCorpusId(ownerId, corpusId)
    return true
  }
  if (activation === "keep-inactive") return false
  throw new Error("Choose whether to activate the imported workspace")
}

export async function selectActiveCorpus(
  ownerId: string,
  corpusId: string,
  dependencies: ActiveCorpusDependencies = defaultDependencies,
) {
  const snapshot = await dependencies.snapshotStore.latest(ownerId, corpusId)
  if (!snapshot) throw new CorpusWorkspaceNotFoundError(corpusId)

  await dependencies.preferenceStore.setActiveCorpusId(ownerId, corpusId)
  return { corpusId, snapshot }
}

export async function createActiveCorpus({
  corpusId,
  dependencies = defaultDependencies,
  ownerId,
  validator = lineageRuntime,
}: {
  corpusId: string
  dependencies?: ActiveCorpusDependencies
  ownerId: string
  validator?: ReviewContractValidator
}) {
  const normalizedCorpusId = corpusId.trim()
  if (!normalizedCorpusId) throw new Error("Workspace ID is required")

  const existing = await dependencies.snapshotStore.latest(
    ownerId,
    normalizedCorpusId,
  )
  if (existing) throw new CorpusWorkspaceConflictError(normalizedCorpusId)

  const imported = await importCorpus({
    input: {
      corpusId: normalizedCorpusId,
      format: "lineage.corpus",
      formatVersion: 1,
      prompts: [],
    },
    ownerId,
    store: dependencies.snapshotStore,
    validator,
  })
  await dependencies.preferenceStore.setActiveCorpusId(
    ownerId,
    normalizedCorpusId,
  )
  return imported
}
