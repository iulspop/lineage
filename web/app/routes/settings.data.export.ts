import type { Route } from "./+types/settings.data.export"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { exportUserData } from "~/features/lineage/application/user-data-portability.server"

export async function loader({ request }: Route.LoaderArgs) {
  const ownerId = await requireUserId(request)
  const bytes = await exportUserData(ownerId)
  return new Response(bytes as BodyInit, {
    headers: {
      "Content-Disposition": 'attachment; filename="lineage-user-data.lineage"',
      "Content-Type": "application/zip",
    },
  })
}
