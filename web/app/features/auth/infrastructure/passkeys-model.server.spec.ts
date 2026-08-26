import { afterEach, beforeEach, describe, expect, test } from "vitest"

import {
  deletePasskeyFromDatabaseByIdAndUserId,
  retrievePasskeyFromDatabaseByCredentialId,
  retrievePasskeysFromDatabaseByUserId,
  savePasskeyToDatabase,
  updatePasskeyCounterInDatabaseByCredentialId,
} from "./passkeys-model.server"
import { prisma } from "~/utils/db.server"

let testUserId: string
const credentialId = "credential-id"

beforeEach(async () => {
  const user = await prisma.user.create({
    data: { email: `passkey-test-${Date.now()}@example.com` },
  })
  testUserId = user.id
})

afterEach(async () => {
  await prisma.passkey.deleteMany({ where: { userId: testUserId } })
  await prisma.user.deleteMany({ where: { id: testUserId } })
})

describe("savePasskeyToDatabase()", () => {
  test("given: valid passkey data, should: create and return the passkey", async () => {
    const result = await savePasskeyToDatabase({
      counter: 0,
      credentialBackedUp: true,
      credentialDeviceType: "singleDevice",
      credentialId,
      credentialPublicKey: "public-key",
      transports: "internal,hybrid",
      user: { connect: { id: testUserId } },
    })

    expect(result).toMatchObject({
      counter: 0,
      credentialId,
      userId: testUserId,
    })
  })
})

describe("retrievePasskeyFromDatabaseByCredentialId()", () => {
  test("given: an existing credential id, should: return the passkey with user", async () => {
    await savePasskeyToDatabase({
      counter: 0,
      credentialBackedUp: true,
      credentialDeviceType: "singleDevice",
      credentialId,
      credentialPublicKey: "public-key",
      transports: "internal",
      user: { connect: { id: testUserId } },
    })

    const result = await retrievePasskeyFromDatabaseByCredentialId(credentialId)

    expect(result).toMatchObject({
      credentialId,
      user: { id: testUserId },
    })
  })
})

describe("retrievePasskeysFromDatabaseByUserId()", () => {
  test("given: a user with passkeys, should: return their passkeys", async () => {
    await savePasskeyToDatabase({
      counter: 0,
      credentialBackedUp: true,
      credentialDeviceType: "singleDevice",
      credentialId,
      credentialPublicKey: "public-key",
      transports: "internal",
      user: { connect: { id: testUserId } },
    })

    const result = await retrievePasskeysFromDatabaseByUserId(testUserId)

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ credentialId })
  })
})

describe("deletePasskeyFromDatabaseByIdAndUserId()", () => {
  test("given: a user-owned passkey, should: delete it", async () => {
    const passkey = await savePasskeyToDatabase({
      counter: 0,
      credentialBackedUp: true,
      credentialDeviceType: "singleDevice",
      credentialId,
      credentialPublicKey: "public-key",
      transports: "internal",
      user: { connect: { id: testUserId } },
    })

    const result = await deletePasskeyFromDatabaseByIdAndUserId({
      id: passkey.id,
      userId: testUserId,
    })

    expect(result.count).toBe(1)
    await expect(
      retrievePasskeyFromDatabaseByCredentialId(credentialId),
    ).resolves.toBeNull()
  })
})

describe("updatePasskeyCounterInDatabaseByCredentialId()", () => {
  test("given: an existing credential id, should: update the counter", async () => {
    await savePasskeyToDatabase({
      counter: 0,
      credentialBackedUp: true,
      credentialDeviceType: "singleDevice",
      credentialId,
      credentialPublicKey: "public-key",
      transports: "internal",
      user: { connect: { id: testUserId } },
    })

    const result = await updatePasskeyCounterInDatabaseByCredentialId({
      counter: 10,
      credentialId,
    })

    expect(result.counter).toBe(10)
  })
})
