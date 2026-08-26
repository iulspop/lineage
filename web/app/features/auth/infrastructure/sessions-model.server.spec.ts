import { afterEach, beforeEach, describe, expect, test } from "vitest"

import {
  deleteSessionFromDatabaseById,
  retrieveSessionWithUserFromDatabaseById,
  saveSessionToDatabase,
} from "./sessions-model.server"
import { prisma } from "~/utils/db.server"

let testUserId: string

beforeEach(async () => {
  const user = await prisma.user.create({
    data: { email: `session-test-${Date.now()}@example.com` },
  })
  testUserId = user.id
})

afterEach(async () => {
  await prisma.session.deleteMany({ where: { userId: testUserId } })
  await prisma.user.deleteMany({ where: { id: testUserId } })
})

describe("saveSessionToDatabase()", () => {
  test("given: valid session data, should: create and return the session", async () => {
    const result = await saveSessionToDatabase({
      expirationDate: new Date("2025-06-01"),
      user: { connect: { id: testUserId } },
    })

    expect(result).toMatchObject({ userId: testUserId })
    expect(result.id).toBeDefined()
  })
})

describe("retrieveSessionWithUserFromDatabaseById()", () => {
  test("given: an existing session, should: return session with user", async () => {
    const session = await saveSessionToDatabase({
      expirationDate: new Date("2025-06-01"),
      user: { connect: { id: testUserId } },
    })

    const found = await retrieveSessionWithUserFromDatabaseById(session.id)

    expect(found).toMatchObject({ id: session.id })
    expect(found?.user).toMatchObject({ id: testUserId })
  })

  test("given: a non-existent id, should: return null", async () => {
    const found = await retrieveSessionWithUserFromDatabaseById("non-existent")

    expect(found).toBeNull()
  })
})

describe("deleteSessionFromDatabaseById()", () => {
  test("given: an existing session, should: delete and return it", async () => {
    const session = await saveSessionToDatabase({
      expirationDate: new Date("2025-06-01"),
      user: { connect: { id: testUserId } },
    })

    const deleted = await deleteSessionFromDatabaseById(session.id)

    expect(deleted.id).toBe(session.id)

    const found = await retrieveSessionWithUserFromDatabaseById(session.id)
    expect(found).toBeNull()
  })
})
