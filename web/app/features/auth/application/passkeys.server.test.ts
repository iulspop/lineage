import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from "./passkeys.server"
import { resetServerEnvCacheForTests } from "~/config/server-env.server"

vi.mock("@simplewebauthn/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@simplewebauthn/server")>()),
  generateRegistrationOptions: vi.fn(() => ({ challenge: "challenge" })),
  verifyRegistrationResponse: vi.fn(() => ({ verified: false })),
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
  resetServerEnvCacheForTests()
})

afterEach(() => {
  vi.unstubAllEnvs()
  resetServerEnvCacheForTests()
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

  test("given: a proxy-internal request URL, should: use the configured public application origin", async () => {
    vi.stubEnv("APP_URL", "https://lineage-polyanova.fly.dev/")
    const request = new Request(
      "http://lineage-polyanova.fly.dev/auth/passkey/register",
    )

    await generatePasskeyRegistrationOptions({
      request,
      userEmail: "user@example.com",
      userId: "user-id",
    })

    expect(vi.mocked(generateRegistrationOptions)).toHaveBeenCalledWith(
      expect.objectContaining({ rpID: "lineage-polyanova.fly.dev" }),
    )

    await verifyPasskeyRegistration({
      expectedChallenge: "challenge",
      request,
      response: {} as never,
      userId: "user-id",
    })

    expect(vi.mocked(verifyRegistrationResponse)).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedOrigin: "https://lineage-polyanova.fly.dev",
        expectedRPID: "lineage-polyanova.fly.dev",
      }),
    )
  })
})
