import type { Route } from "./+types/chat.events"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { retrieveChatEventSnapshot } from "~/features/chat/infrastructure/chat-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const encoder = new TextEncoder()
  let previous = JSON.stringify(await retrieveChatEventSnapshot(userId))

  let interval: ReturnType<typeof setInterval> | undefined
  let closed = false
  const stop = (controller?: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return
    closed = true
    if (interval) clearInterval(interval)
    controller?.close()
  }

  const stream = new ReadableStream({
    cancel() {
      stop()
    },
    start(controller) {
      controller.enqueue(
        encoder.encode(`event: snapshot\ndata: ${previous}\n\n`),
      )
      interval = setInterval(async () => {
        try {
          const next = JSON.stringify(await retrieveChatEventSnapshot(userId))
          if (closed) return
          if (next !== previous) {
            previous = next
            controller.enqueue(encoder.encode(`event: chat\ndata: ${next}\n\n`))
          } else controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          stop(controller)
        }
      }, 2000)
      request.signal.addEventListener("abort", () => stop(controller), {
        once: true,
      })
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
