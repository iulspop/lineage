import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { integrationDatabase } from "../infrastructure/integration-model.server"
import { createS256Challenge } from "../infrastructure/oauth-crypto.server"
import {
  authenticateAccessToken,
  exchangeAuthorizationCode,
  issueAuthorizationCode,
  registerDynamicClient,
  resolveAuthorizationClient,
  rotateRefreshToken,
} from "./oauth-service.server"

const now = new Date("2026-09-02T18:00:00.000Z")
const redirectUri = "https://client.example/callback"
let clientDatabaseId: string
let publicClientId: string
let userId: string

beforeEach(async () => {
  const user = await integrationDatabase.user.create({
    data: { email: `integration-${crypto.randomUUID()}@example.com` },
  })
  const client = await integrationDatabase.integrationClient.create({
    data: {
      clientId: `client-${crypto.randomUUID()}`,
      clientType: "public",
      name: "Test integration",
      redirectUris: { create: { uri: redirectUri } },
    },
  })
  clientDatabaseId = client.id
  publicClientId = client.clientId
  userId = user.id
})

afterEach(async () => {
  await integrationDatabase.integrationClient.deleteMany({
    where: { id: clientDatabaseId },
  })
  await integrationDatabase.user.deleteMany({ where: { id: userId } })
})

describe("integration OAuth service", () => {
  it("registers constrained public dynamic clients", async () => {
    const client = await registerDynamicClient(
      {
        application_type: "web",
        client_name: "MCP host",
        grant_types: ["authorization_code"],
        redirect_uris: ["https://host.example/oauth/callback"],
        response_types: ["code"],
        scope: "memories:write",
        token_endpoint_auth_method: "none",
      },
      now,
    )
    expect(client).toMatchObject({
      clientSecretHash: null,
      clientType: "public",
      name: "MCP host",
      registrationType: "dynamic",
    })
    expect(client?.clientId).toBeTruthy()
    if (client) {
      await integrationDatabase.integrationClient.delete({
        where: { id: client.id },
      })
    }
  })

  it("resolves only registered exact redirect URIs", async () => {
    await expect(
      resolveAuthorizationClient({
        clientId: publicClientId,
        redirectUri,
      }),
    ).resolves.toMatchObject({ id: clientDatabaseId })
    await expect(
      resolveAuthorizationClient({
        clientId: publicClientId,
        redirectUri: `${redirectUri}/`,
      }),
    ).resolves.toBeNull()
  })

  it("exchanges a single-use PKCE code for opaque credentials", async () => {
    const verifier = "v".repeat(43)
    const resource = "https://lineage.example/mcp"
    const code = await issueAuthorizationCode({
      clientDatabaseId,
      codeChallenge: createS256Challenge(verifier),
      now,
      redirectUri,
      resource,
      userId,
    })
    const tokens = await exchangeAuthorizationCode({
      clientId: publicClientId,
      code,
      codeVerifier: verifier,
      now,
      redirectUri,
      resource,
    })
    expect(tokens).toMatchObject({
      expiresIn: 3600,
      scope: "memories:write",
      tokenType: "Bearer",
    })
    expect(tokens?.accessToken).not.toBe(code)
    await expect(
      exchangeAuthorizationCode({
        clientId: publicClientId,
        code,
        codeVerifier: verifier,
        now,
        redirectUri,
      }),
    ).resolves.toBeNull()
    await expect(
      authenticateAccessToken(tokens?.accessToken ?? "", now, resource),
    ).resolves.toMatchObject({
      clientName: "Test integration",
      resource,
      userId,
    })
    await expect(
      authenticateAccessToken(
        tokens?.accessToken ?? "",
        now,
        "https://lineage.example/other",
      ),
    ).resolves.toBeNull()
  })

  it("rotates refresh tokens and revokes the family on reuse", async () => {
    const verifier = "v".repeat(43)
    const code = await issueAuthorizationCode({
      clientDatabaseId,
      codeChallenge: createS256Challenge(verifier),
      now,
      redirectUri,
      userId,
    })
    const initial = await exchangeAuthorizationCode({
      clientId: publicClientId,
      code,
      codeVerifier: verifier,
      now,
      redirectUri,
    })
    const rotated = await rotateRefreshToken({
      clientId: publicClientId,
      now,
      refreshToken: initial?.refreshToken ?? "",
    })
    expect(rotated?.refreshToken).not.toBe(initial?.refreshToken)
    await expect(
      rotateRefreshToken({
        clientId: publicClientId,
        now,
        refreshToken: initial?.refreshToken ?? "",
      }),
    ).resolves.toBeNull()
    await expect(
      rotateRefreshToken({
        clientId: publicClientId,
        now,
        refreshToken: rotated?.refreshToken ?? "",
      }),
    ).resolves.toBeNull()
    await expect(
      authenticateAccessToken(rotated?.accessToken ?? "", now),
    ).resolves.toBeNull()
  })
})
