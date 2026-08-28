import { IconCheck, IconEye, IconPhoto } from "@tabler/icons-react"
import { Form, Link } from "react-router"

import type { LineageDiagnostic } from "../domain/corpus"
import type { ImageOcclusionDraft } from "./image-occlusion-draft"
import * as s from "./image-occlusion-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { PageHeader } from "~/components/ui/page-header"

type ActionData =
  | ({ draft: ImageOcclusionDraft } & (
      | {
          canonicalJson: string
          valid: true
        }
      | { diagnostics: LineageDiagnostic[]; valid: false }
    ))
  | undefined

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
  const imageUrl = draft?.imageBase64
    ? `data:${draft.imageMediaType};base64,${draft.imageBase64}`
    : null
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Upload an image, define a stable normalized region, and approve the exact concealed and revealed presentation before saving."
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
            {draft?.imageBase64 ? (
              <input
                name="existingImageBase64"
                type="hidden"
                value={draft.imageBase64}
              />
            ) : null}
            {draft?.imageMediaType ? (
              <input
                name="existingImageMediaType"
                type="hidden"
                value={draft.imageMediaType}
              />
            ) : null}
            {draft?.imageName ? (
              <input
                name="existingImageName"
                type="hidden"
                value={draft.imageName}
              />
            ) : null}
            <h2>
              <IconPhoto aria-hidden="true" /> Image and memory
            </h2>
            <input
              name="corpusId"
              type="hidden"
              value={draft?.corpusId ?? ""}
            />
            <label className={s.field}>
              <span>Stable memory ID</span>
              <input
                defaultValue={draft?.promptId}
                name="promptId"
                readOnly={isRevision}
                required
              />
            </label>
            <label className={s.field}>
              <span>Image</span>
              <input
                accept="image/png,image/jpeg"
                name="image"
                required={!draft?.imageBase64}
                type="file"
              />
              <small>
                PNG or JPEG, up to 5 MB. Integrity metadata is computed by
                Lineage.
              </small>
            </label>
            <label className={s.field}>
              <span>Image accessibility description</span>
              <input
                defaultValue={draft?.accessibleDescription}
                name="accessibleDescription"
                required
              />
            </label>
            <label className={s.field}>
              <span>Challenge</span>
              <textarea
                defaultValue={draft?.challenge}
                name="challenge"
                required
                rows={3}
              />
            </label>
            <label className={s.field}>
              <span>Answer</span>
              <textarea
                defaultValue={draft?.answer}
                name="answer"
                required
                rows={3}
              />
            </label>
            <div className={s.regionGrid}>
              {(["x", "y", "width", "height"] as const).map((field) => (
                <label className={s.field} key={field}>
                  <span>
                    {field === "x" || field === "y"
                      ? field.toUpperCase()
                      : field}
                  </span>
                  <input
                    defaultValue={
                      draft?.[field] ??
                      (field === "width" || field === "height" ? 0.25 : 0.1)
                    }
                    max="1"
                    min="0"
                    name={field}
                    required
                    step="0.01"
                    type="number"
                  />
                </label>
              ))}
            </div>
            <label className={s.field}>
              <span>Region label</span>
              <input
                defaultValue={draft?.regionLabel}
                name="regionLabel"
                required
              />
            </label>
            <label className={s.field}>
              <span>Region accessibility description</span>
              <input
                defaultValue={draft?.regionDescription}
                name="regionDescription"
                required
              />
            </label>
            <Button name="intent" type="submit" value="preview">
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
                <p className={s.challenge}>{draft?.challenge}</p>
                <div className={s.imageStage}>
                  <img
                    alt={draft?.accessibleDescription ?? ""}
                    src={imageUrl}
                  />
                  <span
                    aria-hidden="true"
                    className={s.occlusion}
                    style={{
                      height: `${(draft?.height ?? 0) * 100}%`,
                      left: `${(draft?.x ?? 0) * 100}%`,
                      top: `${(draft?.y ?? 0) * 100}%`,
                      width: `${(draft?.width ?? 0) * 100}%`,
                    }}
                  />
                </div>
                <details>
                  <summary>Reveal resolution</summary>
                  <p>{draft?.answer}</p>
                </details>
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
                    value={draft?.imageBase64}
                  />
                  <input
                    name="assetMediaType"
                    type="hidden"
                    value={draft?.imageMediaType}
                  />
                  <input
                    name="assetName"
                    type="hidden"
                    value={draft?.imageName}
                  />
                  <input
                    name="promptId"
                    type="hidden"
                    value={draft?.promptId}
                  />
                  <Button name="intent" type="submit" value="accept">
                    <IconCheck aria-hidden="true" />
                    Approve and save
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
                Upload an image and define its concealed region to preview the
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
