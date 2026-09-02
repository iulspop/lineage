import { describe, expect, it } from "vitest"

import {
  createS256Challenge,
  hashCredential,
  verifyS256Challenge,
} from "../infrastructure/oauth-crypto.server"
import {
  appendAuthorizationResult,
  authorizationRequestSchema,
  isExactRedirectUri,
  isPermittedRegisteredRedirectUri,
  normalizeScope,
  oauthErrorResponse,
} from "./oauth"

describe("integration OAuth domain", () => {
  it("accepts the sole supported scope and rejects duplicates", () => {
    expect(normalizeScope("memories:write")).toEqual({
      scope: "memories:write",
      valid: true,
    })
    expect(normalizeScope("memories:write memories:write")).toEqual({
      error: "invalid_scope",
      valid: false,
    })
  })

  it("requires state and PKCE S256 authorization parameters", () => {
    const result = authorizationRequestSchema.safeParse({
      client_id: "client",
      code_challenge: "a".repeat(43),
      code_challenge_method: "S256",
      redirect_uri: "https://client.example/callback",
      response_type: "code",
      scope: "memories:write",
      state: "state",
    })
    expect(result.success).toBe(true)
    expect(
      authorizationRequestSchema.safeParse({
        ...result.data,
        state: "",
      }).success,
    ).toBe(false)
  })

  it("matches redirect URIs exactly and permits only HTTPS or loopback HTTP", () => {
    const registered = ["https://client.example/callback"]
    expect(isExactRedirectUri(registered, registered[0])).toBe(true)
    expect(
      isExactRedirectUri(registered, "https://client.example/callback/"),
    ).toBe(false)
    expect(isPermittedRegisteredRedirectUri(registered[0])).toBe(true)
    expect(isPermittedRegisteredRedirectUri("http://localhost:3000/cb")).toBe(
      true,
    )
    expect(isPermittedRegisteredRedirectUri("http://client.example/cb")).toBe(
      false,
    )
  })

  it("hashes credentials and verifies PKCE challenges", () => {
    const verifier = "v".repeat(43)
    const challenge = createS256Challenge(verifier)
    expect(hashCredential("secret")).toHaveLength(64)
    expect(verifyS256Challenge(verifier, challenge)).toBe(true)
    expect(verifyS256Challenge("x".repeat(43), challenge)).toBe(false)
  })

  it("preserves state in authorization redirects and disables error caching", async () => {
    const redirect = appendAuthorizationResult("https://client.example/cb", {
      code: "code",
      state: "opaque-state",
    })
    expect(new URL(redirect).searchParams.get("state")).toBe("opaque-state")

    const response = oauthErrorResponse("invalid_grant", "Invalid grant")
    expect(response.headers.get("Cache-Control")).toBe("no-store")
    expect(response.headers.get("Pragma")).toBe("no-cache")
    expect(await response.json()).toEqual({
      error: "invalid_grant",
      error_description: "Invalid grant",
    })
  })
})
