import type { Prisma, Session } from "../../../../generated/prisma/client"
import { prisma } from "~/utils/db.server"

/**
 * Saves a new session to the database.
 *
 * @param session - The session data to create.
 * @returns The newly created session.
 */
export async function saveSessionToDatabase(
  session: Prisma.SessionCreateInput,
) {
  return prisma.session.create({ data: session })
}

/**
 * Retrieves a session with its user from the database by id.
 *
 * @param id - The id of the session to retrieve.
 * @returns The session with user, or null if not found.
 */
export async function retrieveSessionWithUserFromDatabaseById(
  id: Session["id"],
) {
  return prisma.session.findUnique({
    include: { user: true },
    where: { id },
  })
}

/**
 * Deletes a session from the database by id.
 *
 * @param id - The id of the session to delete.
 * @returns The deleted session.
 */
export async function deleteSessionFromDatabaseById(id: Session["id"]) {
  return prisma.session.delete({ where: { id } })
}
