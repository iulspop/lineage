import type { Route } from "./+types/oauth.revoke"
import { revokeCredential } from "~/features/integrations/application/oauth-service.server"
import {
  oauthErrorResponse,
  revocationRequestSchema,
} from "~/features/integrations/domain/oauth"
import {
  readBoundedFormData,
  secureCredentialHeaders,
} from "~/features/integrations/infrastructure/integration-http.server"

function basicClientCredentials(request: Request) {
  const authorization = request.headers.get("Authorization")
  if (!authorization?.startsWith("Basic ")) return null
  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString()
    const separator = decoded.indexOf(":")
    return separator < 0
      ? null
      : {
          clientId: decodeURIComponent(decoded.slice(0, separator)),
          clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
        }
  } catch {
    return null
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (
    !request.headers
      .get("Content-Type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    return oauthErrorResponse(
      "invalid_request",
      "Use form-encoded parameters",
      415,
    )
  const formData = await readBoundedFormData(request)
  if (!formData)
    return oauthErrorResponse(
      "invalid_request",
      "Request body is too large",
      413,
    )
  const basic = basicClientCredentials(request)
  const postedSecret = formData.get("client_secret")
  if (basic) formData.set("client_id", basic.clientId)
  formData.delete("client_secret")
  const parsed = revocationRequestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success)
    return oauthErrorResponse("invalid_request", "Invalid revocation request")

  const authenticated = await revokeCredential({
    clientId: parsed.data.client_id,
    clientSecret:
      basic?.clientSecret ??
      (typeof postedSecret === "string" ? postedSecret : undefined),
    token: parsed.data.token,
  })
  if (!authenticated)
    return oauthErrorResponse(
      "invalid_client",
      "Client authentication failed",
      401,
    )
  return new Response(null, {
    headers: secureCredentialHeaders(),
    status: 200,
  })
}

export function loader() {
  return oauthErrorResponse("invalid_request", "Use POST", 405)
}
