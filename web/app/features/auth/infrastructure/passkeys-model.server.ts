import type { Passkey, Prisma, User } from "../../../../generated/prisma/client"
import { prisma } from "~/utils/db.server"

/**
 * Saves a passkey to the database.
 *
 * @param passkey - The passkey to save.
 * @returns The saved passkey.
 */
export async function savePasskeyToDatabase(
  passkey: Prisma.PasskeyCreateInput,
) {
  return prisma.passkey.create({ data: passkey })
}

/**
 * Retrieves a passkey with its user by credential id.
 *
 * @param credentialId - The credential id to look up.
 * @returns The passkey with its user or null.
 */
export async function retrievePasskeyFromDatabaseByCredentialId(
  credentialId: Passkey["credentialId"],
) {
  return prisma.passkey.findUnique({
    include: { user: true },
    where: { credentialId },
  })
}

/**
 * Retrieves passkeys by user id.
 *
 * @param userId - The user id to look up.
 * @returns The user's passkeys.
 */
export async function retrievePasskeysFromDatabaseByUserId(userId: User["id"]) {
  return prisma.passkey.findMany({
    orderBy: { createdAt: "desc" },
    where: { userId },
  })
}

export async function deletePasskeyFromDatabaseByIdAndUserId({
  id,
  userId,
}: {
  id: Passkey["id"]
  userId: User["id"]
}) {
  return prisma.passkey.deleteMany({ where: { id, userId } })
}

/**
 * Updates a passkey counter by credential id.
 *
 * @param params - The credential id and new counter.
 * @returns The updated passkey.
 */
export async function updatePasskeyCounterInDatabaseByCredentialId({
  counter,
  credentialId,
}: {
  counter: Passkey["counter"]
  credentialId: Passkey["credentialId"]
}) {
  return prisma.passkey.update({
    data: { counter },
    where: { credentialId },
  })
}
