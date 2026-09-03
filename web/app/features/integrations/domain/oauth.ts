import { z } from "zod"

export const INTEGRATION_SCOPE = "memories:write" as const

const oauthText = z.string().trim().min(1).max(2048)
const optionalResource = oauthText.optional()

export const authorizationRequestSchema = z
  .object({
    client_id: z.string().trim().min(1).max(255),
    code_challenge: z.string().regex(/^[A-Za-z0-9_-]{43,128}$/),
    code_challenge_method: z.literal("S256"),
    redirect_uri: oauthText,
    resource: optionalResource,
    response_type: z.literal("code"),
    scope: oauthText,
    state: z.string().min(1).max(1024),
  })
  .strict()

export const authorizationCodeTokenRequestSchema = z
  .object({
    client_id: z.string().trim().min(1).max(255),
    code: z.string().min(32).max(512),
    code_verifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/),
    grant_type: z.literal("authorization_code"),
    redirect_uri: oauthText,
    resource: optionalResource,
  })
  .strict()

export const refreshTokenRequestSchema = z
  .object({
    client_id: z.string().trim().min(1).max(255),
    grant_type: z.literal("refresh_token"),
    refresh_token: z.string().min(32).max(512),
    resource: optionalResource,
  })
  .strict()

export const tokenRequestSchema = z.discriminatedUnion("grant_type", [
  authorizationCodeTokenRequestSchema,
  refreshTokenRequestSchema,
])

export const revocationRequestSchema = z
  .object({
    client_id: z.string().trim().min(1).max(255),
    token: z.string().min(32).max(512),
    token_type_hint: z.enum(["access_token", "refresh_token"]).optional(),
  })
  .strict()

export const dynamicClientRegistrationSchema = z
  .object({
    application_type: z.literal("web").default("web"),
    client_name: z.string().trim().min(1).max(120),
    client_uri: z
      .url()
      .max(2048)
      .refine((value) => new URL(value).protocol === "https:")
      .optional(),
    grant_types: z
      .tuple([z.literal("authorization_code")])
      .default(["authorization_code"]),
    redirect_uris: z
      .array(oauthText)
      .min(1)
      .max(10)
      .refine((values) => new Set(values).size === values.length),
    response_types: z.tuple([z.literal("code")]).default(["code"]),
    scope: z.literal(INTEGRATION_SCOPE).default(INTEGRATION_SCOPE),
    software_id: z.string().trim().min(1).max(255).optional(),
    software_version: z.string().trim().min(1).max(255).optional(),
    token_endpoint_auth_method: z.literal("none").default("none"),
  })
  .strict()
  .refine(
    ({ redirect_uris }) =>
      redirect_uris.every(isPermittedRegisteredRedirectUri),
    { message: "Redirect URIs must use HTTPS or loopback HTTP" },
  )

export type AuthorizationRequest = z.infer<typeof authorizationRequestSchema>
export type DynamicClientRegistration = z.infer<
  typeof dynamicClientRegistrationSchema
>
export type TokenRequest = z.infer<typeof tokenRequestSchema>

export function normalizeScope(value: string) {
  const scopes = value.trim().split(/\s+/).filter(Boolean)
  if (scopes.length !== 1 || scopes[0] !== INTEGRATION_SCOPE)
    return { error: "invalid_scope" as const, valid: false as const }
  return { scope: INTEGRATION_SCOPE, valid: true as const }
}

export function isExactRedirectUri(
  registeredUris: readonly string[],
  requestedUri: string,
) {
  return registeredUris.includes(requestedUri)
}

export function normalizeResource(value: string | undefined) {
  if (!value) return ""
  try {
    const url = new URL(value)
    if (url.username || url.password || url.hash || url.search) return null
    return url.toString()
  } catch {
    return null
  }
}

export function isPermittedRegisteredRedirectUri(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.username || url.password || url.hash) return false
  if (url.protocol === "https:") return true
  return (
    url.protocol === "http:" &&
    (url.hostname === "127.0.0.1" ||
      url.hostname === "[::1]" ||
      url.hostname === "localhost")
  )
}

export function oauthErrorResponse(
  error: string,
  description: string,
  status = 400,
) {
  return Response.json(
    { error, error_description: description },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        Pragma: "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
      status,
    },
  )
}

export function appendAuthorizationResult(
  redirectUri: string,
  values: { code?: string; error?: string; state: string },
) {
  const url = new URL(redirectUri)
  if (values.code) url.searchParams.set("code", values.code)
  if (values.error) url.searchParams.set("error", values.error)
  url.searchParams.set("state", values.state)
  return url.toString()
}
