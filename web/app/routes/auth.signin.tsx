import type { Route } from "./+types/auth.signin"
import { authAction } from "~/features/auth/application/auth-action.server"
import { requireAnonymous } from "~/features/auth/application/auth-session.server"
import { SignInPageComponent } from "~/features/auth/application/signin-page"

export const meta: Route.MetaFunction = () => [{ title: "Sign in" }]

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request)
  return {}
}

export async function action(args: Route.ActionArgs) {
  return await authAction(args)
}

export default function SignInRoute({ actionData }: Route.ComponentProps) {
  return <SignInPageComponent actionData={actionData} />
}
