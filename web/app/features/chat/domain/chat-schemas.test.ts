import { describe, expect, test } from "vitest"

import {
  CHAT_ATTACHMENT_MAX_BYTES,
  CHAT_MESSAGE_MAX_LENGTH,
} from "./chat-constants"
import {
  chatAttachmentSchema,
  validateChatMessageContent,
} from "./chat-schemas"

describe("validateChatMessageContent()", () => {
  test("given: an empty message without attachments, should: reject it", () => {
    const actual = validateChatMessageContent({ attachmentCount: 0, body: " " })
    const expected = false

    expect(actual.success).toEqual(expected)
  })

  test("given: an empty message with an attachment, should: accept it", () => {
    const actual = validateChatMessageContent({ attachmentCount: 1, body: "" })
    const expected = true

    expect(actual.success).toEqual(expected)
  })

  test("given: an oversized message, should: reject it", () => {
    const actual = validateChatMessageContent({
      attachmentCount: 0,
      body: "a".repeat(CHAT_MESSAGE_MAX_LENGTH + 1),
    })
    const expected = false

    expect(actual.success).toEqual(expected)
  })
})

describe("chatAttachmentSchema", () => {
  test("given: an allowed image within the size limit, should: accept it", () => {
    const actual = chatAttachmentSchema.safeParse({
      byteSize: CHAT_ATTACHMENT_MAX_BYTES,
      mimeType: "image/png",
      originalName: "screenshot.png",
    })
    const expected = true

    expect(actual.success).toEqual(expected)
  })

  test("given: an executable file, should: reject it", () => {
    const actual = chatAttachmentSchema.safeParse({
      byteSize: 100,
      mimeType: "application/javascript",
      originalName: "payload.js",
    })
    const expected = false

    expect(actual.success).toEqual(expected)
  })

  test("given: a file over the size limit, should: reject it", () => {
    const actual = chatAttachmentSchema.safeParse({
      byteSize: CHAT_ATTACHMENT_MAX_BYTES + 1,
      mimeType: "application/pdf",
      originalName: "document.pdf",
    })
    const expected = false

    expect(actual.success).toEqual(expected)
  })
})
