import { data } from "react-router"

import { CHAT_ATTACHMENT_MAX_COUNT } from "../domain/chat-constants"
import { formatPresence } from "../domain/chat-domain"
import { validateChatMessageContent } from "../domain/chat-schemas"
import {
  deleteChatAttachment,
  saveChatAttachment,
} from "../infrastructure/attachments.server"
import {
  createChatMessage,
  markConversationRead,
} from "../infrastructure/chat-model.server"

export async function handleChatMessageAction({
  conversationId,
  request,
  senderId,
}: {
  conversationId: string
  request: Request
  senderId: string
}) {
  const formData = await request.formData()
  const body = String(formData.get("body") ?? "")
  const files = formData
    .getAll("attachments")
    .filter((value): value is File => value instanceof File && value.size > 0)
  const validation = validateChatMessageContent({
    attachmentCount: files.length,
    body,
  })
  if (!validation.success || files.length > CHAT_ATTACHMENT_MAX_COUNT)
    return data(
      { error: "Enter a valid message and up to four files." },
      { status: 400 },
    )

  const saved = []
  try {
    for (const file of files) saved.push(await saveChatAttachment(file))
    const message = await createChatMessage({
      attachments: saved.map(({ path: _path, ...attachment }) => attachment),
      body: validation.data.body,
      conversationId,
      senderId,
    })
    if (!message) throw new Error("NOT_FOUND")
    return data({ error: null, messageId: message.id })
  } catch {
    await Promise.all(
      saved.map((file) => deleteChatAttachment(file.storageName)),
    )
    return data({ error: "Message could not be sent." }, { status: 400 })
  }
}

export function serializeChatThread({
  conversation,
  messages,
  requesterId,
}: {
  conversation: {
    ownerId: string
    ownerReadAt: Date | null
    userId: string
    userReadAt: Date | null
  }
  messages: Array<{
    attachments: Array<{ id: string; originalName: string }>
    body: string
    createdAt: Date
    id: string
    senderId: string
  }>
  requesterId: string
}) {
  const otherReadAt =
    conversation.ownerId === requesterId
      ? conversation.userReadAt
      : conversation.ownerReadAt
  return messages.map((message) => ({
    attachments: message.attachments.map(({ id, originalName }) => ({
      id,
      originalName,
    })),
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    id: message.id,
    isMine: message.senderId === requesterId,
    isRead:
      message.senderId === requesterId &&
      otherReadAt !== null &&
      message.createdAt <= otherReadAt,
  }))
}

export { formatPresence, markConversationRead }
