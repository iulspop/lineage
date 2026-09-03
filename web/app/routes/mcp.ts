import { createHash } from "node:crypto"
import type { AuthInfo } from "@modelcontextprotocol/server"
import { createMcpHandler } from "@modelcontextprotocol/server"

import type { Route } from "./+types/mcp"
import { getServerEnv } from "~/config/server-env.server"
import {
  createIntegrationMemories,
  IntegrationMemoryConflictError,
  IntegrationMemoryValidationError,
  IntegrationWorkspaceUnavailableError,
} from "~/features/integrations/application/create-memories.server"
import { createMcpMemoryServer } from "~/features/integrations/application/mcp-server.server"
import { authenticateAccessToken } from "~/features/integrations/application/oauth-service.server"
import type { McpCreateMemoriesResult } from "~/features/integrations/domain/mcp"
import { McpCreateMemoriesError } from "~/features/integrations/domain/mcp"
import type { CreateMemoriesRequest } from "~/features/integrations/domain/memory-api"
import {
  isTrustedIntegrationOrigin,
  secureCredentialHeaders,
} from "~/features/integrations/infrastructure/integration-http.server"
import { prisma } from "~/utils/db.server"

const MAX_BODY_BYTES = 1_000_000
const RATE_LIMIT = 60
const RATE_WINDOW_MS = 60_000
const IDEMPOTENCY_LIFETIME_MS = 24 * 60 * 60 * 1000

type McpAuthorization = NonNullable<
  Awaited<ReturnType<typeof authenticateAccessToken>>
>

function mcpResource(request: Request) {
  const origin = new URL(getServerEnv().APP_URL ?? request.url).origin
  return `${origin}/mcp`
}

function bearerToken(request: Request) {
  const match = request.headers.get("Authorization")?.match(/^Bearer ([^\s]+)$/)
  return match?.[1] ?? null
}

function protectedResourceMetadataUrl(request: Request) {
  const origin = new URL(getServerEnv().APP_URL ?? request.url).origin
  return `${origin}/.well-known/oauth-protected-resource/mcp`
}

function unauthorized(request: Request) {
  return Response.json(
    {
      error: "invalid_token",
      error_description: "A valid bearer token is required",
    },
    {
      headers: secureCredentialHeaders({
        "WWW-Authenticate": `Bearer resource_metadata="${protectedResourceMetadataUrl(request)}"`,
      }),
      status: 401,
    },
  )
}

function secured(response: Response) {
  const headers = new Headers(response.headers)
  for (const [name, value] of Object.entries(secureCredentialHeaders()))
    headers.set(name, value)
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
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

function idempotencyIdentity(
  authorization: McpAuthorization,
  request: CreateMemoriesRequest,
  mcpRequestId: number | string,
) {
  const requestHash = createHash("sha256")
    .update(JSON.stringify(request))
    .digest("hex")
  const key = createHash("sha256")
    .update(
      `${authorization.clientPublicId}\0${String(mcpRequestId)}\0${requestHash}`,
    )
    .digest("hex")
  return { key: `mcp:${key}`, requestHash }
}

async function createMemoriesIdempotently(
  authorization: McpAuthorization,
  request: CreateMemoriesRequest,
  mcpRequestId: number | string,
): Promise<McpCreateMemoriesResult> {
  const { key, requestHash } = idempotencyIdentity(
    authorization,
    request,
    mcpRequestId,
  )
  const existing = await prisma.integrationIdempotencyRecord.findUnique({
    where: {
      clientId_userId_key: {
        clientId: authorization.clientId,
        key,
        userId: authorization.userId,
      },
    },
  })
  if (existing?.statusCode === 200)
    return JSON.parse(existing.responseJson) as McpCreateMemoriesResult
  if (existing) throw new McpCreateMemoriesError("request_in_progress")

  await prisma.integrationIdempotencyRecord.create({
    data: {
      clientId: authorization.clientId,
      expiresAt: new Date(Date.now() + IDEMPOTENCY_LIFETIME_MS),
      grantId: authorization.grantId,
      key,
      requestHash,
      responseJson: "",
      statusCode: 0,
      userId: authorization.userId,
    },
  })

  try {
    const created = await createIntegrationMemories({
      clientDatabaseId: authorization.clientId,
      clientId: authorization.clientPublicId,
      grantId: authorization.grantId,
      request,
      requestId: key,
      userId: authorization.userId,
    })
    const result: McpCreateMemoriesResult = {
      createdMemoryCount: created.created.length,
      itemCount: request.items.length,
      status: "created",
    }
    await prisma.integrationIdempotencyRecord.update({
      data: { responseJson: JSON.stringify(result), statusCode: 200 },
      where: {
        clientId_userId_key: {
          clientId: authorization.clientId,
          key,
          userId: authorization.userId,
        },
      },
    })
    return result
  } catch (caught) {
    await prisma.integrationIdempotencyRecord.deleteMany({
      where: {
        clientId: authorization.clientId,
        key,
        statusCode: 0,
        userId: authorization.userId,
      },
    })
    if (caught instanceof IntegrationWorkspaceUnavailableError)
      throw new McpCreateMemoriesError("workspace_unavailable")
    if (caught instanceof IntegrationMemoryValidationError)
      throw new McpCreateMemoriesError("validation_failed")
    if (caught instanceof IntegrationMemoryConflictError)
      throw new McpCreateMemoriesError("write_conflict")
    throw caught
  }
}

const handler = createMcpHandler(
  ({ authInfo }) => {
    const authorization = authInfo?.extra?.authorization as
      | McpAuthorization
      | undefined
    if (!authorization) throw new Error("Missing MCP authorization context")
    return createMcpMemoryServer({
      createMemories: (request, mcpRequestId) =>
        createMemoriesIdempotently(authorization, request, mcpRequestId),
    })
  },
  { legacy: "stateless", responseMode: "json" },
)

export async function action({ request }: Route.ActionArgs) {
  const trustedOrigin = new URL(getServerEnv().APP_URL ?? request.url).origin
  if (!isTrustedIntegrationOrigin(request, trustedOrigin))
    return secured(Response.json({ error: "invalid_origin" }, { status: 403 }))
  if (!request.headers.get("Content-Type")?.startsWith("application/json"))
    return secured(
      Response.json({ error: "unsupported_media_type" }, { status: 415 }),
    )

  const declaredLength = Number(request.headers.get("Content-Length") ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES)
    return secured(new Response("Request body is too large", { status: 413 }))

  const token = bearerToken(request)
  if (!token) return unauthorized(request)
  const resource = mcpResource(request)
  const authorization = await authenticateAccessToken(
    token,
    new Date(),
    resource,
  )
  if (!authorization) return unauthorized(request)
  if (!(await consumeRateLimit(authorization.tokenId, new Date())))
    return secured(Response.json({ error: "rate_limited" }, { status: 429 }))

  const body = await request.text()
  if (Buffer.byteLength(body) > MAX_BODY_BYTES)
    return secured(new Response("Request body is too large", { status: 413 }))

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(body)
  } catch {
    return secured(Response.json({ error: "invalid_json" }, { status: 400 }))
  }

  const authInfo: AuthInfo = {
    clientId: authorization.clientPublicId,
    extra: { authorization },
    resource: new URL(resource),
    scopes: [authorization.scope],
    token,
  }
  const handlerRequest = new Request(request, { body, method: "POST" })
  return secured(await handler.fetch(handlerRequest, { authInfo, parsedBody }))
}

export function loader() {
  return secured(new Response("Method not allowed", { status: 405 }))
}
