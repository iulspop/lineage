import { randomBytes } from "node:crypto"
import { data, redirect } from "react-router"

import type { Route } from "./+types/settings.integrations"
import { AppShell } from "~/components/app-shell/app-shell"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { retrieveOwnerStatusForUser } from "~/features/chat/infrastructure/chat-model.server"
import { IntegrationsPage } from "~/features/integrations/application/integrations-page"
import { isPermittedRegisteredRedirectUri } from "~/features/integrations/domain/oauth"
import {
  createIntegrationClient,
  listIntegrationClients,
  listUserIntegrationGrants,
  revokeIntegrationGrant,
} from "~/features/integrations/infrastructure/integration-model.server"
import { hashCredential } from "~/features/integrations/infrastructure/oauth-crypto.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

function parseRedirectUris(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null
  const uris = [
    ...new Set(
      value
        .split(/\r?\n/)
        .map((uri) => uri.trim())
        .filter(Boolean),
    ),
  ]
  if (uris.length === 0 || uris.length > 10) return null
  return uris.every(isPermittedRegisteredRedirectUri) ? uris : null
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const [grants, ownerStatus, user] = await Promise.all([
    listUserIntegrationGrants(userId),
    retrieveOwnerStatusForUser(userId),
    retrieveUserFromDatabaseById(userId),
  ])
  if (!user) throw redirect("/auth/signin")
  const isOwner = Boolean(ownerStatus)
  const clients = isOwner ? await listIntegrationClients() : []

  return {
    clients: clients.map((client) => ({
      clientId: client.clientId,
      clientType: client.clientType,
      disabledAt: client.disabledAt?.toISOString() ?? null,
      id: client.id,
      name: client.name,
      redirectUris: client.redirectUris.map((redirectUri) => redirectUri.uri),
    })),
    grants: grants.map((grant) => ({
      appName: grant.client.name,
      createdAt: grant.createdAt.toISOString(),
      id: grant.id,
      lastUsedAt: grant.lastUsedAt?.toISOString() ?? null,
      scope: grant.scope,
    })),
    isOwner,
    pageTitle: "Connected apps",
    userEmail: user.email,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "revokeGrant") {
    const grantId = formData.get("grantId")
    if (
      typeof grantId !== "string" ||
      !(await revokeIntegrationGrant(userId, grantId))
    ) {
      return data(
        { error: "Connection not found", success: false as const },
        { status: 404 },
      )
    }
    return data({ success: true as const })
  }

  if (intent !== "createClient") {
    return data(
      { error: "Invalid form data", success: false as const },
      { status: 400 },
    )
  }

  if (!(await retrieveOwnerStatusForUser(userId))) {
    return data(
      { error: "Owner access required", success: false as const },
      { status: 403 },
    )
  }

  const name = formData.get("name")
  const clientType = formData.get("clientType")
  const redirectUris = parseRedirectUris(formData.get("redirectUris"))
  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.trim().length > 120 ||
    (clientType !== "public" && clientType !== "confidential") ||
    !redirectUris
  ) {
    return data(
      { error: "Invalid client registration", success: false as const },
      { status: 400 },
    )
  }

  const clientId = randomBytes(24).toString("base64url")
  const clientSecret =
    clientType === "confidential" ? randomBytes(32).toString("base64url") : null
  await createIntegrationClient({
    clientId,
    clientSecretHash: clientSecret ? hashCredential(clientSecret) : null,
    clientType,
    createdByUserId: userId,
    name: name.trim(),
    redirectUris,
  })

  return data({ clientId, clientSecret, success: true as const })
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.pageTitle },
]

export default function SettingsIntegrationsRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <AppShell isOwner={loaderData.isOwner} userEmail={loaderData.userEmail}>
      <IntegrationsPage
        actionData={actionData}
        clients={loaderData.clients}
        grants={loaderData.grants}
        isOwner={loaderData.isOwner}
      />
    </AppShell>
  )
}
