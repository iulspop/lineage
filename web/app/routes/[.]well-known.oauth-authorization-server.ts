import { getServerEnv } from "~/config/server-env.server"

export function loader({ request }: { request: Request }) {
  const issuer = new URL(getServerEnv().APP_URL ?? request.url).origin
  return Response.json(
    {
      authorization_endpoint: `${issuer}/oauth/authorize`,
      code_challenge_methods_supported: ["S256"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      issuer,
      registration_endpoint: `${issuer}/oauth/register`,
      resource_indicators_supported: true,
      response_types_supported: ["code"],
      revocation_endpoint: `${issuer}/oauth/revoke`,
      scopes_supported: ["memories:write"],
      token_endpoint: `${issuer}/oauth/token`,
      token_endpoint_auth_methods_supported: [
        "none",
        "client_secret_basic",
        "client_secret_post",
      ],
    },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  )
}
