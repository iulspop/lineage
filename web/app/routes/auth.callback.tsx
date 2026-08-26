import { redirect } from "react-router"

import type { Route } from "./+types/auth.callback"
import { createUserSession } from "~/features/auth/application/auth-session.server"
import { isSessionExpired } from "~/features/auth/domain/auth-domain"
import { verifyVerificationTOTP } from "~/features/auth/infrastructure/totp.server"
import {
  deleteVerificationFromDatabaseByTypeAndTarget,
  retrieveVerificationFromDatabaseByTypeAndTarget,
} from "~/features/auth/infrastructure/verifications-model.server"
import {
  retrieveUserFromDatabaseByEmail,
  saveUserToDatabase,
  updateUserInDatabaseById,
} from "~/features/users/infrastructure/users-model.server"

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const type = url.searchParams.get("type") ?? ""
  const target = url.searchParams.get("target") ?? ""
  const code = url.searchParams.get("code") ?? ""

  if (!type || !target || !code) throw redirect("/auth/signin")

  const verification = await retrieveVerificationFromDatabaseByTypeAndTarget({
    target,
    type,
  })

  if (!verification) throw redirect("/auth/signin")

  if (isSessionExpired(verification.expiresAt)) throw redirect("/auth/signin")

  const verifyResult = await verifyVerificationTOTP({
    algorithm: verification.algorithm,
    charSet: verification.charSet,
    digits: verification.digits,
    otp: code,
    period: verification.period,
    secret: verification.secret,
  })

  if (!verifyResult) throw redirect("/auth/signin")

  await deleteVerificationFromDatabaseByTypeAndTarget({ target, type })

  const existingUser = await retrieveUserFromDatabaseByEmail(target)

  if (existingUser) {
    await updateUserInDatabaseById({
      emailVerifiedAt: new Date(),
      id: existingUser.id,
    })
    const setCookie = await createUserSession(existingUser.id)
    throw redirect("/", { headers: { "Set-Cookie": setCookie } })
  }

  const user = await saveUserToDatabase({
    email: target,
    emailVerifiedAt: new Date(),
  })
  const setCookie = await createUserSession(user.id)
  throw redirect("/", { headers: { "Set-Cookie": setCookie } })
}
