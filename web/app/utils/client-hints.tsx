import { getHintUtils } from "@epic-web/client-hints"
import {
  clientHint as colorSchemeHint,
  subscribeToSchemeChange,
} from "@epic-web/client-hints/color-scheme"
import { clientHint as timeZoneHint } from "@epic-web/client-hints/time-zone"
import { useEffect } from "react"
import { useRevalidator } from "react-router"

import { useOptionalRequestInfo, useRequestInfo } from "./request-info"

const hintsUtils = getHintUtils({
  theme: colorSchemeHint,
  timeZone: timeZoneHint,
})

export const { getHints } = hintsUtils

export function useHints() {
  const requestInfo = useRequestInfo()
  return requestInfo.hints
}

export function useOptionalHints() {
  const requestInfo = useOptionalRequestInfo()
  return requestInfo?.hints
}

export function ClientHintCheck({ nonce }: { nonce: string }) {
  const { revalidate } = useRevalidator()
  useEffect(() => subscribeToSchemeChange(() => revalidate()), [revalidate])

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for client hints inline script
      dangerouslySetInnerHTML={{
        __html: hintsUtils.getClientHintCheckScript(),
      }}
      nonce={nonce}
    />
  )
}
