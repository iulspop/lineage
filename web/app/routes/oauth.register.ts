import type { Route } from "./+types/oauth.register"
import { registerDynamicClient } from "~/features/integrations/application/oauth-service.server"
import { dynamicClientRegistrationSchema } from "~/features/integrations/domain/oauth"
import { secureCredentialHeaders } from "~/features/integrations/infrastructure/integration-http.server"

const MAX_REGISTRATION_BODY_BYTES = 16_384

function registrationError(description: string, status = 400) {
  return Response.json(
    {
      error: "invalid_client_metadata",
      error_description: description,
    },
    { headers: secureCredentialHeaders(), status },
  )
}

export async function action({ request }: Route.ActionArgs) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) {
    return registrationError("Use JSON client metadata", 415)
  }

  const declaredLength = Number(request.headers.get("Content-Length") ?? 0)
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_REGISTRATION_BODY_BYTES
  ) {
    return registrationError("Request body is too large", 413)
  }

  const body = await request.text()
  if (Buffer.byteLength(body) > MAX_REGISTRATION_BODY_BYTES) {
    return registrationError("Request body is too large", 413)
  }

  let input: unknown
  try {
    input = JSON.parse(body)
  } catch {
    return registrationError("Invalid JSON client metadata")
  }
  const parsed = dynamicClientRegistrationSchema.safeParse(input)
  if (!parsed.success) {
    return registrationError("Unsupported client metadata")
  }

  const client = await registerDynamicClient(parsed.data)
  if (!client) {
    return Response.json(
      {
        error: "temporarily_unavailable",
        error_description: "Client registration is temporarily unavailable",
      },
      {
        headers: secureCredentialHeaders({ "Retry-After": "60" }),
        status: 429,
      },
    )
  }

  return Response.json(
    {
      application_type: "web",
      client_id: client.clientId,
      client_id_issued_at: Math.floor(client.createdAt.getTime() / 1000),
      client_name: client.name,
      ...(client.clientUri ? { client_uri: client.clientUri } : {}),
      grant_types: ["authorization_code"],
      redirect_uris: client.redirectUris.map(({ uri }) => uri),
      response_types: ["code"],
      scope: "memories:write",
      ...(client.softwareId ? { software_id: client.softwareId } : {}),
      ...(client.softwareVersion
        ? { software_version: client.softwareVersion }
        : {}),
      token_endpoint_auth_method: "none",
    },
    { headers: secureCredentialHeaders(), status: 201 },
  )
}

export function loader() {
  return registrationError("Use POST", 405)
}
