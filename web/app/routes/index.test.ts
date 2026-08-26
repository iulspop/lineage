import { redirect } from "react-router"
import { describe, expect, test, vi } from "vitest"

import { loader } from "./index"
import { getUserId } from "~/features/auth/application/auth-session.server"

vi.mock("~/features/auth/application/auth-session.server", () => ({
  getUserId: vi.fn(),
}))

const createRouteArgs = (request: Request) => ({
  context: {} as never,
  params: {},
  pattern: "/",
  request,
  url: new URL(request.url),
})

describe("index loader", () => {
  test("given: an anonymous visitor, should: return the Lineage landing page", async () => {
    vi.mocked(getUserId).mockResolvedValueOnce(null)

    await expect(
      loader(createRouteArgs(new Request("https://example.com/"))),
    ).resolves.toEqual({ pageTitle: "Lineage" })
  })

  test("given: an authenticated user, should: redirect to review", async () => {
    vi.mocked(getUserId).mockResolvedValueOnce("user-id")

    await expect(
      loader(createRouteArgs(new Request("https://example.com/"))),
    ).rejects.toEqual(redirect("/review"))
  })
})
