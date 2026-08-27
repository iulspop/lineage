import { data, redirect } from "react-router"

import type { Route } from "./+types/create.manual"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { importCorpus } from "~/features/lineage/application/import-corpus.server"
import type { ManualMemoryDraft } from "~/features/lineage/application/manual-memory-draft"
import {
  parseQuickMemoryCapture,
  validateManualMemoryDraft,
  validateQuickMemoryCapture,
} from "~/features/lineage/application/manual-memory-draft"
import { ManualMemoryPage } from "~/features/lineage/application/manual-memory-page"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function readDraft(formData: FormData): ManualMemoryDraft {
  return {
    answer: String(formData.get("answer") ?? ""),
    challenge: String(formData.get("challenge") ?? ""),
    corpusId: String(formData.get("corpusId") ?? "").trim(),
    hint: String(formData.get("hint") ?? ""),
    kind: formData.get("kind") === "cloze" ? "cloze" : "basic",
    promptId: String(formData.get("promptId") ?? "").trim(),
    responseMode:
      formData.get("responseMode") === "text" ? "text" : "self-check",
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const [snapshots, user] = await Promise.all([
    corpusSnapshotStore.listLatest(ownerId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  const url = new URL(request.url)
  const corpora = snapshots.map(({ corpusId }) => corpusId)
  return {
    corpora,
    selectedCorpusId: url.searchParams.get("corpusId") ?? corpora[0] ?? "inbox",
    userEmail: user?.email ?? "",
  }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "accept") {
    const candidateJson = String(formData.get("candidateJson") ?? "")
    const imported = await importCorpus({
      input: JSON.parse(candidateJson),
      ownerId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    const promptId = imported.document.prompts.at(-1)?.id
    throw redirect(
      promptId
        ? `/library/${encodeURIComponent(imported.document.corpusId)}/memories/${encodeURIComponent(promptId)}`
        : `/library/${encodeURIComponent(imported.document.corpusId)}`,
    )
  }

  if (intent === "quick-create") {
    const corpusId = String(formData.get("corpusId") ?? "").trim()
    const quickInput = String(formData.get("quickInput") ?? "")
    const existing = corpusId
      ? await corpusSnapshotStore.latest(ownerId, corpusId)
      : null
    const base = existing
      ? parseCorpusDocument(JSON.parse(existing.canonicalJson))
      : null
    const parsed = parseQuickMemoryCapture({
      corpusId,
      existingPromptIds: base?.prompts.map(({ id }) => id),
      input: quickInput,
    })
    if (!parsed.valid)
      return data({ quickError: parsed.message, quickInput }, { status: 400 })

    const result = validateQuickMemoryCapture({
      base,
      drafts: parsed.drafts,
      validator: lineageRuntime,
    })
    if (!result.valid)
      return data(
        { diagnostics: result.diagnostics, quickInput, valid: false as const },
        { status: 400 },
      )

    const imported = await importCorpus({
      input: result.preview.document,
      ownerId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    const promptId = parsed.drafts[0]?.promptId
    throw redirect(
      promptId
        ? `/library/${encodeURIComponent(imported.document.corpusId)}/memories/${encodeURIComponent(promptId)}`
        : `/library/${encodeURIComponent(imported.document.corpusId)}`,
    )
  }

  const draft = readDraft(formData)
  const existing = draft.corpusId
    ? await corpusSnapshotStore.latest(ownerId, draft.corpusId)
    : null
  const result = validateManualMemoryDraft({
    base: existing
      ? parseCorpusDocument(JSON.parse(existing.canonicalJson))
      : null,
    draft,
    validator: lineageRuntime,
  })
  return data({ draft, ...result }, { status: result.valid ? 200 : 400 })
}

export const meta: Route.MetaFunction = () => [
  { title: "Create memory | Lineage" },
]

export default function ManualCreateRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <ManualMemoryPage
      actionData={actionData}
      corpora={loaderData.corpora}
      selectedCorpusId={loaderData.selectedCorpusId}
      userEmail={loaderData.userEmail}
    />
  )
}
