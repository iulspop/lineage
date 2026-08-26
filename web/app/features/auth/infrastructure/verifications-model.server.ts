import type { Prisma } from "../../../../generated/prisma/client"
import { prisma } from "~/utils/db.server"

/**
 * Upserts a verification to the database by type + target.
 *
 * @param verification - The verification data to upsert.
 * @returns The created or updated verification.
 */
export async function saveVerificationToDatabase(
  verification: Prisma.VerificationCreateInput,
) {
  return prisma.verification.upsert({
    create: verification,
    update: verification,
    where: {
      type_target: {
        target: verification.target,
        type: verification.type,
      },
    },
  })
}

/**
 * Retrieves a verification from the database by type and target.
 *
 * @param params - The type and target of the verification.
 * @returns The verification or null if not found.
 */
export async function retrieveVerificationFromDatabaseByTypeAndTarget({
  target,
  type,
}: {
  target: string
  type: string
}) {
  return prisma.verification.findUnique({
    where: { type_target: { target, type } },
  })
}

/**
 * Deletes a verification from the database by type and target.
 *
 * @param params - The type and target of the verification.
 * @returns The deleted verification.
 */
export async function deleteVerificationFromDatabaseByTypeAndTarget({
  target,
  type,
}: {
  target: string
  type: string
}) {
  return prisma.verification.delete({
    where: { type_target: { target, type } },
  })
}
