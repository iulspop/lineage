import { data, redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId.memories.$promptId.edit"
import { requireUserId } from "~/features/auth/application/auth-session.server"
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
  const [snapshot, user] = await Promise.all([
    corpusSnapshotStore.latest(ownerId, params.corpusId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  if (!snapshot) throw data("Corpus not found", { status: 404 })
  const document = parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
  const prompt = document.prompts.find(({ id }) => id === params.promptId)
  if (!prompt) throw data("Memory not found", { status: 404 })
  return {
    baseDigest: snapshot.digest,
    initialDraft: {
      answer: prompt.withheld[0] ?? prompt.resolution.join("\n"),
      challenge: prompt.challenge.join("\n"),
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
      corpora={[loaderData.initialDraft.corpusId]}
      initialDraft={loaderData.initialDraft}
      mode="edit"
      selectedCorpusId={loaderData.initialDraft.corpusId}
      userEmail={loaderData.userEmail}
    />
  )
}
