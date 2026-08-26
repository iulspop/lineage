import type { Route } from "./+types/chat.events"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { retrieveChatEventSnapshot } from "~/features/chat/infrastructure/chat-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const encoder = new TextEncoder()
  let previous = JSON.stringify(await retrieveChatEventSnapshot(userId))

  const stream = new ReadableStream({
    cancel() {},
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: snapshot\ndata: ${previous}\n\n`),
      )
      const interval = setInterval(async () => {
        try {
          const next = JSON.stringify(await retrieveChatEventSnapshot(userId))
          if (next !== previous) {
            previous = next
            controller.enqueue(encoder.encode(`event: chat\ndata: ${next}\n\n`))
          } else controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 2000)
      request.signal.addEventListener(
        "abort",
        () => {
          clearInterval(interval)
          controller.close()
        },
        { once: true },
      )
    },
  })

  return new Response(stream, {
    headers: {
      "Cache-Control": "private, no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  })
}
