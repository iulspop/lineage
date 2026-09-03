import { data, Form, redirect } from "react-router"

import type { Route } from "./+types/oauth.authorize"
import { getUserId } from "~/features/auth/application/auth-session.server"
import {
  issueAuthorizationCode,
  resolveAuthorizationClient,
} from "~/features/integrations/application/oauth-service.server"
import {
  appendAuthorizationResult,
  authorizationRequestSchema,
  normalizeScope,
} from "~/features/integrations/domain/oauth"

function authorizationValues(entries: URLSearchParams | FormData) {
  const values: Record<string, string> = {}
  for (const [key, value] of entries) {
    if (typeof value !== "string" || key in values) return null
    values[key] = value
  }
  return values
}

async function validatedAuthorizationRequest(values: Record<string, string>) {
  const parsed = authorizationRequestSchema.safeParse(values)
  if (!parsed.success) return null
  const scope = normalizeScope(parsed.data.scope)
  if (!scope.valid) return null
  const client = await resolveAuthorizationClient({
    clientId: parsed.data.client_id,
    redirectUri: parsed.data.redirect_uri,
  })
  return client ? { client, request: parsed.data } : null
}

export async function loader({ request }: Route.LoaderArgs) {
  const values = authorizationValues(new URL(request.url).searchParams)
  if (!values)
    return data({ error: "Invalid authorization request" }, { status: 400 })
  const validated = await validatedAuthorizationRequest(values)
  if (!validated)
    return data({ error: "Invalid authorization request" }, { status: 400 })
  const userId = await getUserId(request)
  if (!userId) throw redirect("/auth/signin")
  return {
    clientName: validated.client.name,
    request: validated.request,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await getUserId(request)
  if (!userId) throw redirect("/auth/signin")
  const formData = await request.formData()
  const decision = formData.get("decision")
  formData.delete("decision")
  const values = authorizationValues(formData)
  if (!values)
    return data({ error: "Invalid authorization request" }, { status: 400 })
  const validated = await validatedAuthorizationRequest(values)
  if (!validated)
    return data({ error: "Invalid authorization request" }, { status: 400 })

  if (decision === "deny")
    throw redirect(
      appendAuthorizationResult(validated.request.redirect_uri, {
        error: "access_denied",
        state: validated.request.state,
      }),
    )
  if (decision !== "allow")
    return data({ error: "Choose Allow or Deny" }, { status: 400 })

  const code = await issueAuthorizationCode({
    clientDatabaseId: validated.client.id,
    codeChallenge: validated.request.code_challenge,
    redirectUri: validated.request.redirect_uri,
    resource: validated.request.resource,
    userId,
  })
  throw redirect(
    appendAuthorizationResult(validated.request.redirect_uri, {
      code,
      state: validated.request.state,
    }),
  )
}

export const meta: Route.MetaFunction = () => [{ title: "Connect an app" }]

export default function OAuthAuthorizeRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  if ("error" in loaderData)
    return (
      <main>
        <h1>Unable to connect app</h1>
        <p>{loaderData.error}</p>
      </main>
    )

  return (
    <main>
      <h1>Connect {loaderData.clientName}?</h1>
      <p>
        This app is requesting permission to create Memories directly in your
        currently active Lineage workspace.
      </p>
      <p>
        It will not be able to read your corpus, answers, review history, or
        scheduling data.
      </p>
      {actionData?.error ? <p role="alert">{actionData.error}</p> : null}
      <Form method="post">
        {Object.entries(loaderData.request).map(([name, value]) => (
          <input key={name} name={name} type="hidden" value={value} />
        ))}
        <button name="decision" type="submit" value="deny">
          Deny
        </button>
        <button name="decision" type="submit" value="allow">
          Allow direct creation
        </button>
      </Form>
    </main>
  )
}
