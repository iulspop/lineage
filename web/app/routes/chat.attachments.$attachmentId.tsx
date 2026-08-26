import { Readable } from "node:stream"

import type { Route } from "./+types/chat.attachments.$attachmentId"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { openChatAttachment } from "~/features/chat/infrastructure/attachments.server"
import { retrieveAttachmentForParticipant } from "~/features/chat/infrastructure/chat-model.server"

export async function loader({ params, request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const attachment = await retrieveAttachmentForParticipant({
    attachmentId: params.attachmentId,
    requesterId: userId,
  })
  if (!attachment) throw new Response("Not found", { status: 404 })
  const stream = openChatAttachment(attachment.storageName)
  if (!stream) throw new Response("Not found", { status: 404 })
  const filename = attachment.originalName.replace(/["\\\r\n]/g, "_")
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": attachment.mimeType,
      "X-Content-Type-Options": "nosniff",
    },
  })
}
