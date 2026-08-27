import * as s from "./data-portability-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

export type DataPortabilityPageProps = {
  actionData?: {
    error?: string
    restored?: {
      activeLineageCorpusId: string | null
      assetCount: number
      reviewCount: number
      snapshotCount: number
    }
  }
  hasWorkspace: boolean
  userEmail: string
}

export function DataPortabilityPage({
  actionData,
  hasWorkspace,
  userEmail,
}: DataPortabilityPageProps) {
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Keep a complete, self-contained copy of immutable corpus snapshots, review history, and media."
          eyebrow="Settings · Data"
          title="Export and recover your Lineage data"
        />
        {actionData?.error ? (
          <p className={s.error} role="alert">
            {actionData.error}
          </p>
        ) : null}
        {actionData?.restored ? (
          <p className={s.success} role="status">
            Recovered {actionData.restored.snapshotCount} snapshots,{" "}
            {actionData.restored.reviewCount} reviews, and{" "}
            {actionData.restored.assetCount} assets.
            {actionData.restored.activeLineageCorpusId
              ? ` Active workspace: ${actionData.restored.activeLineageCorpusId}.`
              : " No active workspace was present in the export."}
          </p>
        ) : null}
        <section className={s.card}>
          <div>
            <h2>Complete data export</h2>
            <p>
              Download every immutable snapshot, append-only review event, and
              persisted asset associated with your account.
            </p>
          </div>
          <a href="/settings/data/export">Download complete export</a>
        </section>
        <section className={s.card}>
          <div>
            <h2>Recover from an export</h2>
            <p>
              Lineage verifies snapshot digests, Prompt revision references, and
              asset dependency closure before writing anything. Recovery
              restores the exported active-workspace preference when possible.
            </p>
          </div>
          <form encType="multipart/form-data" method="post">
            <input name="intent" type="hidden" value="restore" />
            <label>
              Lineage user-data archive
              <input
                accept=".lineage,.zip,application/zip"
                name="archive"
                required
                type="file"
              />
            </label>
            {hasWorkspace ? (
              <label className={s.confirm}>
                <input
                  name="recoveryMode"
                  required
                  type="radio"
                  value="replace"
                />
                Replace every existing Lineage workspace, review, and asset with
                this complete recovery export. This cannot be merged safely.
              </label>
            ) : (
              <p>
                Your empty account will adopt the active workspace recorded in
                the export.
              </p>
            )}
            <label className={s.confirm}>
              <input name="confirmed" required type="checkbox" />I understand
              that complete recovery replaces existing Lineage data when
              present.
            </label>
            <button type="submit">Verify and recover</button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}
