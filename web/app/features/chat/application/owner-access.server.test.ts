import { beforeEach, describe, expect, test, vi } from "vitest"

import { getOwnerAccess } from "./owner-access.server"
import { resetServerEnvCacheForTests } from "~/config/server-env.server"
import { retrieveOwnerClaim } from "~/features/chat/infrastructure/chat-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

vi.mock("~/features/chat/infrastructure/chat-model.server", () => ({
  retrieveOwnerClaim: vi.fn(() => null),
}))
vi.mock("~/features/users/infrastructure/users-model.server", () => ({
  retrieveUserFromDatabaseById: vi.fn(() => ({
    email: "owner@example.com",
    emailVerifiedAt: new Date(),
    id: "user-id",
  })),
}))

describe("getOwnerAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetServerEnvCacheForTests()
    process.env.OWNER_EMAIL_ALLOWLIST = "OWNER@example.com"
    vi.mocked(retrieveOwnerClaim).mockResolvedValue(null)
  })

  test("given: a verified allowlisted user and an open seat, should: expose owner claim eligibility", async () => {
    await expect(getOwnerAccess("user-id")).resolves.toEqual({
      canClaimOwner: true,
      isOwner: false,
    })
  })

  test("given: the current owner, should: expose owner access without claim eligibility", async () => {
    vi.mocked(retrieveOwnerClaim).mockResolvedValueOnce({
      userId: "user-id",
    } as never)

    await expect(getOwnerAccess("user-id")).resolves.toEqual({
      canClaimOwner: false,
      isOwner: true,
    })
  })

  test("given: no authenticated user, should: avoid owner database lookups", async () => {
    await expect(getOwnerAccess(null)).resolves.toEqual({
      canClaimOwner: false,
      isOwner: false,
    })
    expect(retrieveOwnerClaim).not.toHaveBeenCalled()
    expect(retrieveUserFromDatabaseById).not.toHaveBeenCalled()
  })
})
