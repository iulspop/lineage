import { redirect } from "react-router"

import type { Route } from "./+types/index"
import { getUserId } from "~/features/auth/application/auth-session.server"
import { LandingPageComponent } from "~/features/lineage/application/landing-page"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request)
  if (userId) throw redirect("/review")

  return { pageTitle: "Lineage" }
}

export const meta: Route.MetaFunction = ({ loaderData }) => [
  { title: loaderData?.pageTitle ?? "Lineage" },
]

export default function IndexRoute() {
  return <LandingPageComponent />
}
