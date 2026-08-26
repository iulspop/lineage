import type { Prisma, User } from "../../../../generated/prisma/client"
import { prisma } from "~/utils/db.server"

/**
 * Saves a user to the database.
 *
 * @param user The user to save.
 * @returns The saved user.
 */
export async function saveUserToDatabase(user: Prisma.UserCreateInput) {
  return prisma.user.create({ data: user })
}

/**
 * Retrieves a user by its id.
 *
 * @param id The id of the user.
 * @returns The user or null.
 */
export async function retrieveUserFromDatabaseById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } })
}

/**
 * Retrieves a user by their email address.
 *
 * @param email The email of the user.
 * @returns The user or null.
 */
export async function retrieveUserFromDatabaseByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } })
}

/**
 * Updates a user's verified email timestamp in the database.
 *
 * @param user The user id and verified email timestamp to update.
 * @returns The updated user.
 */
export async function updateUserInDatabaseById({
  emailVerifiedAt,
  id,
}: Pick<User, "emailVerifiedAt" | "id">) {
  return prisma.user.update({ data: { emailVerifiedAt }, where: { id } })
}
