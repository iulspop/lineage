import { prisma } from "~/utils/db.server"

export function findIntegrationClient(clientId: string) {
  return prisma.integrationClient.findUnique({
    include: { redirectUris: true },
    where: { clientId },
  })
}

export function listUserIntegrationGrants(userId: string) {
  return prisma.integrationGrant.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
    where: { revokedAt: null, userId },
  })
}

export function listIntegrationClients() {
  return prisma.integrationClient.findMany({
    include: { redirectUris: true },
    orderBy: { createdAt: "desc" },
  })
}

export function createIntegrationClient(input: {
  clientId: string
  clientSecretHash: string | null
  clientType: "confidential" | "public"
  createdByUserId: string
  name: string
  redirectUris: string[]
}) {
  return prisma.integrationClient.create({
    data: {
      clientId: input.clientId,
      clientSecretHash: input.clientSecretHash,
      clientType: input.clientType,
      createdByUserId: input.createdByUserId,
      name: input.name,
      redirectUris: {
        create: input.redirectUris.map((uri) => ({ uri })),
      },
    },
    include: { redirectUris: true },
  })
}

export async function revokeIntegrationGrant(userId: string, grantId: string) {
  const revokedAt = new Date()
  return prisma.$transaction(async (transaction) => {
    const grant = await transaction.integrationGrant.findFirst({
      select: { id: true },
      where: { id: grantId, revokedAt: null, userId },
    })
    if (!grant) return false
    await transaction.integrationGrant.update({
      data: { revokedAt },
      where: { id: grant.id },
    })
    await transaction.integrationAccessToken.updateMany({
      data: { revokedAt },
      where: { grantId: grant.id, revokedAt: null },
    })
    await transaction.integrationRefreshTokenFamily.updateMany({
      data: { revokedAt },
      where: { grantId: grant.id, revokedAt: null },
    })
    return true
  })
}

export { prisma as integrationDatabase }
