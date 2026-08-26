import type { Route } from "./+types/verify"
import { authAction } from "~/features/auth/application/auth-action.server"
import { requireAnonymous } from "~/features/auth/application/auth-session.server"
import { VerifyPageComponent } from "~/features/auth/application/verify-page"

export const meta: Route.MetaFunction = () => [{ title: "Verify" }]

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request)

  const url = new URL(request.url)
  const type = url.searchParams.get("type") ?? ""
  const target = url.searchParams.get("target") ?? ""

  return { target, type }
}

export async function action(args: Route.ActionArgs) {
  return await authAction(args)
}

export default function VerifyRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <VerifyPageComponent
      actionData={actionData}
      target={loaderData.target}
      type={loaderData.type}
    />
  )
}
