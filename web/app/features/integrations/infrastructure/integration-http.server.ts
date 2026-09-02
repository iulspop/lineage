const MAX_OAUTH_BODY_BYTES = 16_384
const SENSITIVE_QUERY_PARAMETERS = new Set([
  "access_token",
  "client_secret",
  "code",
  "code_verifier",
  "refresh_token",
  "token",
])

export async function readBoundedFormData(request: Request) {
  const declaredLength = Number(request.headers.get("Content-Length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_OAUTH_BODY_BYTES)
    return null
  const body = await request.text()
  if (Buffer.byteLength(body) > MAX_OAUTH_BODY_BYTES) return null
  return new URLSearchParams(body)
}

export function secureCredentialHeaders(extra?: HeadersInit) {
  return {
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    Pragma: "no-cache",
    "X-Content-Type-Options": "nosniff",
    ...extra,
  }
}

export function redactIntegrationUrl(value: string | undefined) {
  if (!value) return value
  try {
    const url = new URL(value)
    for (const parameter of SENSITIVE_QUERY_PARAMETERS) {
      if (url.searchParams.has(parameter))
        url.searchParams.set(parameter, "[REDACTED]")
    }
    return url.toString()
  } catch {
    return value
  }
}
