import { data, redirect } from "react-router"

import type { Route } from "./+types/create.ai"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { AssistedAuthoringPage } from "~/features/lineage/application/assisted-authoring-page"
import { validateCorpusCandidate } from "~/features/lineage/application/author-corpus.server"
import type { AssistedAuthoringInput } from "~/features/lineage/application/generate-corpus-candidate.server"
import { generateCorpusCandidate } from "~/features/lineage/application/generate-corpus-candidate.server"
import { importCorpus } from "~/features/lineage/application/import-corpus.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { DeterministicAuthoringProvider } from "~/features/lineage/infrastructure/deterministic-authoring-provider.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

const provider = new DeterministicAuthoringProvider()

function parseInput(formData: FormData): AssistedAuthoringInput {
  const rawIntent = String(formData.get("intent") ?? "topic")
  const intent = [
    "topic",
    "source",
    "expand-corpus",
    "improve-memory",
  ].includes(rawIntent)
    ? (rawIntent as AssistedAuthoringInput["intent"])
    : "topic"
  const rawDepth = String(formData.get("depth") ?? "introductory")
  const depth = ["introductory", "intermediate", "advanced"].includes(rawDepth)
    ? (rawDepth as AssistedAuthoringInput["depth"])
    : "introductory"
  const memoryKinds = String(formData.get("memoryKinds") ?? "basic,cloze")
    .split(",")
    .filter(
      (kind): kind is "basic" | "cloze" => kind === "basic" || kind === "cloze",
    )

  return {
    corpusId: String(formData.get("corpusId") ?? "").trim(),
    depth,
    desiredCount: Math.max(
      1,
      Math.min(12, Number(formData.get("desiredCount") ?? 5)),
    ),
    intent,
    memoryKinds: memoryKinds.length > 0 ? memoryKinds : ["basic"],
    promptId: String(formData.get("promptId") ?? "").trim() || undefined,
    source: String(formData.get("source") ?? "").trim() || undefined,
    topic: String(formData.get("topic") ?? "").trim(),
  }
}

async function generate(ownerId: string, input: AssistedAuthoringInput) {
  const snapshot = input.corpusId
    ? await corpusSnapshotStore.latest(ownerId, input.corpusId)
    : null
  const base = snapshot
    ? parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
    : null
  const result = await generateCorpusCandidate({
    base,
    input,
    provider,
    validator: lineageRuntime,
  })
  return data(
    result.valid
      ? {
          ...result,
          baseDigest: snapshot?.digest,
          generatedIds: result.memories.map(({ id }) => id),
          input,
        }
      : { ...result, input },
    { status: result.valid ? 200 : 400 },
  )
}

export async function loader({ request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const [snapshots, user] = await Promise.all([
    corpusSnapshotStore.listLatest(ownerId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  const url = new URL(request.url)
  return {
    corpora: snapshots.map(({ corpusId }) => corpusId),
    initialInput: {
      corpusId: url.searchParams.get("corpusId") ?? "",
      intent: (url.searchParams.get("intent") ??
        "topic") as AssistedAuthoringInput["intent"],
      promptId: url.searchParams.get("promptId") ?? undefined,
      topic: url.searchParams.get("topic") ?? "",
    },
    userEmail: user?.email ?? "",
  }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const formData = await request.formData()
  const action = String(formData.get("action") ?? "generate")

  if (action === "generate") return generate(ownerId, parseInput(formData))
  if (action === "regenerate") {
    return generate(
      ownerId,
      JSON.parse(String(formData.get("inputJson") ?? "{}")),
    )
  }

  if (action === "accept") {
    const corpusId = String(formData.get("corpusId") ?? "")
    const baseDigest = String(formData.get("baseDigest") ?? "")
    const latest = await corpusSnapshotStore.latest(ownerId, corpusId)
    if ((latest?.digest ?? "") !== baseDigest) {
      return data(
        {
          diagnostics: [
            {
              code: "snapshot.stale",
              message:
                "This corpus changed after generation. Generate again from the latest snapshot.",
              path: "/",
              severity: "error" as const,
            },
          ],
          input: JSON.parse(String(formData.get("inputJson") ?? "{}")),
          valid: false as const,
        },
        { status: 409 },
      )
    }

    const candidate = parseCorpusDocument(
      JSON.parse(String(formData.get("candidateJson") ?? "{}")),
    )
    const generatedIds = new Set(
      String(formData.get("generatedIds") ?? "")
        .split(",")
        .filter(Boolean),
    )
    const selected = new Set(formData.getAll("selected").map(String))
    const edits = new Map(
      [...generatedIds].map((id, index) => [
        id,
        {
          answer: String(formData.get(`answer:${index}`) ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          challenge: String(formData.get(`challenge:${index}`) ?? "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
      ]),
    )
    const edited = candidate.prompts
      .filter(
        (prompt) => !generatedIds.has(prompt.id) || selected.has(prompt.id),
      )
      .map((prompt) => {
        if (!generatedIds.has(prompt.id)) return prompt
        const edit = edits.get(prompt.id)
        const answer = edit?.answer.length ? edit.answer : prompt.withheld
        const challenge = edit?.challenge.length
          ? edit.challenge
          : prompt.challenge
        return {
          ...prompt,
          challenge,
          clozeTargets: prompt.clozeTargets?.map((target, targetIndex) => ({
            ...target,
            answer: answer[targetIndex] ?? answer[0] ?? target.answer,
          })),
          resolution: answer,
          withheld: answer,
        }
      })
    const validation = validateCorpusCandidate({
      candidateJson: JSON.stringify({ ...candidate, prompts: edited }),
      maxRepairs: 2,
      validator: lineageRuntime,
    })
    if (!validation.valid) {
      return data(
        {
          diagnostics: validation.diagnostics,
          input: JSON.parse(String(formData.get("inputJson") ?? "{}")),
          valid: false as const,
        },
        { status: 400 },
      )
    }
    const imported = await importCorpus({
      input: validation.preview.document,
      ownerId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    throw redirect(
      `/library/${encodeURIComponent(imported.document.corpusId)}?tab=memories`,
    )
  }

  throw new Response("Unsupported assisted-authoring action", { status: 400 })
}

export const meta: Route.MetaFunction = () => [
  { title: "Generate memories | Lineage" },
]

export default function CreateAiRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <AssistedAuthoringPage
      actionData={actionData}
      corpora={loaderData.corpora}
      initialInput={loaderData.initialInput}
      userEmail={loaderData.userEmail}
    />
  )
}
