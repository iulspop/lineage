import { data } from "react-router"

import type { Route } from "./+types/create.archive"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import type { ImportedWorkspaceActivation } from "~/features/lineage/application/active-corpus.server"
import {
  activateImportedCorpus,
  resolveActiveCorpus,
} from "~/features/lineage/application/active-corpus.server"
import { ArchiveImportPage } from "~/features/lineage/application/archive-import-page"
import { importLineageArchive } from "~/features/lineage/application/archive-portability.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"
import { getErrorMessage } from "~/utils/get-error-message"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const [user, activeWorkspace] = await Promise.all([
    retrieveUserFromDatabaseById(userId),
    resolveActiveCorpus(userId),
  ])
  return {
    hasWorkspace: activeWorkspace.status === "ready",
    userEmail: user?.email ?? "",
  }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const activeWorkspace = await resolveActiveCorpus(ownerId)
  const hadWorkspace = activeWorkspace.status === "ready"
  const formData = await request.formData()
  const activation = formData.get(
    "activation",
  ) as ImportedWorkspaceActivation | null
  if (
    hadWorkspace &&
    activation !== "activate" &&
    activation !== "keep-inactive"
  )
    return data(
      { error: "Choose whether to switch to the imported workspace." },
      { status: 400 },
    )
  if (formData.get("confirmed") !== "on")
    return data(
      { error: "Confirm the import before continuing." },
      { status: 400 },
    )
  const archive = formData.get("archive")
  if (!(archive instanceof File))
    return data({ error: "Choose a .lineage archive." }, { status: 400 })
  try {
    const result = await importLineageArchive({
      bytes: new Uint8Array(await archive.arrayBuffer()),
      ownerId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    if (!result.valid)
      return data(
        { error: result.diagnostics[0]?.message ?? "Archive is invalid." },
        { status: 400 },
      )
    const corpusId = result.imported.document.corpusId
    const activated = await activateImportedCorpus({
      activation,
      corpusId,
      hadWorkspace,
      ownerId,
    })
    return data({
      activated,
      corpusId,
      promptCount: result.imported.document.prompts.length,
    })
  } catch (error) {
    return data({ error: getErrorMessage(error) }, { status: 400 })
  }
}

export const meta: Route.MetaFunction = () => [
  { title: "Import archive | Lineage" },
]

export default function ArchiveImportRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <ArchiveImportPage
      actionData={actionData}
      hasWorkspace={loaderData.hasWorkspace}
      userEmail={loaderData.userEmail}
    />
  )
}
