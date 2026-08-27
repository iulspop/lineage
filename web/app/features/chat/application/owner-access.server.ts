import { getServerEnv } from "~/config/server-env.server"
import {
  isOwnerEmailAllowed,
  parseOwnerEmailAllowlist,
} from "~/features/chat/domain/chat-domain"
import { retrieveOwnerClaim } from "~/features/chat/infrastructure/chat-model.server"
import { retrieveUserFromDatabaseById } from "~/features/users/infrastructure/users-model.server"

export async function getOwnerAccess(userId: string | null) {
  if (!userId) return { canClaimOwner: false, isOwner: false }

  const [claim, user] = await Promise.all([
    retrieveOwnerClaim(),
    retrieveUserFromDatabaseById(userId),
  ])
  const isOwner = claim?.userId === userId

  return {
    canClaimOwner:
      claim === null &&
      user !== null &&
      user.emailVerifiedAt !== null &&
      isOwnerEmailAllowed(
        user.email,
        parseOwnerEmailAllowlist(getServerEnv().OWNER_EMAIL_ALLOWLIST),
      ),
    isOwner,
  }
}
