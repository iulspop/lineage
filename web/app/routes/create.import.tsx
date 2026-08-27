import { data } from "react-router"

import type { Route } from "./+types/create.import"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import type { ImportedWorkspaceActivation } from "~/features/lineage/application/active-corpus.server"
import {
  activateImportedCorpus,
  resolveActiveCorpus,
} from "~/features/lineage/application/active-corpus.server"
import { validateCorpusCandidate } from "~/features/lineage/application/author-corpus.server"
import { CorpusPage } from "~/features/lineage/application/corpus-page"
import {
  exportCorpus,
  InvalidCorpusError,
  importCorpus,
} from "~/features/lineage/application/import-corpus.server"
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
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "validate-candidate") {
    const candidate = validateCorpusCandidate({
      candidateJson: String(formData.get("candidateJson") ?? ""),
      validator: lineageRuntime,
    })
    return data(candidate, { status: candidate.valid ? 200 : 400 })
  }

  if (intent === "import" || intent === "accept-candidate") {
    try {
      const activeWorkspace = await resolveActiveCorpus(ownerId)
      const hadWorkspace = activeWorkspace.status === "ready"
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
      const input = JSON.parse(
        String(
          formData.get(
            intent === "accept-candidate" ? "candidateJson" : "corpusJson",
          ) ?? "",
        ),
      )
      const imported = await importCorpus({
        input,
        ownerId,
        store: corpusSnapshotStore,
        validator: lineageRuntime,
      })
      const corpusId = imported.document.corpusId
      const activated = await activateImportedCorpus({
        activation,
        corpusId,
        hadWorkspace,
        ownerId,
      })
      return data({
        activated,
        corpusId,
        digest: imported.digest,
        imported: true as const,
        promptCount: imported.document.prompts.length,
      })
    } catch (error) {
      return data(
        error instanceof InvalidCorpusError
          ? { diagnostics: error.diagnostics, error: error.message }
          : { error: getErrorMessage(error) },
        { status: 400 },
      )
    }
  }

  if (intent === "export") {
    const corpusId = String(formData.get("corpusId") ?? "").trim()
    if (!corpusId)
      return data({ error: "Corpus ID is required" }, { status: 400 })

    const document = await exportCorpus({
      corpusId,
      ownerId,
      store: corpusSnapshotStore,
    })
    if (!document) return data({ error: "Corpus not found" }, { status: 404 })

    return new Response(JSON.stringify(document), {
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(corpusId)}.lineage.json"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    })
  }

  return data({ error: "Unknown corpus action" }, { status: 400 })
}

export const meta: Route.MetaFunction = () => [{ title: "Import | Lineage" }]

export default function ImportRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <CorpusPage
      actionData={actionData}
      hasWorkspace={loaderData.hasWorkspace}
      userEmail={loaderData.userEmail}
    />
  )
}
