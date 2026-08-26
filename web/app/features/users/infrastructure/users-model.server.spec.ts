import { afterEach, describe, expect, test } from "vitest"

import {
  retrieveUserFromDatabaseByEmail,
  retrieveUserFromDatabaseById,
  saveUserToDatabase,
  updateUserInDatabaseById,
} from "./users-model.server"
import { prisma } from "~/utils/db.server"

const createdUserIds: string[] = []

afterEach(async () => {
  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
    createdUserIds.length = 0
  }
})

const createTestUser = async (data: {
  email: string
  emailVerifiedAt?: Date
}) => {
  const user = await saveUserToDatabase(data)
  createdUserIds.push(user.id)
  return user
}

describe("saveUserToDatabase()", () => {
  test("given: valid email-only user data, should: create and return an unverified user", async () => {
    const result = await createTestUser({
      email: "test@example.com",
    })

    expect(result).toMatchObject({
      email: "test@example.com",
      emailVerifiedAt: null,
    })
    expect(result.id).toBeDefined()
  })

  test("given: a verified email timestamp, should: create and return a verified user", async () => {
    const emailVerifiedAt = new Date("2026-05-31T10:30:00.000Z")

    const result = await createTestUser({
      email: "verified@example.com",
      emailVerifiedAt,
    })

    expect(result).toMatchObject({
      email: "verified@example.com",
      emailVerifiedAt,
    })
  })
})

describe("retrieveUserFromDatabaseById()", () => {
  test("given: an existing id, should: return the user", async () => {
    const created = await createTestUser({
      email: "find@example.com",
    })

    const found = await retrieveUserFromDatabaseById(created.id)

    expect(found).toMatchObject({ email: "find@example.com", id: created.id })
  })

  test("given: a non-existent id, should: return null", async () => {
    const found = await retrieveUserFromDatabaseById("non-existent")

    expect(found).toBeNull()
  })
})

describe("updateUserInDatabaseById()", () => {
  test("given: an existing user, should: update the verified email timestamp", async () => {
    const created = await createTestUser({
      email: "verify@example.com",
    })
    const emailVerifiedAt = new Date("2026-05-31T10:35:00.000Z")

    const result = await updateUserInDatabaseById({
      emailVerifiedAt,
      id: created.id,
    })

    expect(result).toMatchObject({
      email: "verify@example.com",
      emailVerifiedAt,
      id: created.id,
    })
  })
})

describe("retrieveUserFromDatabaseByEmail()", () => {
  test("given: an existing email, should: return the user", async () => {
    await createTestUser({
      email: "lookup@example.com",
    })

    const found = await retrieveUserFromDatabaseByEmail("lookup@example.com")

    expect(found).toMatchObject({
      email: "lookup@example.com",
    })
  })

  test("given: a non-existent email, should: return null", async () => {
    const found = await retrieveUserFromDatabaseByEmail("missing@example.com")

    expect(found).toBeNull()
  })
})
