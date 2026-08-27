import { data, redirect } from "react-router"

import type { Route } from "./+types/create.image-occlusion"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"
import type { ImageOcclusionDraft } from "~/features/lineage/application/image-occlusion-draft"
import {
  MAX_IMAGE_BYTES,
  validateImageOcclusionDraft,
} from "~/features/lineage/application/image-occlusion-draft"
import { ImageOcclusionPage } from "~/features/lineage/application/image-occlusion-page"
import { importCorpus } from "~/features/lineage/application/import-corpus.server"
import { StaleCorpusSnapshotError } from "~/features/lineage/application/update-memory-status.server"
import { parseCorpusDocument } from "~/features/lineage/domain/corpus"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { replaceCorpusAssets } from "~/features/lineage/infrastructure/lineage-asset-store.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function number(formData: FormData, name: string) {
  return Number.parseFloat(String(formData.get(name) ?? ""))
}

async function readDraft(formData: FormData): Promise<ImageOcclusionDraft> {
  const file = formData.get("image")
  const existingBase64 = String(formData.get("existingImageBase64") ?? "")
  let imageBase64 = existingBase64
  let imageMediaType = String(formData.get("existingImageMediaType") ?? "")
  let imageName = String(formData.get("existingImageName") ?? "")
  const newImage = file instanceof File && file.size > 0
  if (newImage) {
    if (file.size > MAX_IMAGE_BYTES)
      throw new Error("Images must be 5 MB or smaller.")
    if (file.type !== "image/png" && file.type !== "image/jpeg")
      throw new Error("Use a PNG or JPEG image.")
    imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64")
    imageMediaType = file.type
    imageName = file.name
  }
  if (!imageBase64) throw new Error("Choose an image to occlude.")
  return {
    accessibleDescription: String(formData.get("accessibleDescription") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    assetId: String(formData.get("existingAssetId") ?? "") || undefined,
    challenge: String(formData.get("challenge") ?? ""),
    corpusId: String(formData.get("corpusId") ?? "").trim(),
    height: number(formData, "height"),
    imageBase64,
    imageMediaType,
    imageName,
    newImage,
    promptId: String(formData.get("promptId") ?? "").trim(),
    regionDescription: String(formData.get("regionDescription") ?? ""),
    regionLabel: String(formData.get("regionLabel") ?? ""),
    width: number(formData, "width"),
    x: number(formData, "x"),
    y: number(formData, "y"),
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const [resolution, user] = await Promise.all([
    resolveActiveCorpus(ownerId),
    retrieveUserFromDatabaseById(ownerId),
  ])
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  const url = new URL(request.url)
  const requestedCorpusId = url.searchParams.get("corpusId")
  if (requestedCorpusId && requestedCorpusId !== resolution.corpusId)
    throw data("Memory does not belong to the active workspace", {
      status: 409,
    })
  const corpusId = resolution.corpusId
  const promptId = url.searchParams.get("promptId") ?? ""
  const snapshot = resolution.snapshot
  const document = snapshot
    ? parseCorpusDocument(JSON.parse(snapshot.canonicalJson))
    : null
  const prompt = promptId
    ? document?.prompts.find(({ id }) => id === promptId)
    : null
  if (promptId && prompt?.kind !== "image-occlusion")
    throw data("Image-occlusion memory not found", { status: 404 })
  const asset = prompt?.sourceAsset
    ? await (async () => {
        const assets = await import(
          "~/features/lineage/infrastructure/lineage-asset-store.server"
        )
        return (await assets.listCorpusAssets({ corpusId, ownerId })).find(
          ({ assetId }) => assetId === prompt.sourceAsset,
        )
      })()
    : null
  return {
    baseDigest: snapshot.digest,
    initialDraft:
      prompt && asset
        ? {
            accessibleDescription: asset.accessibleDescription ?? "",
            answer: prompt.resolution.join("\n"),
            assetId: asset.assetId,
            challenge: prompt.challenge.join("\n"),
            corpusId,
            height:
              prompt.occlusionRegions?.[0]?.geometry.type === "rectangle"
                ? prompt.occlusionRegions[0].geometry.height
                : 0.25,
            imageBase64: Buffer.from(asset.bytes).toString("base64"),
            imageMediaType: asset.mediaType,
            imageName: asset.path.split("/").at(-1) ?? "image",
            promptId,
            regionDescription:
              prompt.occlusionRegions?.[0]?.accessibleDescription ?? "",
            regionLabel: prompt.occlusionRegions?.[0]?.label ?? "",
            width:
              prompt.occlusionRegions?.[0]?.geometry.type === "rectangle"
                ? prompt.occlusionRegions[0].geometry.width
                : 0.25,
            x:
              prompt.occlusionRegions?.[0]?.geometry.type === "rectangle"
                ? prompt.occlusionRegions[0].geometry.x
                : 0.1,
            y:
              prompt.occlusionRegions?.[0]?.geometry.type === "rectangle"
                ? prompt.occlusionRegions[0].geometry.y
                : 0.1,
          }
        : { corpusId, promptId },
    userEmail: user?.email ?? "",
  }
}

export async function action({ request }: Route.ActionArgs) {
  const ownerId = await requireUserId(request)
  const resolution = await resolveActiveCorpus(ownerId)
  if (resolution.status === "empty") throw redirect("/settings/workspace")
  const formData = await request.formData()
  formData.set("corpusId", resolution.corpusId)
  if (formData.get("intent") === "accept") {
    const candidateJson = String(formData.get("candidateJson") ?? "")
    const document = parseCorpusDocument(JSON.parse(candidateJson))
    if (document.corpusId !== resolution.corpusId)
      throw data("Workspace changed", { status: 409 })
    const baseDigest = String(formData.get("baseDigest") ?? "")
    const latest = await corpusSnapshotStore.latest(ownerId, document.corpusId)
    if (baseDigest && latest?.digest !== baseDigest)
      throw new StaleCorpusSnapshotError(
        "This corpus changed after preview. Reload before saving.",
      )
    const promptId = String(formData.get("promptId") ?? "")
    const sourceAsset = document.prompts.find(
      ({ id }) => id === promptId,
    )?.sourceAsset
    const asset = document.assets.find(({ id }) => id === sourceAsset)
    if (!asset) throw data("Image asset missing", { status: 400 })
    const bytes = Uint8Array.from(
      Buffer.from(String(formData.get("assetBase64") ?? ""), "base64"),
    )
    await importCorpus({
      input: document,
      ownerId,
      store: corpusSnapshotStore,
      validator: lineageRuntime,
    })
    await replaceCorpusAssets({
      assets: [
        {
          accessibleDescription: asset.accessibleDescription,
          assetId: asset.id,
          byteSize: asset.byteSize,
          bytes,
          mediaType: asset.mediaType,
          path: asset.path,
          sha256: asset.sha256,
        },
      ],
      corpusId: document.corpusId,
      ownerId,
    })
    throw redirect(
      `/library/${encodeURIComponent(document.corpusId)}/memories/${encodeURIComponent(promptId)}`,
    )
  }
  try {
    const draft = await readDraft(formData)
    const existing = await corpusSnapshotStore.latest(ownerId, draft.corpusId)
    const base = existing
      ? parseCorpusDocument(JSON.parse(existing.canonicalJson))
      : null
    const result = validateImageOcclusionDraft({
      base,
      baseDigest: existing?.digest,
      draft,
      existingPromptId:
        new URL(request.url).searchParams.get("promptId") ?? undefined,
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
  } catch (error) {
    return data(
      {
        diagnostics: [
          {
            code: "asset.integrity-mismatch",
            message:
              error instanceof Error
                ? error.message
                : "Image could not be read.",
            path: "/assets",
            severity: "error" as const,
          },
        ],
        draft: undefined,
        valid: false as const,
      },
      { status: 400 },
    )
  }
}

export const meta: Route.MetaFunction = () => [
  { title: "Create image occlusion | Lineage" },
]

export default function ImageOcclusionRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <ImageOcclusionPage
      actionData={actionData?.draft ? actionData : undefined}
      baseDigest={loaderData.baseDigest}
      initialDraft={loaderData.initialDraft}
      userEmail={loaderData.userEmail}
    />
  )
}
