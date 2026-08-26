import { Form } from "react-router"

import * as s from "./corpus-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

type CorpusActionData =
  | { corpusId: string; digest: string; imported: true; promptCount: number }
  | { error: string }
  | undefined

export function CorpusPage({
  actionData,
  userEmail,
}: {
  actionData: CorpusActionData
  userEmail: string
}) {
  return (
    <AppShell userEmail={userEmail}>
      <div className={s.page}>
        <header className={s.header}>
          <p className={s.eyebrow}>Durable corpus</p>
          <h1>Corpora</h1>
          <p>
            Import canonical Lineage JSON through the proved validation
            boundary, or export the latest snapshot that belongs to your
            account.
          </p>
        </header>

        {actionData && "error" in actionData ? (
          <p className={s.error} role="alert">
            {actionData.error}
          </p>
        ) : null}
        {actionData && "imported" in actionData ? (
          <p className={s.success} role="status">
            Imported {actionData.promptCount} prompt
            {actionData.promptCount === 1 ? "" : "s"} into {actionData.corpusId}
            . Digest: <code>{actionData.digest}</code>
          </p>
        ) : null}

        <div className={s.grid}>
          <section className={s.card}>
            <h2>Import corpus</h2>
            <Form className={s.form} method="post">
              <FieldLabel htmlFor="corpus-json">
                Canonical corpus JSON
              </FieldLabel>
              <Textarea
                id="corpus-json"
                name="corpusJson"
                placeholder='{"format":"lineage.corpus","formatVersion":1,...}'
                required
                rows={16}
              />
              <Button name="intent" type="submit" value="import">
                Validate and import
              </Button>
            </Form>
          </section>

          <section className={s.card}>
            <h2>Export corpus</h2>
            <Form className={s.form} method="post">
              <FieldLabel htmlFor="corpus-id">Corpus ID</FieldLabel>
              <Input id="corpus-id" name="corpusId" required />
              <Button name="intent" type="submit" value="export">
                Download latest snapshot
              </Button>
            </Form>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
