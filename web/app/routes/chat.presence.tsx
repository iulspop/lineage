import { data } from "react-router"

import type { Route } from "./+types/chat.presence"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { updateUserPresence } from "~/features/chat/infrastructure/chat-model.server"

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request)
  await updateUserPresence(userId)
  return data(
    { success: true },
    { headers: { "Cache-Control": "private, no-store" } },
  )
}
