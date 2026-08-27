import { data, redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId.knowledge"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import { importCorpus } from "~/features/lineage/application/import-corpus.server"
import type { KnowledgeDraft } from "~/features/lineage/application/source-material-draft"
import { validateKnowledgeDraft } from "~/features/lineage/application/source-material-draft"
import { SourceMaterialPage } from "~/features/lineage/application/source-material-page"
import { StaleCorpusSnapshotError } from "~/features/lineage/application/update-memory-status.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function values(formData: FormData, name: string) {
  return formData.getAll(name).map(String).filter(Boolean)
}

function readDraft(formData: FormData): KnowledgeDraft {
  const common = {
    content: String(formData.get("content") ?? ""),
    id: String(formData.get("id") ?? "").trim(),
    linkedPromptIds: values(formData, "linkedPromptIds"),
  }
  return formData.get("kind") === "material"
    ? {
        ...common,
        kind: "material",
        sourceIds: values(formData, "sourceIds"),
      }
    : {
        ...common,
        kind: "source",
        title: String(formData.get("title") ?? ""),
      }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const [resolution, user] = await Promise.all([
    resolveActiveCorpus(ownerId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  if (params.corpusId !== resolution.corpusId) throw redirect("/library")
  const snapshot = resolution.snapshot
  return {
    corpus: parseCorpusDocument(JSON.parse(snapshot.canonicalJson)),
    snapshotDigest: snapshot.digest,
    userEmail: user?.email ?? "",
  }
}

export async function action({ params, request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(ownerId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  if (params.corpusId !== resolution.corpusId)
    throw data("Workspace changed", { status: 409 })
  const formData = await request.formData()
  const baseDigest = String(formData.get("baseDigest") ?? "")
  const latest = await corpusSnapshotStore.latest(ownerId, resolution.corpusId)
  if (!latest) throw data("Corpus not found", { status: 404 })
  if (latest.digest !== baseDigest)
    return data(
      {
        error:
          "This corpus changed after you opened the editor. Reload before saving.",
      },
      { status: 409 },
    )
  if (formData.get("intent") === "accept") {
    try {
      await importCorpus({
        input: JSON.parse(String(formData.get("candidateJson") ?? "")),
        ownerId,
        store: corpusSnapshotStore,
        validator: lineageRuntime,
      })
      throw redirect(
        `/library/${encodeURIComponent(params.corpusId)}?tab=sources`,
      )
    } catch (error) {
      if (error instanceof StaleCorpusSnapshotError)
        return data({ error: error.message }, { status: 409 })
      throw error
    }
  }
  const draft = readDraft(formData)
  const result = validateKnowledgeDraft({
    base: parseCorpusDocument(JSON.parse(latest.canonicalJson)),
    draft,
    validator: lineageRuntime,
  })
  return data(
    result.valid
      ? {
          canonicalJson: result.preview.canonicalJson,
          draft,
          valid: true as const,
        }
      : { diagnostics: result.diagnostics, draft, valid: false as const },
    { status: result.valid ? 200 : 400 },
  )
}

export const meta: Route.MetaFunction = () => [
  { title: "Sources and materials | Lineage" },
]

export default function KnowledgeRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <SourceMaterialPage
      actionData={actionData && "draft" in actionData ? actionData : undefined}
      corpus={loaderData.corpus}
      snapshotDigest={loaderData.snapshotDigest}
      userEmail={loaderData.userEmail}
    />
  )
}
