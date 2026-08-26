import type { Prisma } from "../../../../generated/prisma/client"
import { prisma } from "~/utils/db.server"

/**
 * Saves a new connection to the database.
 *
 * @param connection - The connection data to create.
 * @returns The newly created connection.
 */
export async function saveConnectionToDatabase(
  connection: Prisma.ConnectionCreateInput,
) {
  return prisma.connection.create({ data: connection })
}

/**
 * Retrieves a connection from the database by provider name and provider id.
 *
 * @param params - The provider name and provider id.
 * @returns The connection or null if not found.
 */
export async function retrieveConnectionFromDatabaseByProviderNameAndProviderId({
  providerId,
  providerName,
}: {
  providerId: string
  providerName: string
}) {
  return prisma.connection.findUnique({
    where: {
      providerName_providerId: { providerId, providerName },
    },
  })
}
