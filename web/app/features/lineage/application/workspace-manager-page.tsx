import { IconCheck, IconDatabase, IconPlus } from "@tabler/icons-react"
import { Form, Link } from "react-router"

import * as s from "./workspace-manager-page.css"
import { Button } from "~/components/ui/button"
import { FieldError } from "~/components/ui/field"

type WorkspaceSummary = {
  active: boolean
  corpusId: string
  memoryCount: number
}

type WorkspaceManagerActionData =
  | { error: string; success: false }
  | { corpusId: string; success: true }
  | undefined

export function WorkspaceManagerPage({
  actionData,
  workspaces,
}: {
  actionData?: WorkspaceManagerActionData
  workspaces: WorkspaceSummary[]
}) {
  const activeWorkspace = workspaces.find((workspace) => workspace.active)

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Settings</p>
          <h1>Workspace</h1>
          <p>
            Your workspace is the complete context for Today, Library, Create,
            Review, and Insights. Switch only when you intend to change that
            entire context.
          </p>
        </div>
        <Link className={s.backLink} to="/settings">
          Back to settings
        </Link>
      </header>

      {actionData?.success === false ? (
        <FieldError className={s.status}>{actionData.error}</FieldError>
      ) : null}
      {actionData?.success ? (
        <p className={s.success} role="status">
          {actionData.corpusId} is now your active workspace.
        </p>
      ) : null}

      <section className={s.section}>
        <div className={s.sectionHeading}>
          <h2>Current workspace</h2>
          <p>
            {activeWorkspace
              ? `${activeWorkspace.corpusId} contains ${activeWorkspace.memoryCount} memories.`
              : "Create or select a workspace to begin."}
          </p>
        </div>

        <ul className={s.workspaceList}>
          {workspaces.map((workspace) => (
            <li className={s.workspaceCard} key={workspace.corpusId}>
              <IconDatabase aria-hidden="true" />
              <div className={s.workspaceCopy}>
                <strong>{workspace.corpusId}</strong>
                <span>{workspace.memoryCount} memories</span>
              </div>
              {workspace.active ? (
                <span className={s.activeBadge}>
                  <IconCheck aria-hidden="true" /> Active
                </span>
              ) : (
                <Form method="post">
                  <input
                    name="corpusId"
                    type="hidden"
                    value={workspace.corpusId}
                  />
                  <Button name="intent" size="sm" type="submit" value="select">
                    Switch workspace
                  </Button>
                </Form>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={s.section}>
        <div className={s.sectionHeading}>
          <h2>Start a separate workspace</h2>
          <p>
            Use this only for a genuinely separate body of knowledge or a fresh
            start. It does not merge or move anything from your current
            workspace.
          </p>
        </div>
        <Form className={s.createForm} method="post">
          <label>
            <span>Workspace ID</span>
            <input
              autoComplete="off"
              name="corpusId"
              pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
              placeholder="polypan"
              required
            />
          </label>
          <label className={s.confirmation}>
            <input name="confirmed" required type="checkbox" />
            <span>
              I understand this creates and activates a separate empty
              workspace.
            </span>
          </label>
          <Button name="intent" type="submit" value="create">
            <IconPlus aria-hidden="true" /> Create workspace
          </Button>
        </Form>
      </section>
    </section>
  )
}
