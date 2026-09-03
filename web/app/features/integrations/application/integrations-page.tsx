import { Select } from "@base-ui/react/select"
import {
  IconArrowLeft,
  IconCheck,
  IconChevronDown,
  IconKey,
  IconPlugConnected,
  IconPlus,
  IconRobot,
  IconShieldCheck,
} from "@tabler/icons-react"
import { Form, Link } from "react-router"

import { Button } from "~/components/ui/button"
import { FieldError } from "~/components/ui/field"
import { Input, inputStyles } from "~/components/ui/input"
import * as s from "~/features/integrations/application/integrations-page.css"
import { formatDate, useTimeZone } from "~/utils/time-zone"

type GrantSummary = {
  appName: string
  connectionType: "mcp" | "integration"
  createdAt: string
  id: string
  lastUsedAt: string | null
  registrationType: "dynamic" | "manual"
  scope: string
}

type ClientSummary = {
  clientId: string
  clientType: string
  disabledAt: string | null
  id: string
  name: string
  redirectUris: string[]
  registrationType: "dynamic" | "manual"
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
  mcpUrl = "/mcp",
}: {
  actionData?: ActionData
  clients: ClientSummary[]
  grants: GrantSummary[]
  isOwner: boolean
  mcpUrl?: string
}) {
  const timeZone = useTimeZone()
  const enabledClients = clients.filter((client) => !client.disabledAt).length

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <p className={s.eyebrow}>Access & permissions</p>
          <h1 className={s.title}>Connected apps</h1>
          <p className={s.subtitle}>
            Control which applications and AI assistants can create Memories in
            your active workspace.
          </p>
        </div>
        <Link className={s.backLink} to="/settings">
          <IconArrowLeft aria-hidden="true" size={16} />
          Settings
        </Link>
      </header>

      <div className={s.overview}>
        <div className={s.overviewCard}>
          <span className={s.overviewIcon}>
            <IconPlugConnected aria-hidden="true" size={20} />
          </span>
          <div>
            <span className={s.overviewLabel}>Active connections</span>
            <span className={s.overviewValue}>{grants.length}</span>
          </div>
        </div>
        <div className={s.overviewCard}>
          <span className={s.overviewIcon}>
            <IconShieldCheck aria-hidden="true" size={20} />
          </span>
          <div>
            <span className={s.overviewLabel}>Permission granted</span>
            <span className={s.overviewValue}>Create Memories only</span>
          </div>
        </div>
      </div>

      <div className={s.stack}>
        <section className={s.connectionGuide}>
          <div className={s.guideHeader}>
            <IconRobot
              aria-hidden="true"
              className={s.panelHeaderIcon}
              size={20}
            />
            <div>
              <h2>Connect an AI agent</h2>
              <p>
                Add Lineage as a remote MCP server in your agent, then approve
                its limited access here.
              </p>
            </div>
          </div>
          <div className={s.guideBody}>
            <ol className={s.guideSteps}>
              <li>
                In your AI agent, add a remote MCP server and use this URL.
              </li>
              <li>
                Sign in to Lineage when the agent opens the authorization page.
              </li>
              <li>
                Approve Create Memories access. The agent cannot read your
                Library, answers, or review history.
              </li>
            </ol>
            <div className={s.endpointBlock}>
              <span className={s.endpointLabel}>MCP server URL</span>
              <code className={s.endpointValue}>{mcpUrl}</code>
            </div>
          </div>
        </section>

        <section className={s.panel}>
          <div className={s.panelHeader}>
            <IconPlugConnected
              aria-hidden="true"
              className={s.panelHeaderIcon}
              size={20}
            />
            <div>
              <h2>Connections</h2>
              <p>
                Apps with access to your workspace. Revoking access immediately
                invalidates their credentials.
              </p>
            </div>
          </div>

          {grants.length === 0 ? (
            <div className={s.emptyState}>
              <span className={s.emptyIcon}>
                <IconRobot aria-hidden="true" size={22} />
              </span>
              <p className={s.emptyTitle}>No apps connected</p>
              <p className={s.emptyDescription}>
                When you authorize an AI assistant or another application, it
                will appear here with its exact permission and activity.
              </p>
            </div>
          ) : (
            <ul className={s.connectionList}>
              {grants.map((grant) => (
                <li className={s.connectionItem} key={grant.id}>
                  <div className={s.connectionIdentity}>
                    <span className={s.appIcon}>
                      {grant.connectionType === "mcp" ? (
                        <IconRobot aria-hidden="true" size={20} />
                      ) : (
                        <IconPlugConnected aria-hidden="true" size={20} />
                      )}
                    </span>
                    <div className={s.connectionCopy}>
                      <p className={s.connectionTitle}>{grant.appName}</p>
                      <p className={s.connectionMeta}>
                        Connected {formatDate(grant.createdAt, timeZone)}
                        {grant.lastUsedAt
                          ? ` · Last used ${formatDate(grant.lastUsedAt, timeZone)}`
                          : " · Not used yet"}
                      </p>
                      <div className={s.chips}>
                        <span className={s.chip}>
                          {grant.connectionType === "mcp"
                            ? "MCP connection"
                            : "Connected application"}
                        </span>
                        <span className={s.chip}>Can create Memories</span>
                        <span className={s.chip}>
                          {grant.registrationType === "dynamic"
                            ? "Dynamically registered"
                            : "Owner managed"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Form method="post">
                    <input name="grantId" type="hidden" value={grant.id} />
                    <Button
                      name="intent"
                      size="sm"
                      type="submit"
                      value="revokeGrant"
                      variant="destructive"
                    >
                      Revoke access
                    </Button>
                  </Form>
                </li>
              ))}
            </ul>
          )}
        </section>

        {isOwner && (
          <section className={s.panel}>
            <div className={s.panelHeader}>
              <IconKey
                aria-hidden="true"
                className={s.panelHeaderIcon}
                size={20}
              />
              <div>
                <h2>Approved clients</h2>
                <p>
                  Developer controls for trusted applications using exact OAuth
                  redirect URIs. {enabledClients} currently enabled.
                </p>
              </div>
            </div>

            <Form className={s.registrationForm} method="post">
              <div className={s.formGrid}>
                <div className={s.field}>
                  <label className={s.label} htmlFor="client-name">
                    Application name
                  </label>
                  <Input
                    id="client-name"
                    name="name"
                    placeholder="e.g. Study assistant"
                    required
                    type="text"
                  />
                </div>
                <div className={s.field}>
                  <label className={s.label} htmlFor="client-type">
                    Client type
                  </label>
                  <Select.Root
                    defaultValue="public"
                    id="client-type"
                    items={{
                      confidential: "Confidential",
                      public: "Public (PKCE)",
                    }}
                    name="clientType"
                  >
                    <Select.Trigger className={s.selectTrigger}>
                      <Select.Value />
                      <Select.Icon className={s.selectIcon}>
                        <IconChevronDown aria-hidden size={18} />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Positioner
                        className={s.selectPositioner}
                        sideOffset={6}
                      >
                        <Select.Popup className={s.selectPopup}>
                          <Select.Item className={s.selectItem} value="public">
                            <Select.ItemText>Public (PKCE)</Select.ItemText>
                            <Select.ItemIndicator className={s.selectIndicator}>
                              <IconCheck aria-hidden size={16} />
                            </Select.ItemIndicator>
                          </Select.Item>
                          <Select.Item
                            className={s.selectItem}
                            value="confidential"
                          >
                            <Select.ItemText>Confidential</Select.ItemText>
                            <Select.ItemIndicator className={s.selectIndicator}>
                              <IconCheck aria-hidden size={16} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        </Select.Popup>
                      </Select.Positioner>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div className={`${s.field} ${s.fieldWide}`}>
                  <label className={s.label} htmlFor="redirect-uris">
                    Redirect URIs
                  </label>
                  <textarea
                    aria-describedby="redirect-help"
                    className={inputStyles.textarea}
                    id="redirect-uris"
                    name="redirectUris"
                    placeholder="https://example.com/oauth/callback"
                    required
                    rows={3}
                  />
                  <span className={s.help} id="redirect-help">
                    One exact HTTPS URI per line. HTTP is allowed only for
                    loopback hosts.
                  </span>
                </div>
              </div>
              <div className={s.formFooter}>
                <Button name="intent" type="submit" value="createClient">
                  <IconPlus aria-hidden="true" size={16} />
                  Register client
                </Button>
              </div>
            </Form>

            {actionData?.success && "clientId" in actionData && (
              <div className={s.result}>
                <p className={s.resultTitle}>Client registered</p>
                <p className={s.resultValue}>
                  Client ID: {actionData.clientId}
                </p>
                {actionData.clientSecret && (
                  <p className={s.resultValue}>
                    Client secret (shown once): {actionData.clientSecret}
                  </p>
                )}
              </div>
            )}

            {clients.length > 0 && (
              <ul className={s.clientList}>
                {clients.map((client) => (
                  <li className={s.clientItem} key={client.id}>
                    <div className={s.connectionCopy}>
                      <p className={s.connectionTitle}>{client.name}</p>
                      <p className={s.clientUri}>
                        {client.registrationType === "dynamic"
                          ? "Dynamically registered"
                          : "Owner managed"}
                        {` · ${client.clientType}`}
                        {client.redirectUris.length > 0
                          ? ` · ${client.redirectUris.join(", ")}`
                          : ""}
                      </p>
                    </div>
                    <span className={s.statusBadge}>
                      {client.disabledAt ? "Disabled" : "Enabled"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {actionData && !actionData.success && (
        <FieldError className={s.status}>{actionData.error}</FieldError>
      )}
    </section>
  )
}
