import { redirect } from "react-router"

import type { Route } from "./+types/logout"
import { destroyUserSession } from "~/features/auth/application/auth-session.server"

export async function loader() {
  return redirect("/")
}

export async function action({ request }: Route.ActionArgs) {
  const setCookie = await destroyUserSession(request)
  return redirect("/login", {
    headers: { "Set-Cookie": setCookie },
  })
}
