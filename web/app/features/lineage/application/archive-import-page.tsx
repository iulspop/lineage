import { Link } from "react-router"

import * as s from "./data-portability-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { PageHeader } from "~/components/ui/page-header"

export function ArchiveImportPage({
  actionData,
  hasWorkspace,
  userEmail,
}: {
  actionData?: {
    activated?: boolean
    corpusId?: string
    error?: string
    promptCount?: number
  }
  hasWorkspace: boolean
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
                now durable.{" "}
                {actionData.activated
                  ? "It is now your active workspace."
                  : "Your current workspace was not changed."}
              </p>
            </div>
            <Link
              to={actionData.activated ? "/library" : "/settings/workspace"}
            >
              {actionData.activated ? "Open workspace" : "Manage workspaces"}
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
            {hasWorkspace ? (
              <fieldset>
                <legend>After import</legend>
                <label className={s.confirm}>
                  <input
                    name="activation"
                    required
                    type="radio"
                    value="keep-inactive"
                  />
                  Keep it as an inactive workspace. My current working context
                  stays unchanged.
                </label>
                <label className={s.confirm}>
                  <input
                    name="activation"
                    required
                    type="radio"
                    value="activate"
                  />
                  Switch my entire working context to the imported workspace.
                </label>
              </fieldset>
            ) : (
              <p>
                This will become your active workspace because your account is
                empty.
              </p>
            )}
            <label className={s.confirm}>
              <input name="confirmed" required type="checkbox" />
              Import this archive after all checks pass without merging it into
              another workspace.
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
