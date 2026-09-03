import { serializeCorpusDocument } from "@lineage/core/corpus"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { action } from "./mcp"
import { hashCredential } from "~/features/integrations/infrastructure/oauth-crypto.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { prisma } from "~/utils/db.server"

let userId: string
let clientDatabaseId: string
const corpusId = "mcp-route-test"
const accessToken = "mcp-test-access-token"
const resource = "http://localhost:5250/mcp"

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      activeLineageCorpusId: corpusId,
      email: `mcp-route-${crypto.randomUUID()}@example.com`,
    },
  })
  userId = user.id
  const client = await prisma.integrationClient.create({
    data: {
      clientId: `mcp-route-client-${crypto.randomUUID()}`,
      clientType: "public",
      name: "MCP route client",
      registrationType: "dynamic",
    },
  })
  clientDatabaseId = client.id
  const grant = await prisma.integrationGrant.create({
    data: {
      clientId: client.id,
      resource,
      scope: "memories:write",
      userId,
    },
  })
  await prisma.integrationAccessToken.create({
    data: {
      clientId: client.id,
      expiresAt: new Date(Date.now() + 60_000),
      grantId: grant.id,
      resource,
      scope: "memories:write",
      tokenHash: hashCredential(accessToken),
    },
  })
  const validation = lineageRuntime.validateCorpus?.({
    corpusId,
    format: "lineage.corpus",
    formatVersion: 1,
    prompts: [],
  })
  if (!validation?.valid) throw new Error("Invalid test corpus")
  await corpusSnapshotStore.append(userId, {
    canonicalJson: serializeCorpusDocument(validation.document),
    corpusId,
    digest: "mcp-route-base",
    formatVersion: 1,
  })
})

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: userId } })
  await prisma.integrationClient.deleteMany({ where: { id: clientDatabaseId } })
})

function mcpRequest(body: unknown, token = accessToken) {
  return new Request(resource, {
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json, text/event-stream",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "MCP-Protocol-Version": "2025-11-25",
    },
    method: "POST",
  })
}

describe("POST /mcp", () => {
  it("rejects foreign origins and non-JSON payloads", async () => {
    const foreignOrigin = mcpRequest({
      id: 1,
      jsonrpc: "2.0",
      method: "tools/list",
    })
    foreignOrigin.headers.set("Origin", "https://attacker.example")
    const foreignResponse = await action({ request: foreignOrigin } as never)
    expect(foreignResponse.status).toBe(403)

    const wrongContentType = mcpRequest({
      id: 2,
      jsonrpc: "2.0",
      method: "tools/list",
    })
    wrongContentType.headers.set("Content-Type", "text/plain")
    const contentTypeResponse = await action({
      request: wrongContentType,
    } as never)
    expect(contentTypeResponse.status).toBe(415)
  })

  it("rejects malformed JSON and unsupported read methods", async () => {
    const malformed = mcpRequest({})
    const malformedRequest = new Request(malformed.url, {
      body: "{",
      headers: malformed.headers,
      method: "POST",
    })
    const malformedResponse = await action({
      request: malformedRequest,
    } as never)
    expect(malformedResponse.status).toBe(400)
    expect(await malformedResponse.json()).toEqual({ error: "invalid_json" })
  })

  it("advertises protected-resource metadata when authentication fails", async () => {
    const response = await action({
      request: mcpRequest(
        { id: 1, jsonrpc: "2.0", method: "tools/list", params: {} },
        "invalid",
      ),
    } as never)

    expect(response.status).toBe(401)
    expect(response.headers.get("WWW-Authenticate")).toContain(
      "/.well-known/oauth-protected-resource/mcp",
    )
  })

  it("creates Memories once when an identical tool call is retried", async () => {
    const body = {
      id: "stable-request",
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: {
          items: [{ answer: "4", challenge: "2 + 2", kind: "basic" }],
        },
        name: "create_memories",
      },
    }

    const first = await action({ request: mcpRequest(body) } as never)
    const second = await action({ request: mcpRequest(body) } as never)

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(await second.text()).toBe(await first.text())
    const latest = await corpusSnapshotStore.latest(userId, corpusId)
    expect(JSON.parse(latest?.canonicalJson ?? "null").prompts).toHaveLength(1)
  })
})
