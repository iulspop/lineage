import { randomBytes, timingSafeEqual } from "node:crypto"

import { INTEGRATION_SCOPE, isExactRedirectUri } from "../domain/oauth"
import {
  findIntegrationClient,
  integrationDatabase,
} from "../infrastructure/integration-model.server"
import {
  hashCredential,
  verifyS256Challenge,
} from "../infrastructure/oauth-crypto.server"

const AUTHORIZATION_CODE_LIFETIME_MS = 5 * 60 * 1000
const ACCESS_TOKEN_LIFETIME_MS = 60 * 60 * 1000
const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000

function opaqueCredential() {
  return randomBytes(32).toString("base64url")
}

function after(now: Date, milliseconds: number) {
  return new Date(now.getTime() + milliseconds)
}

function hashesEqual(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual)
  const expectedBytes = Buffer.from(expected)
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  )
}

export async function resolveAuthorizationClient({
  clientId,
  redirectUri,
}: {
  clientId: string
  redirectUri: string
}) {
  const client = await findIntegrationClient(clientId)
  if (
    !client ||
    client.disabledAt ||
    !isExactRedirectUri(
      client.redirectUris.map(({ uri }) => uri),
      redirectUri,
    )
  )
    return null
  return client
}

export async function issueAuthorizationCode({
  clientDatabaseId,
  codeChallenge,
  now = new Date(),
  redirectUri,
  userId,
}: {
  clientDatabaseId: string
  codeChallenge: string
  now?: Date
  redirectUri: string
  userId: string
}) {
  const code = opaqueCredential()
  await integrationDatabase.$transaction(async (transaction) => {
    const grant = await transaction.integrationGrant.upsert({
      create: {
        clientId: clientDatabaseId,
        scope: INTEGRATION_SCOPE,
        userId,
      },
      update: { revokedAt: null },
      where: {
        userId_clientId_scope: {
          clientId: clientDatabaseId,
          scope: INTEGRATION_SCOPE,
          userId,
        },
      },
    })
    await transaction.integrationAuthorizationCode.create({
      data: {
        clientId: clientDatabaseId,
        codeChallenge,
        codeHash: hashCredential(code),
        expiresAt: after(now, AUTHORIZATION_CODE_LIFETIME_MS),
        grantId: grant.id,
        redirectUri,
        scope: INTEGRATION_SCOPE,
      },
    })
  })
  return code
}

export async function exchangeAuthorizationCode({
  clientId,
  clientSecret,
  code,
  codeVerifier,
  now = new Date(),
  redirectUri,
}: {
  clientId: string
  clientSecret?: string
  code: string
  codeVerifier: string
  now?: Date
  redirectUri: string
}) {
  const client = await authenticateClient(clientId, clientSecret)
  if (!client) return null

  return integrationDatabase.$transaction(async (transaction) => {
    const authorizationCode =
      await transaction.integrationAuthorizationCode.findUnique({
        include: { grant: true },
        where: { codeHash: hashCredential(code) },
      })
    if (
      !authorizationCode ||
      authorizationCode.clientId !== client.id ||
      authorizationCode.redirectUri !== redirectUri ||
      authorizationCode.usedAt ||
      authorizationCode.expiresAt <= now ||
      authorizationCode.grant.revokedAt ||
      !verifyS256Challenge(codeVerifier, authorizationCode.codeChallenge)
    )
      return null

    const consumed = await transaction.integrationAuthorizationCode.updateMany({
      data: { usedAt: now },
      where: { id: authorizationCode.id, usedAt: null },
    })
    if (consumed.count !== 1) return null

    const accessToken = opaqueCredential()
    const refreshToken = opaqueCredential()
    const family = await transaction.integrationRefreshTokenFamily.create({
      data: { clientId: client.id, grantId: authorizationCode.grantId },
    })
    await transaction.integrationAccessToken.create({
      data: {
        clientId: client.id,
        expiresAt: after(now, ACCESS_TOKEN_LIFETIME_MS),
        grantId: authorizationCode.grantId,
        scope: authorizationCode.scope,
        tokenHash: hashCredential(accessToken),
      },
    })
    await transaction.integrationRefreshToken.create({
      data: {
        expiresAt: after(now, REFRESH_TOKEN_LIFETIME_MS),
        familyId: family.id,
        tokenHash: hashCredential(refreshToken),
      },
    })
    return {
      accessToken,
      expiresIn: ACCESS_TOKEN_LIFETIME_MS / 1000,
      refreshToken,
      scope: authorizationCode.scope,
      tokenType: "Bearer" as const,
    }
  })
}

export async function rotateRefreshToken({
  clientId,
  clientSecret,
  now = new Date(),
  refreshToken,
}: {
  clientId: string
  clientSecret?: string
  now?: Date
  refreshToken: string
}) {
  const client = await authenticateClient(clientId, clientSecret)
  if (!client) return null

  return integrationDatabase.$transaction(async (transaction) => {
    const existing = await transaction.integrationRefreshToken.findUnique({
      include: { family: { include: { grant: true } } },
      where: { tokenHash: hashCredential(refreshToken) },
    })
    if (!existing || existing.family.clientId !== client.id) return null
    if (existing.usedAt) {
      await transaction.integrationRefreshTokenFamily.update({
        data: { revokedAt: now },
        where: { id: existing.familyId },
      })
      await transaction.integrationAccessToken.updateMany({
        data: { revokedAt: now },
        where: { grantId: existing.family.grantId, revokedAt: null },
      })
      return null
    }
    if (
      existing.expiresAt <= now ||
      existing.family.revokedAt ||
      existing.family.grant.revokedAt
    )
      return null

    const nextRefreshToken = opaqueCredential()
    const replacement = await transaction.integrationRefreshToken.create({
      data: {
        expiresAt: after(now, REFRESH_TOKEN_LIFETIME_MS),
        familyId: existing.familyId,
        tokenHash: hashCredential(nextRefreshToken),
      },
    })
    const consumed = await transaction.integrationRefreshToken.updateMany({
      data: { replacedById: replacement.id, usedAt: now },
      where: { id: existing.id, usedAt: null },
    })
    if (consumed.count !== 1) {
      await transaction.integrationRefreshTokenFamily.update({
        data: { revokedAt: now },
        where: { id: existing.familyId },
      })
      return null
    }

    const accessToken = opaqueCredential()
    await transaction.integrationAccessToken.create({
      data: {
        clientId: client.id,
        expiresAt: after(now, ACCESS_TOKEN_LIFETIME_MS),
        grantId: existing.family.grantId,
        scope: existing.family.grant.scope,
        tokenHash: hashCredential(accessToken),
      },
    })
    return {
      accessToken,
      expiresIn: ACCESS_TOKEN_LIFETIME_MS / 1000,
      refreshToken: nextRefreshToken,
      scope: existing.family.grant.scope,
      tokenType: "Bearer" as const,
    }
  })
}

export async function authenticateAccessToken(token: string, now = new Date()) {
  const record = await integrationDatabase.integrationAccessToken.findUnique({
    include: { client: true, grant: true },
    where: { tokenHash: hashCredential(token) },
  })
  if (
    !record ||
    record.revokedAt ||
    record.expiresAt <= now ||
    record.client.disabledAt ||
    record.grant.revokedAt ||
    record.scope !== INTEGRATION_SCOPE
  )
    return null
  await integrationDatabase.$transaction([
    integrationDatabase.integrationAccessToken.update({
      data: { lastUsedAt: now },
      where: { id: record.id },
    }),
    integrationDatabase.integrationGrant.update({
      data: { lastUsedAt: now },
      where: { id: record.grantId },
    }),
  ])
  return {
    clientId: record.clientId,
    clientName: record.client.name,
    clientPublicId: record.client.clientId,
    grantId: record.grantId,
    scope: record.scope,
    tokenId: record.id,
    userId: record.grant.userId,
  }
}

export async function revokeCredential({
  clientId,
  clientSecret,
  now = new Date(),
  token,
}: {
  clientId: string
  clientSecret?: string
  now?: Date
  token: string
}) {
  const client = await authenticateClient(clientId, clientSecret)
  if (!client) return false
  const tokenHash = hashCredential(token)
  const access = await integrationDatabase.integrationAccessToken.findUnique({
    select: { clientId: true, id: true },
    where: { tokenHash },
  })
  if (access?.clientId === client.id) {
    await integrationDatabase.integrationAccessToken.update({
      data: { revokedAt: now },
      where: { id: access.id },
    })
    return true
  }
  const refresh = await integrationDatabase.integrationRefreshToken.findUnique({
    include: { family: true },
    where: { tokenHash },
  })
  if (refresh?.family.clientId === client.id) {
    await integrationDatabase.integrationRefreshTokenFamily.update({
      data: { revokedAt: now },
      where: { id: refresh.familyId },
    })
  }
  return true
}

async function authenticateClient(clientId: string, clientSecret?: string) {
  const client = await findIntegrationClient(clientId)
  if (!client || client.disabledAt) return null
  if (client.clientType === "public") return client
  if (!(client.clientSecretHash && clientSecret)) return null
  return hashesEqual(hashCredential(clientSecret), client.clientSecretHash)
    ? client
    : null
}
