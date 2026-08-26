import { data } from "react-router"

import type { Route } from "./+types/auth.passkey.login"
import {
  createUserSession,
  sessionStorage,
} from "~/features/auth/application/auth-session.server"
import {
  generatePasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
} from "~/features/auth/application/passkeys.server"

const PASSKEY_AUTHENTICATION_CHALLENGE_KEY = "passkeyAuthenticationChallenge"

export async function loader({ request }: Route.LoaderArgs) {
  const options = await generatePasskeyAuthenticationOptions(request)
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  session.set(PASSKEY_AUTHENTICATION_CHALLENGE_KEY, options.challenge)

  return data(options, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  })
}

export async function action({ request }: Route.ActionArgs) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  const expectedChallenge = session.get(PASSKEY_AUTHENTICATION_CHALLENGE_KEY)
  if (typeof expectedChallenge !== "string") {
    return data({ error: "CHALLENGE_MISSING" }, { status: 400 })
  }

  const user = await verifyPasskeyAuthentication({
    expectedChallenge,
    request,
    response: await request.json(),
  })

  if (!user) return data({ error: "INVALID_PASSKEY" }, { status: 401 })

  const headers = new Headers()
  headers.append("Set-Cookie", await createUserSession(user.id))

  return data({ success: true }, { headers })
}
