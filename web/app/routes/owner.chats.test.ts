import { describe, expect, test, vi } from "vitest"

import { loader } from "./owner.chats"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import {
  retrieveOwnerConversationSummaries,
  retrieveOwnerStatusForUser,
} from "~/features/chat/infrastructure/chat-model.server"

vi.mock("~/features/auth/application/auth-session.server", () => ({
  requireUserId: vi.fn(() => "owner-id"),
}))
vi.mock("~/features/chat/infrastructure/chat-model.server", () => ({
  retrieveOwnerConversationSummaries: vi.fn(() => []),
  retrieveOwnerStatusForUser: vi.fn(() => ({ userId: "owner-id" })),
}))

const args = (request: Request) => ({
  context: {} as never,
  params: {},
  pattern: "/owner/chats",
  request,
  url: new URL(request.url),
})

describe("owner chat dashboard loader", () => {
  test("given: the owner, should: return private conversation summaries", async () => {
    vi.mocked(retrieveOwnerConversationSummaries).mockResolvedValueOnce([
      {
        id: "conversation-id",
        latestMessage: {
          body: "Hello",
          createdAt: new Date("2026-07-17T12:00:00Z"),
        },
        unreadCount: 2,
        user: { email: "user@example.com", lastSeenAt: null },
      },
    ] as never)
    const actual = await loader(
      args(new Request("https://example.com/owner/chats")),
    )
    expect(actual.conversations).toEqual([
      {
        id: "conversation-id",
        latestMessage: { body: "Hello", createdAt: "2026-07-17T12:00:00.000Z" },
        unreadCount: 2,
        user: { email: "user@example.com", lastSeenAt: null },
      },
    ])
  })

  test("given: a regular user, should: redirect away", async () => {
    vi.mocked(retrieveOwnerStatusForUser).mockResolvedValueOnce(null)
    await expect(
      loader(args(new Request("https://example.com/owner/chats"))),
    ).rejects.toMatchObject({ status: 302 })
    expect(requireUserId).toHaveBeenCalled()
  })
})
