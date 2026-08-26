import * as s from "./data-portability-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

export type DataPortabilityPageProps = {
  actionData?: {
    error?: string
    restored?: {
      assetCount: number
      reviewCount: number
      snapshotCount: number
    }
  }
  userEmail: string
}

export function DataPortabilityPage({
  actionData,
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
              asset dependency closure before writing anything. Existing data
              causes the restore to stop rather than overwrite history.
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
            <label className={s.confirm}>
              <input name="confirmed" required type="checkbox" />I understand
              that recovery is append-only and rejects conflicts.
            </label>
            <button type="submit">Verify and recover</button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}
