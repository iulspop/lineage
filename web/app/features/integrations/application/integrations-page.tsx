import { IconPlugConnected, IconPlus } from "@tabler/icons-react"
import { Form, Link } from "react-router"

import { Button } from "~/components/ui/button"
import { FieldError } from "~/components/ui/field"
import * as s from "~/features/auth/application/settings-page.css"
import { formatDate, useTimeZone } from "~/utils/time-zone"

type GrantSummary = {
  appName: string
  createdAt: string
  id: string
  lastUsedAt: string | null
  scope: string
}

type ClientSummary = {
  clientId: string
  clientType: string
  disabledAt: string | null
  id: string
  name: string
  redirectUris: string[]
}

type ActionData =
  | { clientId: string; clientSecret: string | null; success: true }
  | { error: string; success: false }
  | { success: true }
  | undefined

export function IntegrationsPage({
  actionData,
  clients,
  grants,
  isOwner,
}: {
  actionData?: ActionData
  clients: ClientSummary[]
  grants: GrantSummary[]
  isOwner: boolean
}) {
  const timeZone = useTimeZone()

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>Connected apps</h1>
          <p className={s.subtitle}>
            Manage applications allowed to create Memories in your active
            workspace.
          </p>
        </div>
        <Link className={s.backLink} to="/settings">
          Back to settings
        </Link>
      </header>

      <section className={s.section}>
        <div className={s.sectionHeading}>
          <h2>Connections</h2>
          <p>
            Revoking a connection immediately invalidates its active
            credentials.
          </p>
        </div>
        {grants.length === 0 ? (
          <p className={s.settingDescription}>No applications are connected.</p>
        ) : (
          <ul className={s.passkeyList}>
            {grants.map((grant) => (
              <li className={s.passkeyItem} key={grant.id}>
                <IconPlugConnected
                  aria-hidden="true"
                  className={s.rowIcon}
                  size={17}
                />
                <div className={s.settingCopy}>
                  <span className={s.settingTitle}>{grant.appName}</span>
                  <span className={s.settingDescription}>
                    Can create Memories · Connected{" "}
                    {formatDate(grant.createdAt, timeZone)}
                    {grant.lastUsedAt
                      ? ` · Last used ${formatDate(grant.lastUsedAt, timeZone)}`
                      : " · Not used yet"}
                  </span>
                </div>
                <Form method="post">
                  <input name="grantId" type="hidden" value={grant.id} />
                  <Button
                    name="intent"
                    size="xs"
                    type="submit"
                    value="revokeGrant"
                    variant="destructive"
                  >
                    Revoke
                  </Button>
                </Form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOwner && (
        <section className={s.section}>
          <div className={s.sectionHeading}>
            <h2>Approved clients</h2>
            <p>Register a trusted application with exact redirect URIs.</p>
          </div>
          <Form method="post">
            <div className={s.settingRow}>
              <IconPlus aria-hidden="true" className={s.rowIcon} size={17} />
              <div className={s.settingCopy}>
                <label className={s.settingTitle} htmlFor="client-name">
                  Application name
                </label>
                <input id="client-name" name="name" required type="text" />
              </div>
              <div className={s.settingCopy}>
                <label className={s.settingTitle} htmlFor="client-type">
                  Client type
                </label>
                <select
                  defaultValue="public"
                  id="client-type"
                  name="clientType"
                >
                  <option value="public">Public</option>
                  <option value="confidential">Confidential</option>
                </select>
              </div>
            </div>
            <div className={s.settingRow}>
              <div className={s.settingCopy}>
                <label className={s.settingTitle} htmlFor="redirect-uris">
                  Redirect URIs
                </label>
                <textarea
                  aria-describedby="redirect-help"
                  id="redirect-uris"
                  name="redirectUris"
                  required
                  rows={3}
                />
                <span className={s.settingDescription} id="redirect-help">
                  One exact HTTPS URI per line. HTTP is allowed only for
                  loopback hosts.
                </span>
              </div>
              <Button name="intent" type="submit" value="createClient">
                Register client
              </Button>
            </div>
          </Form>

          {actionData?.success && "clientId" in actionData && (
            <div className={s.notificationRows}>
              <p className={s.settingTitle}>Client registered</p>
              <p className={s.settingDescription}>
                Client ID: {actionData.clientId}
              </p>
              {actionData.clientSecret && (
                <p className={s.settingDescription}>
                  Client secret (shown once): {actionData.clientSecret}
                </p>
              )}
            </div>
          )}

          {clients.length > 0 && (
            <ul className={s.passkeyList}>
              {clients.map((client) => (
                <li className={s.passkeyItem} key={client.id}>
                  <div className={s.settingCopy}>
                    <span className={s.settingTitle}>{client.name}</span>
                    <span className={s.settingDescription}>
                      {client.clientType} · {client.redirectUris.join(", ")}
                    </span>
                  </div>
                  <span className={s.badge}>
                    {client.disabledAt ? "Disabled" : "Enabled"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {actionData && !actionData.success && (
        <FieldError className={s.status}>{actionData.error}</FieldError>
      )}
    </section>
  )
}
