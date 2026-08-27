import { redirect } from "react-router"

import type { Route } from "./+types/library"
import { requireUserId } from "~/features/auth/application/auth-session.server"
import { resolveActiveCorpus } from "~/features/lineage/application/active-corpus.server"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireUserId(request)
  const active = await resolveActiveCorpus(userId)
  if (active.status === "empty") return redirect("/settings/workspace")

  const sourceUrl = new URL(request.url)
  const target = new URL(
    `/library/${encodeURIComponent(active.corpusId)}`,
    sourceUrl.origin,
  )
  target.searchParams.set(
    "tab",
    sourceUrl.searchParams.get("tab") ?? "memories",
  )
  for (const name of ["q", "kind", "status", "due", "source", "collection"]) {
    const value = sourceUrl.searchParams.get(name)
    if (value) target.searchParams.set(name, value)
  }
  return redirect(`${target.pathname}${target.search}`)
}

export const meta: Route.MetaFunction = () => [{ title: "Library | Lineage" }]

export default function LibraryRoute() {
  return null
}
