import { serializeCorpusDocument } from "@lineage/core/corpus"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import {
  createIntegrationMemories,
  IntegrationMemoryConflictError,
} from "./create-memories.server"
import { corpusSnapshotStore } from "~/features/lineage/infrastructure/corpus-model.server"
import { lineageRuntime } from "~/features/lineage/infrastructure/lineage-runtime.server"
import { prisma } from "~/utils/db.server"

let userId: string
let clientDatabaseId: string
let grantId: string
const corpusId = "integration-memory-test"

beforeEach(async () => {
  const user = await prisma.user.create({
    data: {
      activeLineageCorpusId: corpusId,
      email: `memory-api-${crypto.randomUUID()}@example.com`,
    },
  })
  userId = user.id
  const client = await prisma.integrationClient.create({
    data: {
      clientId: `client-${crypto.randomUUID()}`,
      clientType: "public",
      name: "Test client",
    },
  })
  clientDatabaseId = client.id
  const grant = await prisma.integrationGrant.create({
    data: { clientId: client.id, scope: "memories:write", userId },
  })
  grantId = grant.id
  const validation = lineageRuntime.validateCorpus?.({
    corpusId,
    format: "lineage.corpus",
    formatVersion: 1,
    prompts: [],
  })
  if (!validation?.valid) throw new Error("Invalid test corpus")
  const canonicalJson = serializeCorpusDocument(validation.document)
  await corpusSnapshotStore.append(userId, {
    canonicalJson,
    corpusId,
    digest: "base-digest",
    formatVersion: 1,
  })
})

afterEach(async () => {
  await prisma.user.deleteMany({ where: { id: userId } })
  await prisma.integrationClient.deleteMany({ where: { id: clientDatabaseId } })
})

describe("createIntegrationMemories", () => {
  it("atomically creates basic and one Prompt per cloze target with provenance", async () => {
    const result = await createIntegrationMemories({
      clientDatabaseId,
      clientId: "external-app",
      grantId,
      request: {
        items: [
          {
            answer: "4",
            challenge: "2 + 2",
            kind: "basic",
            responseMode: "self-check",
          },
          { kind: "cloze", responseMode: "text", text: "{{a}} + {{b}}" },
        ],
      },
      requestId: crypto.randomUUID(),
      userId,
    })

    expect(result.created).toHaveLength(3)
    const snapshot = await corpusSnapshotStore.latest(userId, corpusId)
    const document = JSON.parse(snapshot?.canonicalJson ?? "null")
    expect(document.prompts).toHaveLength(3)
    expect(document.provenance).toEqual([
      expect.objectContaining({
        agent: "integration:external-app",
        kind: "authored",
      }),
    ])
    expect(
      document.prompts.every(
        (prompt: { provenance: string[] }) => prompt.provenance.length === 1,
      ),
    ).toBe(true)
    await expect(
      prisma.integrationCreationAudit.findUnique({
        where: { requestId: result.requestId },
      }),
    ).resolves.toEqual(
      expect.objectContaining({ createdPromptCount: 3, outcome: "created" }),
    )
  })

  it("returns a conflict after bounded stale-base retries", async () => {
    await expect(
      createIntegrationMemories({
        clientDatabaseId,
        clientId: "external-app",
        dependencies: {
          resolveActive: async () => ({
            corpusId,
            snapshot: (await corpusSnapshotStore.latest(userId, corpusId))!,
            status: "ready",
          }),
          snapshotStore: {
            ...corpusSnapshotStore,
            compareAndAppend: async () => ({
              reason: "snapshot-changed",
              status: "conflict",
            }),
          },
          validator: lineageRuntime,
        },
        grantId,
        request: {
          items: [
            {
              answer: "A",
              challenge: "Q",
              kind: "basic",
              responseMode: "self-check",
            },
          ],
        },
        requestId: crypto.randomUUID(),
        userId,
      }),
    ).rejects.toBeInstanceOf(IntegrationMemoryConflictError)
  })
})
