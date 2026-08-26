import { beforeEach, describe, expect, test, vi } from "vitest"

import { sendOwnerChatEmail } from "./chat-email.server"
import {
  createChatNotification,
  retrieveRecentChatNotification,
} from "./chat-model.server"
import { notifyOwnerOfChatMessage } from "./chat-notifications.server"
import { isOwnerChatSmsConfigured, sendOwnerChatSms } from "./chat-sms.server"

vi.mock("./chat-email.server", () => ({ sendOwnerChatEmail: vi.fn() }))
vi.mock("./chat-sms.server", () => ({
  isOwnerChatSmsConfigured: vi.fn(),
  sendOwnerChatSms: vi.fn(),
}))
vi.mock("./chat-model.server", () => ({
  createChatNotification: vi.fn(),
  retrieveRecentChatNotification: vi.fn(),
}))

const input = {
  dashboardUrl: "https://example.com/owner/chats/conversation-id",
  messageId: "message-id",
  now: new Date("2026-07-17T15:00:00.000Z"),
  ownerEmail: "owner@example.com",
  ownerId: "owner-id",
  ownerPhone: "+15555550100",
  senderEmail: "user@example.com",
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(retrieveRecentChatNotification).mockResolvedValue(null)
  vi.mocked(createChatNotification).mockResolvedValue({} as never)
  vi.mocked(isOwnerChatSmsConfigured).mockReturnValue(true)
  vi.mocked(sendOwnerChatEmail).mockResolvedValue({
    delivered: true,
    providerId: "email-id",
  })
  vi.mocked(sendOwnerChatSms).mockResolvedValue({
    delivered: true,
    providerId: "sms-id",
  })
})

describe("notifyOwnerOfChatMessage()", () => {
  test("given: a new unread burst, should: deliver email and SMS attempts", async () => {
    const actual = await notifyOwnerOfChatMessage(input)

    expect(actual).toEqual([
      { channel: "email", status: "delivered" },
      { channel: "sms", status: "delivered" },
    ])
    expect(createChatNotification).toHaveBeenCalledTimes(2)
  })

  test("given: SMS is not configured, should: deliver email without attempting SMS", async () => {
    vi.mocked(isOwnerChatSmsConfigured).mockReturnValue(false)

    const actual = await notifyOwnerOfChatMessage(input)

    expect(actual).toEqual([{ channel: "email", status: "delivered" }])
    expect(sendOwnerChatSms).not.toHaveBeenCalled()
    expect(createChatNotification).toHaveBeenCalledTimes(1)
  })

  test("given: a recent notification, should: suppress duplicate delivery", async () => {
    vi.mocked(retrieveRecentChatNotification).mockResolvedValue({} as never)

    const actual = await notifyOwnerOfChatMessage(input)

    expect(actual).toEqual([
      { channel: "email", status: "suppressed" },
      { channel: "sms", status: "suppressed" },
    ])
    expect(sendOwnerChatEmail).not.toHaveBeenCalled()
    expect(sendOwnerChatSms).not.toHaveBeenCalled()
  })

  test("given: a provider failure, should: record it without throwing", async () => {
    vi.mocked(sendOwnerChatSms).mockResolvedValue({
      delivered: false,
      errorCode: "SMS_FAILED",
    })

    const actual = await notifyOwnerOfChatMessage(input)

    expect(actual[1]).toEqual({ channel: "sms", status: "failed" })
    expect(createChatNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "sms",
        errorCode: "SMS_FAILED",
        status: "failed",
      }),
    )
  })
})
