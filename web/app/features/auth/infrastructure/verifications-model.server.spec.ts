import { afterEach, describe, expect, test } from "vitest"

import {
  deleteVerificationFromDatabaseByTypeAndTarget,
  retrieveVerificationFromDatabaseByTypeAndTarget,
  saveVerificationToDatabase,
} from "./verifications-model.server"
import { prisma } from "~/utils/db.server"

afterEach(async () => {
  await prisma.verification.deleteMany()
})

describe("saveVerificationToDatabase()", () => {
  test("given: valid verification data, should: create and return the verification", async () => {
    const result = await saveVerificationToDatabase({
      algorithm: "SHA-1",
      charSet: "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
      digits: 6,
      expiresAt: new Date("2025-06-01"),
      period: 600,
      secret: "test-secret",
      target: "test@example.com",
      type: "login",
    })

    expect(result).toMatchObject({
      secret: "test-secret",
      target: "test@example.com",
      type: "login",
    })
    expect(result.id).toBeDefined()
  })

  test("given: same type+target, should: upsert (update) the existing record", async () => {
    await saveVerificationToDatabase({
      algorithm: "SHA-1",
      charSet: "ABC",
      digits: 6,
      expiresAt: new Date("2025-06-01"),
      period: 600,
      secret: "first-secret",
      target: "upsert@example.com",
      type: "login",
    })

    const updated = await saveVerificationToDatabase({
      algorithm: "SHA-1",
      charSet: "ABC",
      digits: 6,
      expiresAt: new Date("2025-06-01"),
      period: 600,
      secret: "second-secret",
      target: "upsert@example.com",
      type: "login",
    })

    expect(updated.secret).toBe("second-secret")

    const all = await prisma.verification.findMany({
      where: { target: "upsert@example.com", type: "login" },
    })
    expect(all).toHaveLength(1)
  })
})

describe("retrieveVerificationFromDatabaseByTypeAndTarget()", () => {
  test("given: existing type+target, should: return the verification", async () => {
    await saveVerificationToDatabase({
      algorithm: "SHA-1",
      charSet: "ABC",
      digits: 6,
      expiresAt: new Date("2025-06-01"),
      period: 600,
      secret: "find-me",
      target: "find@example.com",
      type: "login",
    })

    const found = await retrieveVerificationFromDatabaseByTypeAndTarget({
      target: "find@example.com",
      type: "login",
    })

    expect(found).toMatchObject({
      secret: "find-me",
      target: "find@example.com",
    })
  })

  test("given: non-existent type+target, should: return null", async () => {
    const found = await retrieveVerificationFromDatabaseByTypeAndTarget({
      target: "missing@example.com",
      type: "login",
    })

    expect(found).toBeNull()
  })
})

describe("deleteVerificationFromDatabaseByTypeAndTarget()", () => {
  test("given: existing type+target, should: delete and return it", async () => {
    await saveVerificationToDatabase({
      algorithm: "SHA-1",
      charSet: "ABC",
      digits: 6,
      expiresAt: new Date("2025-06-01"),
      period: 600,
      secret: "delete-me",
      target: "delete@example.com",
      type: "login",
    })

    const deleted = await deleteVerificationFromDatabaseByTypeAndTarget({
      target: "delete@example.com",
      type: "login",
    })

    expect(deleted.secret).toBe("delete-me")

    const found = await retrieveVerificationFromDatabaseByTypeAndTarget({
      target: "delete@example.com",
      type: "login",
    })
    expect(found).toBeNull()
  })
})
