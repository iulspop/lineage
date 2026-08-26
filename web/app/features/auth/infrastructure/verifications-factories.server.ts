import { faker } from "@faker-js/faker"
import { createId } from "@paralleldrive/cuid2"

import type { Verification } from "../../../../generated/prisma/client"
import type { Factory } from "~/utils/types"

/**
 * Creates a verification with populated values.
 *
 * @param verificationParams - Verification params to create a verification with.
 * @returns A populated verification with given params.
 */
export const createPopulatedVerification: Factory<Verification> = ({
  id = createId(),
  type = "login",
  target = faker.internet.email(),
  secret = faker.string.alphanumeric(32),
  algorithm = "SHA-1",
  digits = 6,
  period = 600,
  charSet = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
  expiresAt = faker.date.future({ years: 1 }),
  createdAt = faker.date.recent({ days: 1 }),
} = {}) => ({
  algorithm,
  charSet,
  createdAt,
  digits,
  expiresAt,
  id,
  period,
  secret,
  target,
  type,
})
