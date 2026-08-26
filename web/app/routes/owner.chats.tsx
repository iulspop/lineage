import { redirect } from "react-router"

import type { Route } from "./+types/owner.chats"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { OwnerChatDashboard } from "~/features/chat/application/owner-chat-dashboard"
import * as layout from "~/features/chat/application/owner-chat-layout.css"
import {
  retrieveOwnerConversationSummaries,
  retrieveOwnerStatusForUser,
} from "~/features/chat/infrastructure/chat-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const ownerClaim = await retrieveOwnerStatusForUser(userId)
  if (!ownerClaim) throw redirect("/")

  const conversations = await retrieveOwnerConversationSummaries(userId)
  return {
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      latestMessage: conversation.latestMessage
        ? {
            body: conversation.latestMessage.body,
            createdAt: conversation.latestMessage.createdAt.toISOString(),
          }
        : null,
      unreadCount: conversation.unreadCount,
      user: {
        email: conversation.user.email,
        lastSeenAt: conversation.user.lastSeenAt?.toISOString() ?? null,
      },
    })),
    pageTitle: "Chat dashboard",
  }
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.pageTitle },
]

export default function OwnerChatsRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main className={layout.workspace}>
      <OwnerChatDashboard conversations={loaderData.conversations} />
    </main>
  )
}
