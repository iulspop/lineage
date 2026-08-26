import type { MiddlewareFunction, RouterContextProvider } from "react-router"
import { createContext } from "react-router"

import { getUserId } from "./auth-session.server"

const authUserIdContext = createContext<string | null>()

/**
 * React Router middleware that resolves the authenticated user ID
 * from the session cookie and attaches it to the route context.
 */
export const authMiddleware: MiddlewareFunction = async (
  { context, request },
  next,
) => {
  const userId = await getUserId(request)
  context.set(authUserIdContext, userId)
  return next()
}

/**
 * Reads the authenticated user ID from the middleware-populated context.
 */
export const getUserIdFromContext = (
  context: Readonly<RouterContextProvider>,
): string | null => context.get(authUserIdContext) ?? null
