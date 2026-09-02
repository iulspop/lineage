import { createHash } from "node:crypto"

import type { Route } from "./+types/api.v1.memories"
import {
  createIntegrationMemories,
  IntegrationMemoryConflictError,
  IntegrationMemoryValidationError,
  IntegrationWorkspaceUnavailableError,
} from "~/features/integrations/application/create-memories.server"
import { authenticateAccessToken } from "~/features/integrations/application/oauth-service.server"
import { createMemoriesRequestSchema } from "~/features/integrations/domain/memory-api"
import { secureCredentialHeaders } from "~/features/integrations/infrastructure/integration-http.server"
import { prisma } from "~/utils/db.server"

const MAX_BODY_BYTES = 1_000_000
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60_000
const IDEMPOTENCY_LIFETIME_MS = 24 * 60 * 60 * 1000

function response(body: unknown, status: number, extraHeaders?: HeadersInit) {
  return Response.json(body, {
    headers: secureCredentialHeaders(extraHeaders),
    status,
  })
}

function error(
  status: number,
  code: string,
  message: string,
  requestId: string,
) {
  return response({ error: { code, message }, requestId }, status)
}

function bearerToken(request: Request) {
  const authorization = request.headers.get("Authorization")
  const match = authorization?.match(/^Bearer ([^\s]+)$/)
  return match?.[1] ?? null
}

async function consumeRateLimit(tokenId: string, now: Date) {
  return prisma.$transaction(async (transaction) => {
    const token = await transaction.integrationAccessToken.findUniqueOrThrow({
      select: { windowRequestCount: true, windowStartedAt: true },
      where: { id: tokenId },
    })
    const reset =
      !token.windowStartedAt ||
      now.getTime() - token.windowStartedAt.getTime() >= RATE_WINDOW_MS
    const count = reset ? 1 : token.windowRequestCount + 1
    await transaction.integrationAccessToken.update({
      data: {
        windowRequestCount: count,
        windowStartedAt: reset ? now : token.windowStartedAt,
      },
      where: { id: tokenId },
    })
    return count <= RATE_LIMIT
  })
}

export async function action({ request }: Route.ActionArgs) {
  const requestId = crypto.randomUUID()
  const token = bearerToken(request)
  if (!token)
    return error(
      401,
      "invalid_token",
      "A valid bearer token is required",
      requestId,
    )
  const authorization = await authenticateAccessToken(token)
  if (!authorization)
    return error(
      401,
      "invalid_token",
      "A valid bearer token is required",
      requestId,
    )
  if (!(await consumeRateLimit(authorization.tokenId, new Date())))
    return error(429, "rate_limited", "Request rate limit exceeded", requestId)

  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim()
  if (!idempotencyKey || idempotencyKey.length > 200)
    return error(
      400,
      "invalid_idempotency_key",
      "Idempotency-Key is required",
      requestId,
    )
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return error(
      415,
      "unsupported_media_type",
      "Use application/json",
      requestId,
    )
  const declaredLength = Number(request.headers.get("Content-Length") ?? 0)
  if (declaredLength > MAX_BODY_BYTES)
    return error(
      413,
      "payload_too_large",
      "Request body is too large",
      requestId,
    )

  const body = await request.text()
  if (Buffer.byteLength(body) > MAX_BODY_BYTES)
    return error(
      413,
      "payload_too_large",
      "Request body is too large",
      requestId,
    )
  const requestHash = createHash("sha256").update(body).digest("hex")
  const existing = await prisma.integrationIdempotencyRecord.findUnique({
    where: {
      clientId_userId_key: {
        clientId: authorization.clientId,
        key: idempotencyKey,
        userId: authorization.userId,
      },
    },
  })
  if (existing) {
    if (existing.requestHash !== requestHash)
      return error(
        409,
        "idempotency_conflict",
        "Idempotency-Key was already used for another request",
        requestId,
      )
    return new Response(existing.responseJson, {
      headers: secureCredentialHeaders({
        "Content-Type": "application/json",
      }),
      status: existing.statusCode,
    })
  }

  let input: unknown
  try {
    input = JSON.parse(body)
  } catch {
    return error(
      400,
      "invalid_json",
      "Request body is not valid JSON",
      requestId,
    )
  }
  const parsed = createMemoriesRequestSchema.safeParse(input)
  if (!parsed.success)
    return response(
      {
        error: {
          code: "invalid_request",
          issues: parsed.error.issues,
          message: "Memory request is invalid",
        },
        requestId,
      },
      422,
    )

  try {
    await prisma.integrationIdempotencyRecord.create({
      data: {
        clientId: authorization.clientId,
        expiresAt: new Date(Date.now() + IDEMPOTENCY_LIFETIME_MS),
        grantId: authorization.grantId,
        key: idempotencyKey,
        requestHash,
        responseJson: "",
        statusCode: 0,
        userId: authorization.userId,
      },
    })
  } catch {
    const concurrent = await prisma.integrationIdempotencyRecord.findUnique({
      where: {
        clientId_userId_key: {
          clientId: authorization.clientId,
          key: idempotencyKey,
          userId: authorization.userId,
        },
      },
    })
    if (concurrent?.requestHash !== requestHash)
      return error(
        409,
        "idempotency_conflict",
        "Idempotency-Key was already used for another request",
        requestId,
      )
    return error(
      409,
      "request_in_progress",
      "An identical request is already in progress",
      requestId,
    )
  }

  try {
    const created = await createIntegrationMemories({
      clientDatabaseId: authorization.clientId,
      clientId: authorization.clientPublicId,
      grantId: authorization.grantId,
      request: parsed.data,
      requestId,
      userId: authorization.userId,
    })
    const responseJson = JSON.stringify(created)
    await prisma.integrationIdempotencyRecord.update({
      data: { responseJson, statusCode: 201 },
      where: {
        clientId_userId_key: {
          clientId: authorization.clientId,
          key: idempotencyKey,
          userId: authorization.userId,
        },
      },
    })
    return new Response(responseJson, {
      headers: secureCredentialHeaders({
        "Content-Type": "application/json",
      }),
      status: 201,
    })
  } catch (caught) {
    await prisma.integrationIdempotencyRecord.deleteMany({
      where: {
        clientId: authorization.clientId,
        key: idempotencyKey,
        statusCode: 0,
        userId: authorization.userId,
      },
    })
    if (caught instanceof IntegrationWorkspaceUnavailableError)
      return error(
        409,
        "workspace_unavailable",
        "No active workspace is available",
        requestId,
      )
    if (caught instanceof IntegrationMemoryConflictError)
      return error(
        409,
        "write_conflict",
        "The workspace changed during creation",
        requestId,
      )
    if (caught instanceof IntegrationMemoryValidationError)
      return response(
        {
          error: {
            code: "validation_failed",
            diagnostics: caught.diagnostics,
            message: caught.message,
          },
          requestId,
        },
        422,
      )
    throw caught
  }
}

export function loader() {
  return response(
    { error: { code: "method_not_allowed", message: "Use POST" } },
    405,
  )
}
