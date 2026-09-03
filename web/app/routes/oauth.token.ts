import type { Route } from "./+types/oauth.token"
import {
  exchangeAuthorizationCode,
  rotateRefreshToken,
} from "~/features/integrations/application/oauth-service.server"
import {
  oauthErrorResponse,
  tokenRequestSchema,
} from "~/features/integrations/domain/oauth"
import {
  readBoundedFormData,
  secureCredentialHeaders,
} from "~/features/integrations/infrastructure/integration-http.server"

function clientCredentials(request: Request, formData: URLSearchParams) {
  const authorization = request.headers.get("Authorization")
  if (authorization?.startsWith("Basic ")) {
    try {
      const decoded = Buffer.from(authorization.slice(6), "base64").toString()
      const separator = decoded.indexOf(":")
      if (separator < 0) return null
      return {
        clientId: decodeURIComponent(decoded.slice(0, separator)),
        clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
      }
    } catch {
      return null
    }
  }
  const clientId = formData.get("client_id")
  const clientSecret = formData.get("client_secret")
  return typeof clientId === "string"
    ? {
        clientId,
        clientSecret:
          typeof clientSecret === "string" ? clientSecret : undefined,
      }
    : null
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
  const credentials = clientCredentials(request, formData)
  if (!credentials)
    return oauthErrorResponse(
      "invalid_client",
      "Client authentication failed",
      401,
    )
  formData.set("client_id", credentials.clientId)
  formData.delete("client_secret")
  const values = Object.fromEntries(formData)
  const parsed = tokenRequestSchema.safeParse(values)
  if (!parsed.success)
    return oauthErrorResponse("invalid_request", "Invalid token request")
  if (parsed.data.client_id !== credentials.clientId)
    return oauthErrorResponse(
      "invalid_client",
      "Client authentication failed",
      401,
    )

  const result =
    parsed.data.grant_type === "authorization_code"
      ? await exchangeAuthorizationCode({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          code: parsed.data.code,
          codeVerifier: parsed.data.code_verifier,
          redirectUri: parsed.data.redirect_uri,
          resource: parsed.data.resource,
        })
      : await rotateRefreshToken({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          refreshToken: parsed.data.refresh_token,
          resource: parsed.data.resource,
        })
  if (!result)
    return oauthErrorResponse(
      "invalid_grant",
      "The credential is invalid or expired",
    )

  return Response.json(
    {
      access_token: result.accessToken,
      expires_in: result.expiresIn,
      refresh_token: result.refreshToken,
      scope: result.scope,
      token_type: result.tokenType,
    },
    {
      headers: secureCredentialHeaders(),
    },
  )
}

export function loader() {
  return oauthErrorResponse("invalid_request", "Use POST", 405)
}
