import { describe, expect, it } from "vitest"

import { loader as authorizationServerLoader } from "./[.]well-known.oauth-authorization-server"
import { loader as protectedResourceLoader } from "./[.]well-known.oauth-protected-resource.mcp"

describe("OAuth discovery", () => {
  it("advertises dynamic registration and resource indicators", async () => {
    const response = authorizationServerLoader({
      request: new Request(
        "http://localhost/.well-known/oauth-authorization-server",
      ),
    })

    await expect(response.json()).resolves.toMatchObject({
      registration_endpoint: "http://localhost:5250/oauth/register",
      resource_indicators_supported: true,
    })
  })

  it("advertises the MCP protected resource", async () => {
    const response = protectedResourceLoader({
      request: new Request(
        "http://localhost/.well-known/oauth-protected-resource/mcp",
      ),
    })

    await expect(response.json()).resolves.toEqual({
      authorization_servers: ["http://localhost:5250"],
      bearer_methods_supported: ["header"],
      resource: "http://localhost:5250/mcp",
      scopes_supported: ["memories:write"],
    })
  })
})
