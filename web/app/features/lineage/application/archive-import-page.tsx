import { Link } from "react-router"

import * as s from "./data-portability-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

export function ArchiveImportPage({
  actionData,
  userEmail,
}: {
  actionData?: { corpusId?: string; error?: string; promptCount?: number }
  userEmail: string
}) {
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <PageHeader
          description="Upload a self-contained .lineage archive. Paths, sizes, digests, corpus semantics, and media dependency closure are verified before persistence."
          eyebrow="Create · Import"
          title="Import a portable corpus"
        />
        {actionData?.error ? (
          <p className={s.error} role="alert">
            {actionData.error}
          </p>
        ) : null}
        {actionData?.corpusId ? (
          <section className={s.card}>
            <div>
              <h2>Corpus imported</h2>
              <p>
                {actionData.promptCount} memories and their referenced media are
                now durable.
              </p>
            </div>
            <Link to={`/library/${encodeURIComponent(actionData.corpusId)}`}>
              Open corpus
            </Link>
          </section>
        ) : null}
        <section className={s.card}>
          <div>
            <h2>Lineage archive</h2>
            <p>
              The archive must include manifest.json, corpus.json, and every
              declared asset. Import is rejected if any integrity claim is
              inconsistent.
            </p>
          </div>
          <form encType="multipart/form-data" method="post">
            <label>
              Portable corpus archive
              <input
                accept=".lineage,.zip,application/zip"
                name="archive"
                required
                type="file"
              />
            </label>
            <label className={s.confirm}>
              <input name="confirmed" required type="checkbox" />
              Import this archive after all checks pass.
            </label>
            <button type="submit">Verify and import</button>
          </form>
        </section>
        <p>
          <Link to="/create/import">
            Use advanced canonical JSON tools instead
          </Link>
        </p>
      </div>
    </AppShell>
  )
}
