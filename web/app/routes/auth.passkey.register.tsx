import { data } from "react-router"

import type { Route } from "./+types/auth.passkey.register"
import {
  getUserId,
  sessionStorage,
} from "~/features/auth/application/auth-session.server"
import {
  generatePasskeyRegistrationOptions,
  verifyPasskeyRegistration,
} from "~/features/auth/application/passkeys.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

const PASSKEY_REGISTRATION_CHALLENGE_KEY = "passkeyRegistrationChallenge"

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request)
  if (!userId) return data({ error: "UNAUTHENTICATED" }, { status: 401 })

  const user = await retrieveUserFromDatabaseById(userId)
  if (!user) return data({ error: "UNAUTHENTICATED" }, { status: 401 })

  const options = await generatePasskeyRegistrationOptions({
    request,
    userEmail: user.email,
    userId: user.id,
  })
  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  session.set(PASSKEY_REGISTRATION_CHALLENGE_KEY, options.challenge)

  return data(options, {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  })
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await getUserId(request)
  if (!userId) return data({ error: "UNAUTHENTICATED" }, { status: 401 })

  const session = await sessionStorage.getSession(request.headers.get("Cookie"))
  const expectedChallenge = session.get(PASSKEY_REGISTRATION_CHALLENGE_KEY)
  if (typeof expectedChallenge !== "string") {
    return data({ error: "CHALLENGE_MISSING" }, { status: 400 })
  }

  const verified = await verifyPasskeyRegistration({
    expectedChallenge,
    request,
    response: await request.json(),
    userId,
  })

  session.unset(PASSKEY_REGISTRATION_CHALLENGE_KEY)

  return data(
    { verified },
    { headers: { "Set-Cookie": await sessionStorage.commitSession(session) } },
  )
}
