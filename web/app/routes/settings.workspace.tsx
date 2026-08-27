import { data, redirect } from "react-router"

import type { Route } from "./+types/settings.workspace"
import { AppShell } from "~/components/app-shell/app-shell"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import {
  CorpusWorkspaceConflictError,
  CorpusWorkspaceNotFoundError,
  createActiveCorpus,
  resolveActiveCorpus,
  selectActiveCorpus,
} from "~/features/lineage/application/active-corpus.server"
import { WorkspaceManagerPage } from "~/features/lineage/application/workspace-manager-page"
import { corpusDocumentSchema } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function memoryCount(canonicalJson: string) {
  try {
    const parsed = corpusDocumentSchema.safeParse(JSON.parse(canonicalJson))
    return parsed.success ? parsed.data.prompts.length : 0
  } catch {
    return 0
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const [activeCorpus, snapshots, user] = await Promise.all([
    resolveActiveCorpus(ownerId),
    corpusSnapshotStore.listLatest(ownerId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  if (!user) throw redirect("/auth/signin")

  return {
    pageTitle: "Workspace settings",
    userEmail: user.email,
    workspaces: snapshots.map((snapshot) => ({
      active:
        activeCorpus.status === "ready" &&
        activeCorpus.corpusId === snapshot.corpusId,
      corpusId: snapshot.corpusId,
      memoryCount: memoryCount(snapshot.canonicalJson),
    })),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")
  const corpusId = formData.get("corpusId")

  if (typeof corpusId !== "string" || !corpusId.trim()) {
    return data(
      { error: "Workspace ID is required.", success: false as const },
      { status: 400 },
    )
  }

  try {
    if (intent === "select") {
      await selectActiveCorpus(ownerId, corpusId)
      return data({ corpusId, success: true as const })
    }

    if (intent === "create") {
      if (formData.get("confirmed") !== "on") {
        return data(
          {
            error: "Confirm that you want to create a separate workspace.",
            success: false as const,
          },
          { status: 400 },
        )
      }
      await createActiveCorpus({ corpusId, ownerId })
      return data({ corpusId: corpusId.trim(), success: true as const })
    }

    return data(
      { error: "Unknown workspace action.", success: false as const },
      { status: 400 },
    )
  } catch (error) {
    if (error instanceof CorpusWorkspaceConflictError) {
      return data(
        {
          error: `Workspace ${error.corpusId} already exists.`,
          success: false as const,
        },
        { status: 409 },
      )
    }
    if (error instanceof CorpusWorkspaceNotFoundError) {
      return data(
        {
          error: `Workspace ${error.corpusId} was not found.`,
          success: false as const,
        },
        { status: 404 },
      )
    }
    throw error
  }
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.pageTitle },
]

export default function WorkspaceSettingsRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <AppShell userEmail={loaderData.userEmail}>
      <WorkspaceManagerPage
        actionData={actionData}
        workspaces={loaderData.workspaces}
      />
    </AppShell>
  )
}
