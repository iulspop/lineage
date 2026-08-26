import { redirect } from "react-router"

import type { Route } from "./+types/create"
import { requireUserId } from "~/features/auth/application/auth-session.server"

export async function loader({ request }: Route.LoaderArgs) {
  await requireUserId(request)
  throw redirect("/create/import")
}

export default function CreateRedirect() {
  return null
}
