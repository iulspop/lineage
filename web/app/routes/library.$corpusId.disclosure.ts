import { data, redirect } from "react-router"

import type { Route } from "./+types/library.$corpusId.disclosure"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"

const headers = { "Cache-Control": "private, no-store" }

export async function action({ params, request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(userId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  if (params.corpusId !== resolution.corpusId)
    return data({ error: "Workspace changed" }, { headers, status: 409 })

  const formData = await request.formData()
  const snapshotDigest = formData.get("snapshotDigest")
  if (snapshotDigest !== resolution.snapshot.digest)
    return data(
      { error: "This workspace changed. Refresh before revealing answers." },
      { headers, status: 409 },
    )

  if (formData.get("intent") === "canonical")
    return data(
      { canonicalJson: resolution.snapshot.canonicalJson },
      { headers },
    )

  const promptIds = [
    ...new Set(
      formData
        .getAll("promptId")
        .filter(
          (value): value is string =>
            typeof value === "string" && value.length > 0,
        ),
    ),
  ]
  if (promptIds.length === 0 || promptIds.length > 500)
    return data(
      { error: "Choose between 1 and 500 memories to reveal." },
      { headers, status: 400 },
    )

  const document = parseCorpusDocument(
    JSON.parse(resolution.snapshot.canonicalJson),
  )
  const prompts = new Map(document.prompts.map((prompt) => [prompt.id, prompt]))
  const answers: Record<string, string[]> = {}
  for (const promptId of promptIds) {
    const prompt = prompts.get(promptId)
    if (!prompt)
      return data({ error: "Memory not found" }, { headers, status: 404 })
    answers[promptId] = prompt.resolution
  }

  return data({ answers }, { headers })
}
