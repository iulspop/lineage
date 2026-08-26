import { generateRegistrationOptions } from "@simplewebauthn/server"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { generatePasskeyRegistrationOptions } from "./passkeys.server"

vi.mock("@simplewebauthn/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@simplewebauthn/server")>()),
  generateRegistrationOptions: vi.fn(() => ({ challenge: "challenge" })),
}))

vi.mock("../infrastructure/passkeys-model.server", () => ({
  retrievePasskeyFromDatabaseByCredentialId: vi.fn(),
  retrievePasskeysFromDatabaseByUserId: vi.fn(() => []),
  savePasskeyToDatabase: vi.fn(),
  updatePasskeyCounterInDatabaseByCredentialId: vi.fn(),
}))

vi.mock("~/features/users/infrastructure/users-model.server", () => ({
  retrieveUserFromDatabaseByEmail: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("generatePasskeyRegistrationOptions()", () => {
  test("given: authenticated passkey setup, should: require a discoverable credential for username-free signin", async () => {
    const request = new Request("https://example.com/auth/passkey/register")

    await generatePasskeyRegistrationOptions({
      request,
      userEmail: "user@example.com",
      userId: "user-id",
    })

    const actual = vi.mocked(generateRegistrationOptions).mock.calls[0]?.[0]
      .authenticatorSelection
    const expected = {
      requireResidentKey: true,
      residentKey: "required",
      userVerification: "preferred",
    }

    expect(actual).toEqual(expected)
  })
})
