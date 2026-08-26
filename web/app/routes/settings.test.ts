import { describe, expect, test, vi } from "vitest"

import { action, loader } from "./settings"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import {
  deletePasskeyFromDatabaseByIdAndUserId,
  retrievePasskeysFromDatabaseByUserId,
} from "~/features/auth/infrastructure/passkeys-model.server"
import { retrieveOwnerStatusForUser } from "~/features/chat/infrastructure/chat-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

vi.mock("~/features/auth/application/auth-session.server", () => ({
  requireUserId: vi.fn(() => "user-id"),
}))

vi.mock("~/features/auth/infrastructure/passkeys-model.server", () => ({
  deletePasskeyFromDatabaseByIdAndUserId: vi.fn(() => ({ count: 1 })),
  retrievePasskeysFromDatabaseByUserId: vi.fn(() => []),
}))

vi.mock("~/features/chat/infrastructure/chat-model.server", () => ({
  retrieveOwnerStatusForUser: vi.fn(() => null),
}))

vi.mock("~/features/users/infrastructure/users-model.server", () => ({
  retrieveUserFromDatabaseById: vi.fn(() => ({
    createdAt: new Date("2026-05-31T00:00:00.000Z"),
    email: "user@example.com",
    emailVerifiedAt: new Date("2026-05-31T00:00:00.000Z"),
    id: "user-id",
    updatedAt: new Date("2026-05-31T00:00:00.000Z"),
  })),
}))

const createRouteArgs = (request: Request) => ({
  context: {} as never,
  params: {},
  pattern: "/settings",
  request,
  url: new URL(request.url),
})

const createFormRequest = (body: URLSearchParams) =>
  new Request("https://example.com/settings", {
    body,
    method: "POST",
  })

describe("settings loader", () => {
  test("given: an authenticated email-only user, should: return settings data", async () => {
    const request = new Request("https://example.com/settings")

    const loaderData = await loader(createRouteArgs(request))

    expect(requireUserId).toHaveBeenCalledWith(request)
    expect(retrievePasskeysFromDatabaseByUserId).toHaveBeenCalledWith("user-id")
    expect(retrieveOwnerStatusForUser).toHaveBeenCalledWith("user-id")
    expect(loaderData).toEqual({
      chatEmailConfigured: true,
      chatSmsConfigured: false,
      isOwner: false,
      pageTitle: "Settings",
      passkeys: [],
      userEmail: "user@example.com",
    })
  })

  test("given: an authenticated user with passkeys, should: return passkey summaries", async () => {
    vi.mocked(retrievePasskeysFromDatabaseByUserId).mockResolvedValueOnce([
      {
        createdAt: new Date("2026-05-31T00:00:00.000Z"),
        id: "passkey-id",
      },
    ] as Awaited<ReturnType<typeof retrievePasskeysFromDatabaseByUserId>>)
    const request = new Request("https://example.com/settings")

    const loaderData = await loader(createRouteArgs(request))

    expect(loaderData.passkeys).toEqual([
      { createdAt: "2026-05-31T00:00:00.000Z", id: "passkey-id" },
    ])
  })

  test("given: a missing user, should: redirect to sign in", async () => {
    vi.mocked(retrieveUserFromDatabaseById).mockResolvedValueOnce(null)
    const request = new Request("https://example.com/settings")

    await expect(loader(createRouteArgs(request))).rejects.toMatchObject({
      status: 302,
    })
  })
})

describe("settings action", () => {
  test("given: delete passkey intent, should: delete the user-owned passkey", async () => {
    const request = createFormRequest(
      new URLSearchParams({ intent: "deletePasskey", passkeyId: "passkey-id" }),
    )

    const response = await action(createRouteArgs(request))

    expect(deletePasskeyFromDatabaseByIdAndUserId).toHaveBeenCalledWith({
      id: "passkey-id",
      userId: "user-id",
    })
    expect(response).toEqual({
      data: { error: null, success: true },
      init: null,
      type: "DataWithResponseInit",
    })
  })

  test("given: invalid form data, should: return a bad request", async () => {
    const request = createFormRequest(
      new URLSearchParams({ intent: "unknown" }),
    )

    const response = await action(createRouteArgs(request))

    expect(response).toEqual({
      data: { error: "Invalid form data", success: false },
      init: { status: 400 },
      type: "DataWithResponseInit",
    })
  })
})
