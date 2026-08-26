import { invariant } from "@epic-web/invariant"
import { useRouteLoaderData } from "react-router"

import type { loader as rootLoader } from "~/root"

export function useRequestInfo() {
  const maybeRequestInfo = useOptionalRequestInfo()
  invariant(maybeRequestInfo, "No requestInfo found in root loader")
  return maybeRequestInfo
}

export function useOptionalRequestInfo() {
  const data = useRouteLoaderData<typeof rootLoader>("root")
  return data?.requestInfo
}
