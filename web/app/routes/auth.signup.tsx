import type { Route } from "./+types/auth.signup"
import { authAction } from "~/features/auth/application/auth-action.server"
import { requireAnonymous } from "~/features/auth/application/auth-session.server"
import { SignUpPageComponent } from "~/features/auth/application/signup-page"

export const meta: Route.MetaFunction = () => [{ title: "Sign up" }]

export async function loader({ request }: Route.LoaderArgs) {
  await requireAnonymous(request)
  return {}
}

export async function action(args: Route.ActionArgs) {
  return await authAction(args)
}

export default function SignUpRoute({ actionData }: Route.ComponentProps) {
  return <SignUpPageComponent actionData={actionData} />
}
