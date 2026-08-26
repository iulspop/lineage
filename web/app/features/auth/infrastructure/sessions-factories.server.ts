import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type { Session } from "../../../../generated/prisma/client"
import type { Factory } from "~/utils/types"

/**
 * Creates a session with populated values.
 *
 * @param sessionParams - Session params to create a session with.
 * @returns A populated session with given params.
 */
export const createPopulatedSession: Factory<Session> = ({
  id = createId(),
  userId = createId(),
  expirationDate = faker.date.future({ years: 1 }),
  updatedAt = faker.date.recent({ days: 10 }),
  createdAt = faker.date.past({ refDate: updatedAt, years: 1 }),
} = {}) => ({
  createdAt,
  expirationDate,
  id,
  updatedAt,
  userId,
})
