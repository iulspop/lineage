import { describe, expect, test, vi } from "vitest"

import { action } from "./chat.presence"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { updateUserPresence } from "~/features/chat/infrastructure/chat-model.server"

vi.mock("~/features/auth/application/auth-session.server", () => ({
  requireUserId: vi.fn(() => "user-id"),
}))
vi.mock("~/features/chat/infrastructure/chat-model.server", () => ({
  updateUserPresence: vi.fn(),
}))

const args = (request: Request) => ({
  context: {} as never,
  params: {},
  pattern: "/chat/presence",
  request,
  url: new URL(request.url),
})

describe("chat presence action", () => {
  test("given: an authenticated heartbeat, should: persist presence without caching", async () => {
    const request = new Request("https://example.com/chat/presence", {
      method: "POST",
    })
    const actual = await action(args(request))
    expect(requireUserId).toHaveBeenCalledWith(request)
    expect(updateUserPresence).toHaveBeenCalledWith("user-id")
    expect(actual).toMatchObject({
      data: { success: true },
      init: { headers: { "Cache-Control": "private, no-store" } },
    })
  })
})
