import { describe, expect, test } from "vitest"

import {
  isTrustedIntegrationOrigin,
  readBoundedFormData,
  redactIntegrationUrl,
  secureCredentialHeaders,
} from "./integration-http.server"

describe("integration HTTP security", () => {
  test("redacts credentials from URLs", () => {
    expect(
      redactIntegrationUrl(
        "https://lineage.example/oauth/callback?code=secret&state=visible",
      ),
    ).toBe(
      "https://lineage.example/oauth/callback?code=%5BREDACTED%5D&state=visible",
    )
  })

  test("rejects oversized OAuth bodies before parsing", async () => {
    const body = `token=${"x".repeat(17_000)}`
    await expect(
      readBoundedFormData(
        new Request("https://lineage.example/oauth/token", {
          body,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "POST",
        }),
      ),
    ).resolves.toBeNull()
  })

  test("accepts absent or trusted origins and rejects foreign origins", () => {
    expect(
      isTrustedIntegrationOrigin(
        new Request("https://lineage.example/mcp"),
        "https://lineage.example",
      ),
    ).toBe(true)
    expect(
      isTrustedIntegrationOrigin(
        new Request("https://lineage.example/mcp", {
          headers: { Origin: "https://lineage.example" },
        }),
        "https://lineage.example",
      ),
    ).toBe(true)
    expect(
      isTrustedIntegrationOrigin(
        new Request("https://lineage.example/mcp", {
          headers: { Origin: "https://attacker.example" },
        }),
        "https://lineage.example",
      ),
    ).toBe(false)
  })

  test("adds credential response hardening headers", () => {
    const headers = new Headers(secureCredentialHeaders())
    expect(headers.get("Cache-Control")).toBe("no-store")
    expect(headers.get("Pragma")).toBe("no-cache")
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff")
  })
})
