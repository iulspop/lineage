import { createCookieSessionStorage } from "react-router"
import { describe, expect, test, vi } from "vitest"

import { action } from "./auth.passkey.login"
import {
  createUserSession,
  sessionStorage,
} from "~/features/auth/application/auth-session.server"
import { verifyPasskeyAuthentication } from "~/features/auth/application/passkeys.server"

vi.mock("~/features/auth/application/auth-session.server", () => {
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      path: "/",
      secrets: ["test-secret"],
    },
  })

  return {
    createUserSession: vi.fn(() => "__session=user-session; Path=/; HttpOnly"),
    sessionStorage,
  }
})

vi.mock("~/features/auth/application/passkeys.server", () => ({
  generatePasskeyAuthenticationOptions: vi.fn(),
  verifyPasskeyAuthentication: vi.fn(),
}))

describe("auth.passkey.login action", () => {
  test("given: a valid passkey response, should: return only the authenticated user session cookie", async () => {
    const session = await sessionStorage.getSession()
    session.set("passkeyAuthenticationChallenge", "challenge")
    const cookie = await sessionStorage.commitSession(session)
    vi.mocked(verifyPasskeyAuthentication).mockResolvedValue({
      id: "user-id",
    } as Awaited<ReturnType<typeof verifyPasskeyAuthentication>>)

    const request = new Request("https://example.com/auth/passkey/login", {
      body: JSON.stringify({ id: "credential-id" }),
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      method: "POST",
    })
    const response = await action({
      context: {} as never,
      params: {},
      pattern: "/auth/passkey/login",
      request,
      url: new URL(request.url),
    })

    const actual = new Headers(response.init?.headers).getSetCookie()
    const expected = ["__session=user-session; Path=/; HttpOnly"]

    expect(createUserSession).toHaveBeenCalledWith("user-id")
    expect(actual).toEqual(expected)
  })
})
