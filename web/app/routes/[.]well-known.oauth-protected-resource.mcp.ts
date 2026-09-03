import { getServerEnv } from "~/config/server-env.server"

export function loader({ request }: { request: Request }) {
  const issuer = new URL(getServerEnv().APP_URL ?? request.url).origin
  return Response.json(
    {
      authorization_servers: [issuer],
      bearer_methods_supported: ["header"],
      resource: `${issuer}/mcp`,
      scopes_supported: ["memories:write"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  )
}
