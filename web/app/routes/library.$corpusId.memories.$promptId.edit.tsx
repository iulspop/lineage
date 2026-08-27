import { data, redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId.memories.$promptId.edit"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import type { ManualMemoryDraft } from "~/features/lineage/application/manual-memory-draft"
import { ManualMemoryPage } from "~/features/lineage/application/manual-memory-page"
import {
  acceptMemoryRevision,
  previewMemoryRevision,
} from "~/features/lineage/application/revise-memory.server"
import { StaleCorpusSnapshotError } from "~/features/lineage/application/update-memory-status.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function readDraft(formData: FormData): ManualMemoryDraft {
  return {
    answer: String(formData.get("answer") ?? ""),
    challenge: String(formData.get("challenge") ?? ""),
    collectionIds: formData.getAll("collectionIds").map(String).filter(Boolean),
    corpusId: String(formData.get("corpusId") ?? ""),
    hint: String(formData.get("hint") ?? ""),
    kind: formData.get("kind") === "cloze" ? "cloze" : "basic",
    promptId: String(formData.get("promptId") ?? ""),
    responseMode:
      formData.get("responseMode") === "text" ? "text" : "self-check",
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
  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const prompt = document.prompts.find(({ id }) => id === params.promptId)
  if (!prompt) throw data("Memory not found", { status: 404 })
  return {
    baseDigest: snapshot.digest,
    collections: document.collections,
    initialDraft: {
      answer: prompt.withheld[0] ?? prompt.resolution.join("\n"),
      challenge: prompt.challenge.join("\n"),
      collectionIds: document.collectionMemberships
        .filter(({ promptId }) => promptId === prompt.id)
        .map(({ collectionId }) => collectionId),
      corpusId: params.corpusId,
      hint: prompt.clozeTargets?.[0]?.hints?.[0] ?? "",
      kind: prompt.kind === "cloze" ? ("cloze" as const) : ("basic" as const),
      promptId: prompt.id,
      responseMode:
        prompt.response === "text"
          ? ("text" as const)
          : ("self-check" as const),
    },
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
  try {
    if (formData.get("intent") === "accept") {
      const result = await acceptMemoryRevision({
        baseDigest,
        candidateJson: String(formData.get("candidateJson") ?? ""),
        corpusId: params.corpusId,
        ownerId,
        store: corpusSnapshotStore,
        validator: lineageRuntime,
      })
      if (!result) throw data("Memory not found", { status: 404 })
      throw redirect(
        `/library/${encodeURIComponent(params.corpusId)}/memories/${encodeURIComponent(params.promptId)}`,
      )
    }

    const draft = readDraft(formData)
    const result = await previewMemoryRevision({
      baseDigest,
      corpusId: params.corpusId,
      draft,
      ownerId,
      promptId: params.promptId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    if (!result) throw data("Memory not found", { status: 404 })
    return data({ draft, ...result }, { status: result.valid ? 200 : 400 })
  } catch (error) {
    if (error instanceof StaleCorpusSnapshotError)
      return data({ error: error.message }, { status: 409 })
    throw error
  }
}

export const meta: Route.MetaFunction = () => [
  { title: "Revise memory | Lineage" },
]

export default function EditMemoryRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <ManualMemoryPage
      actionData={actionData && "draft" in actionData ? actionData : undefined}
      baseDigest={loaderData.baseDigest}
      collections={loaderData.collections}
      initialDraft={loaderData.initialDraft}
      mode="edit"
      selectedCorpusId={loaderData.initialDraft.corpusId}
      userEmail={loaderData.userEmail}
    />
  )
}
