import { createId } from "@paralleldrive/cuid2"
import { IconCheck, IconEye, IconPhoto, IconTrash } from "@tabler/icons-react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { useCallback, useEffect, useState } from "react"
import { Form, Link } from "react-router"

import type { LineageDiagnostic } from "../domain/corpus"
import type {
  ImageOcclusionDraft,
  ImageOcclusionRegionDraft,
} from "./image-occlusion-draft"
import * as s from "./image-occlusion-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"

type ActionData =
  | ({ draft: ImageOcclusionDraft } & (
      | {
          canonicalJson: string
          promptIds: string[]
          valid: true
        }
      | { diagnostics: LineageDiagnostic[]; valid: false }
    ))
  | undefined

type Point = { x: number; y: number }

function clamp(value: number) {
  return Math.max(0, Math.min(1, value))
}

function initialRegions(draft?: Partial<ImageOcclusionDraft>) {
  return draft?.regions ?? []
}

export function ImageOcclusionPage({
  actionData,
  baseDigest,
  initialDraft,
  userEmail,
}: {
  actionData: ActionData
  baseDigest?: string
  initialDraft?: Partial<ImageOcclusionDraft>
  userEmail: string
}) {
  const draft = actionData?.draft ?? initialDraft
  const isRevision = Boolean(initialDraft?.imageBase64)
  const [image, setImage] = useState<{
    base64: string
    mediaType: string
    name: string
  } | null>(
    draft?.imageBase64 && draft.imageMediaType
      ? {
          base64: draft.imageBase64,
          mediaType: draft.imageMediaType,
          name: draft.imageName ?? "image",
        }
      : null,
  )
  const [regions, setRegions] = useState<ImageOcclusionRegionDraft[]>(() =>
    initialRegions(draft),
  )
  const [drawing, setDrawing] = useState<{
    current: Point
    start: Point
  } | null>(null)
  const imageUrl = image
    ? `data:${image.mediaType};base64,${image.base64}`
    : null

  const readImage = useCallback((file: File) => {
    if (file.type !== "image/png" && file.type !== "image/jpeg") return
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const result = String(reader.result ?? "")
      setImage({
        base64: result.slice(result.indexOf(",") + 1),
        mediaType: file.type,
        name: file.name || "pasted-image",
      })
      setRegions([])
    })
    reader.readAsDataURL(file)
  }, [])

  useEffect(() => {
    function pasteImage(event: ClipboardEvent) {
      const file = [...(event.clipboardData?.files ?? [])].find((item) =>
        item.type.startsWith("image/"),
      )
      if (!file) return
      event.preventDefault()
      readImage(file)
    }
    document.addEventListener("paste", pasteImage)
    return () => document.removeEventListener("paste", pasteImage)
  }, [readImage])

  function point(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width),
      y: clamp((event.clientY - bounds.top) / bounds.height),
    }
  }

  function finishDrawing(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drawing) return
    const end = point(event)
    const x = Math.min(drawing.start.x, end.x)
    const y = Math.min(drawing.start.y, end.y)
    const width = Math.abs(end.x - drawing.start.x)
    const height = Math.abs(end.y - drawing.start.y)
    setDrawing(null)
    if (width < 0.01 || height < 0.01) return
    const number = regions.length + 1
    setRegions((current) => [
      ...current,
      {
        height,
        id: createId(),
        label: `Region ${number}`,
        width,
        x,
        y,
      },
    ])
  }

  const draftRectangle = drawing
    ? {
        height: Math.abs(drawing.current.y - drawing.start.y),
        width: Math.abs(drawing.current.x - drawing.start.x),
        x: Math.min(drawing.start.x, drawing.current.x),
        y: Math.min(drawing.start.y, drawing.current.y),
      }
    : null

  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Paste or choose an image, then drag over every area you want to recall. Each box becomes an independently scheduled memory."
          eyebrow="Create · Image occlusion"
          title={
            isRevision ? "Revise image occlusion" : "Create image occlusion"
          }
        />
        <div className={s.layout}>
          <form className={s.card} encType="multipart/form-data" method="post">
            {baseDigest ? (
              <input name="baseDigest" type="hidden" value={baseDigest} />
            ) : null}
            {draft?.assetId ? (
              <input
                name="existingAssetId"
                type="hidden"
                value={draft.assetId}
              />
            ) : null}
            <input
              name="corpusId"
              type="hidden"
              value={draft?.corpusId ?? ""}
            />
            <input
              name="existingImageBase64"
              type="hidden"
              value={image?.base64 ?? ""}
            />
            <input
              name="existingImageMediaType"
              type="hidden"
              value={image?.mediaType ?? ""}
            />
            <input
              name="existingImageName"
              type="hidden"
              value={image?.name ?? ""}
            />
            <input
              name="regionsJson"
              type="hidden"
              value={JSON.stringify(regions)}
            />
            <h2>
              <IconPhoto aria-hidden="true" /> Image
            </h2>
            <label className={s.field}>
              <span>Choose an image</span>
              <input
                accept="image/png,image/jpeg"
                name="image"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0]
                  if (file) readImage(file)
                }}
                type="file"
              />
              <small>PNG or JPEG, up to 5 MB.</small>
            </label>
            <div
              className={s.pasteTarget}
              onPaste={(event) => {
                const file = [...event.clipboardData.files].find((item) =>
                  item.type.startsWith("image/"),
                )
                if (file) {
                  event.preventDefault()
                  readImage(file)
                }
              }}
            >
              {imageUrl ? (
                <div
                  aria-label="Occlusion editor. Drag on the image to create a box."
                  className={s.imageEditor}
                  onPointerCancel={() => setDrawing(null)}
                  onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId)
                    const start = point(event)
                    setDrawing({ current: start, start })
                  }}
                  onPointerMove={(event) => {
                    if (!drawing) return
                    setDrawing({ ...drawing, current: point(event) })
                  }}
                  onPointerUp={finishDrawing}
                  role="application"
                >
                  <img alt="" draggable={false} src={imageUrl} />
                  {regions.map((region, index) => (
                    <span
                      aria-hidden="true"
                      className={s.drawnRegion}
                      key={region.id}
                      style={{
                        height: `${region.height * 100}%`,
                        left: `${region.x * 100}%`,
                        top: `${region.y * 100}%`,
                        width: `${region.width * 100}%`,
                      }}
                    >
                      {index + 1}
                    </span>
                  ))}
                  {draftRectangle ? (
                    <span
                      aria-hidden="true"
                      className={s.drawingRegion}
                      style={{
                        height: `${draftRectangle.height * 100}%`,
                        left: `${draftRectangle.x * 100}%`,
                        top: `${draftRectangle.y * 100}%`,
                        width: `${draftRectangle.width * 100}%`,
                      }}
                    />
                  ) : null}
                </div>
              ) : (
                <div className={s.pasteEmpty}>
                  <IconPhoto aria-hidden="true" />
                  <strong>Paste an image here</strong>
                  <span>
                    Click this area and press Ctrl/Cmd+V, or choose a file.
                  </span>
                </div>
              )}
            </div>
            <section className={s.regions}>
              <div className={s.sectionHeading}>
                <div>
                  <h2>Occlusion boxes</h2>
                  <p>Drag on the image. Each box becomes one memory.</p>
                </div>
                <span>{regions.length} boxes</span>
              </div>
              {regions.length ? (
                <div className={s.regionList}>
                  {regions.map((region, index) => (
                    <div className={s.regionCard} key={region.id}>
                      <strong>Box {index + 1}</strong>
                      <label className={s.field}>
                        <span>Optional hint or prompt</span>
                        <input
                          onChange={(event) => {
                            const hint = event.currentTarget.value
                            setRegions((current) =>
                              current.map((item) =>
                                item.id === region.id
                                  ? { ...item, hint }
                                  : item,
                              ),
                            )
                          }}
                          placeholder="e.g. Which structure is this?"
                          type="text"
                          value={region.hint ?? ""}
                        />
                        <small>Shown above the image during review.</small>
                      </label>
                      <button
                        className={s.removeRegion}
                        onClick={() =>
                          setRegions((current) =>
                            current.filter(
                              (_, regionIndex) => regionIndex !== index,
                            ),
                          )
                        }
                        type="button"
                      >
                        <IconTrash aria-hidden="true" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={s.emptyRegions}>
                  Draw at least one box on the image.
                </p>
              )}
            </section>
            <Button
              disabled={!image || regions.length === 0}
              name="intent"
              type="submit"
              value="preview"
            >
              <IconEye aria-hidden="true" />
              Validate and preview
            </Button>
          </form>
          <aside className={s.card}>
            <h2>
              <IconEye aria-hidden="true" /> Approval preview
            </h2>
            {actionData?.valid && imageUrl ? (
              <>
                <p className={s.previewNote}>
                  Each box becomes its own memory. During recall every box is
                  concealed and only the current target shows a question mark.
                </p>
                {regions.map((target, targetIndex) => (
                  <div className={s.promptPreview} key={target.id}>
                    <strong>Memory {targetIndex + 1}</strong>
                    {target.hint?.trim() ? (
                      <p className={s.challenge}>{target.hint.trim()}</p>
                    ) : null}
                    <div className={s.imageStage}>
                      <img alt="" src={imageUrl} />
                      {regions.map((region, regionIndex) => (
                        <span
                          aria-hidden="true"
                          className={
                            regionIndex === targetIndex
                              ? s.targetOcclusion
                              : s.occlusion
                          }
                          key={region.id}
                          style={{
                            height: `${region.height * 100}%`,
                            left: `${region.x * 100}%`,
                            top: `${region.y * 100}%`,
                            width: `${region.width * 100}%`,
                          }}
                        >
                          {regionIndex === targetIndex ? "?" : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <Form method="post">
                  {baseDigest ? (
                    <input name="baseDigest" type="hidden" value={baseDigest} />
                  ) : null}
                  <input
                    name="candidateJson"
                    type="hidden"
                    value={actionData.canonicalJson}
                  />
                  <input
                    name="assetBase64"
                    type="hidden"
                    value={image?.base64 ?? ""}
                  />
                  <input
                    name="assetMediaType"
                    type="hidden"
                    value={image?.mediaType ?? ""}
                  />
                  <input
                    name="assetName"
                    type="hidden"
                    value={image?.name ?? ""}
                  />
                  <input
                    name="promptIdsJson"
                    type="hidden"
                    value={JSON.stringify(actionData.promptIds)}
                  />
                  <Button name="intent" type="submit" value="accept">
                    <IconCheck aria-hidden="true" />
                    Approve and save {actionData.promptIds.length} memories
                  </Button>
                </Form>
              </>
            ) : actionData && !actionData.valid ? (
              <div className={s.error} role="alert">
                <h3>Fix these details</h3>
                <ul>
                  {actionData.diagnostics.map((item) => (
                    <li key={`${item.code}:${item.path}`}>
                      <strong>{item.code}</strong> {item.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className={s.empty}>
                Paste an image and draw its concealed regions to preview the
                review surface.
              </p>
            )}
          </aside>
        </div>
        <Link to="/create/manual">Create a text memory instead</Link>
      </div>
    </AppShell>
  )
}
