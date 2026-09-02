import { serializeCorpusDocument } from "@lineage/core/corpus"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { action } from "./api.v1.memories"
import { hashCredential } from "~/features/integrations/infrastructure/oauth-crypto.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { prisma } from "~/utils/db.server"

let userId: string
let clientDatabaseId: string
const corpusId = "memory-api-route-test"
const accessToken = "test-access-token"

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      activeLineageCorpusId: corpusId,
      email: `route-${crypto.randomUUID()}@example.com`,
    },
  })
  userId = user.id
  const client = await prisma.integrationClient.create({
    data: {
      clientId: `route-client-${crypto.randomUUID()}`,
      clientType: "public",
      name: "Route client",
    },
  })
  clientDatabaseId = client.id
  const grant = await prisma.integrationGrant.create({
    data: { clientId: client.id, scope: "memories:write", userId },
  })
  await prisma.integrationAccessToken.create({
    data: {
      clientId: client.id,
      expiresAt: new Date(Date.now() + 60_000),
      grantId: grant.id,
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
    digest: "route-base",
    formatVersion: 1,
  })
})

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: userId } })
  await prisma.integrationClient.deleteMany({ where: { id: clientDatabaseId } })
})

function request(body: string, key = "stable-key") {
  return new Request("http://localhost/api/v1/memories", {
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Idempotency-Key": key,
    },
    method: "POST",
  })
}

describe("POST /api/v1/memories", () => {
  it("creates an atomic batch and replays the stored response", async () => {
    const body = JSON.stringify({
      items: [{ answer: "4", challenge: "2 + 2", kind: "basic" }],
    })
    const first = await action({ request: request(body) } as never)
    const second = await action({ request: request(body) } as never)

    expect(first.status).toBe(201)
    expect(second.status).toBe(201)
    expect(await second.text()).toBe(await first.text())
    const latest = await corpusSnapshotStore.latest(userId, corpusId)
    expect(JSON.parse(latest?.canonicalJson ?? "null").prompts).toHaveLength(1)
  })

  it("rejects reuse of an idempotency key with a different body", async () => {
    const first = await action({
      request: request(
        JSON.stringify({
          items: [{ answer: "A", challenge: "Q", kind: "basic" }],
        }),
      ),
    } as never)
    const conflict = await action({
      request: request(
        JSON.stringify({
          items: [{ answer: "B", challenge: "Q", kind: "basic" }],
        }),
      ),
    } as never)

    expect(first.status).toBe(201)
    expect(conflict.status).toBe(409)
    await expect(conflict.json()).resolves.toEqual(
      expect.objectContaining({
        error: expect.objectContaining({ code: "idempotency_conflict" }),
      }),
    )
  })
})
