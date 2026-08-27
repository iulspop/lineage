import { Form } from "react-router"

import type { LineageDiagnostic } from "../domain/corpus"
import * as s from "./corpus-page.css"
import { AppShell } from "~/components/app-shell/app-shell"
import { Button } from "~/components/ui/button"
import { FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

type CorpusActionData =
  | {
      activated: boolean
      corpusId: string
      digest: string
      imported: true
      promptCount: number
    }
  | {
      valid: true
      preview: {
        canonicalJson: string
        diagnostics: LineageDiagnostic[]
        document: { corpusId: string; prompts: unknown[] }
        repairCount: number
      }
    }
  | {
      valid: false
      candidateJson: string
      diagnostics: LineageDiagnostic[]
    }
  | { error: string; diagnostics?: LineageDiagnostic[] }
  | undefined

export function CorpusPage({
  actionData,
  hasWorkspace,
  userEmail,
}: {
  actionData: CorpusActionData
  hasWorkspace: boolean
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
            .{" "}
            {actionData.activated
              ? "It is now your active workspace."
              : "Your current workspace was not changed."}{" "}
            Digest: <code>{actionData.digest}</code>
          </p>
        ) : null}
        {actionData &&
        "diagnostics" in actionData &&
        actionData.diagnostics &&
        actionData.diagnostics.length > 0 ? (
          <section
            aria-labelledby="diagnostics-title"
            className={s.diagnostics}
          >
            <h2 id="diagnostics-title">Validation diagnostics</h2>
            <ul>
              {actionData.diagnostics.map((diagnostic) => (
                <li key={`${diagnostic.code}:${diagnostic.path}`}>
                  <code>{diagnostic.code}</code> at{" "}
                  <code>{diagnostic.path}</code>
                  {": "}
                  {diagnostic.message}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className={s.card}>
          <h2>AI corpus candidate</h2>
          <p>
            Paste a candidate generated from the Lineage AI authoring
            specification. It remains untrusted until structural and semantic
            validation succeeds, any bounded localized repair is previewed, and
            you explicitly accept it.
          </p>
          <Form className={s.form} method="post">
            <FieldLabel htmlFor="candidate-json">
              Candidate corpus JSON
            </FieldLabel>
            <Textarea
              defaultValue={
                actionData && "candidateJson" in actionData
                  ? actionData.candidateJson
                  : undefined
              }
              id="candidate-json"
              name="candidateJson"
              placeholder='{"format":"lineage.corpus","formatVersion":1,...}'
              required
              rows={12}
            />
            <Button name="intent" type="submit" value="validate-candidate">
              Validate and preview candidate
            </Button>
          </Form>

          {actionData && "valid" in actionData && actionData.valid ? (
            <div className={s.preview}>
              <h3>Human approval preview</h3>
              <p>
                {actionData.preview.document.prompts.length} prompt
                {actionData.preview.document.prompts.length === 1 ? "" : "s"} in{" "}
                <strong>{actionData.preview.document.corpusId}</strong>.
                {actionData.preview.repairCount > 0
                  ? ` Applied ${actionData.preview.repairCount} localized repair pass.`
                  : " No repairs were needed."}
              </p>
              <pre>{actionData.preview.canonicalJson}</pre>
              <Form method="post">
                <input
                  name="candidateJson"
                  type="hidden"
                  value={actionData.preview.canonicalJson}
                />
                {hasWorkspace ? (
                  <fieldset>
                    <legend>After import</legend>
                    <label>
                      <input
                        name="activation"
                        required
                        type="radio"
                        value="keep-inactive"
                      />
                      Keep it inactive and preserve my current working context.
                    </label>
                    <label>
                      <input
                        name="activation"
                        required
                        type="radio"
                        value="activate"
                      />
                      Switch my entire working context to this workspace.
                    </label>
                  </fieldset>
                ) : (
                  <p>
                    This will become your active workspace because your account
                    is empty.
                  </p>
                )}
                <Button name="intent" type="submit" value="accept-candidate">
                  Accept and persist canonical corpus
                </Button>
              </Form>
            </div>
          ) : null}
        </section>

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
              {hasWorkspace ? (
                <fieldset>
                  <legend>After import</legend>
                  <label>
                    <input
                      name="activation"
                      required
                      type="radio"
                      value="keep-inactive"
                    />
                    Keep it inactive and preserve my current working context.
                  </label>
                  <label>
                    <input
                      name="activation"
                      required
                      type="radio"
                      value="activate"
                    />
                    Switch my entire working context to this workspace.
                  </label>
                </fieldset>
              ) : (
                <p>
                  This will become your active workspace because your account is
                  empty.
                </p>
              )}
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
