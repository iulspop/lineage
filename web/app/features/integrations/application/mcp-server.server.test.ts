import { InMemoryTransport } from "@modelcontextprotocol/server"
import { describe, expect, it, vi } from "vitest"

import { McpCreateMemoriesError } from "../domain/mcp"
import { createMcpMemoryServer } from "./mcp-server.server"

const protocolVersion = "2026-07-28"

async function connectServer(
  createMemories: Parameters<typeof createMcpMemoryServer>[0]["createMemories"],
) {
  const server = createMcpMemoryServer({ createMemories })
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair()
  const messages: unknown[] = []
  clientTransport.onmessage = (message) => messages.push(message)
  await Promise.all([server.connect(serverTransport), clientTransport.start()])

  async function request(message: Record<string, unknown>) {
    const responseCount = messages.length
    await clientTransport.send(message as never)
    await vi.waitFor(() => {
      if (messages.length <= responseCount)
        throw new Error("No MCP response yet")
    })
    return messages.at(-1) as Record<string, unknown>
  }

  await request({
    id: 1,
    jsonrpc: "2.0",
    method: "initialize",
    params: {
      capabilities: {},
      clientInfo: { name: "test-client", version: "1.0.0" },
      protocolVersion,
    },
  })
  await clientTransport.send({
    jsonrpc: "2.0",
    method: "notifications/initialized",
  } as never)

  return { clientTransport, request, server }
}

describe("createMcpMemoryServer", () => {
  it("advertises only the write-only create_memories tool", async () => {
    const connected = await connectServer(vi.fn())

    const response = await connected.request({
      id: 2,
      jsonrpc: "2.0",
      method: "tools/list",
      params: {},
    })

    expect(response).toMatchObject({
      id: 2,
      jsonrpc: "2.0",
      result: {
        tools: [
          {
            name: "create_memories",
            title: "Create Memories",
          },
        ],
      },
    })

    await connected.server.close()
  })

  it("creates Memories and returns only privacy-safe counts", async () => {
    const createMemories = vi.fn().mockResolvedValue({
      createdMemoryCount: 3,
      itemCount: 2,
      status: "created",
    })
    const connected = await connectServer(createMemories)
    const input = {
      items: [
        { answer: "4", challenge: "2 + 2", kind: "basic" },
        { kind: "cloze", text: "The {{first}} and {{second}} targets." },
      ],
    }

    const response = await connected.request({
      id: 3,
      jsonrpc: "2.0",
      method: "tools/call",
      params: { arguments: input, name: "create_memories" },
    })

    expect(createMemories).toHaveBeenCalledWith(
      {
        items: [
          {
            answer: "4",
            challenge: "2 + 2",
            kind: "basic",
            responseMode: "self-check",
          },
          {
            kind: "cloze",
            responseMode: "self-check",
            text: "The {{first}} and {{second}} targets.",
          },
        ],
      },
      3,
    )
    expect(response).toEqual({
      id: 3,
      jsonrpc: "2.0",
      result: {
        content: [
          {
            text: "Created 3 Memories from 2 items.",
            type: "text",
          },
        ],
        structuredContent: {
          createdMemoryCount: 3,
          itemCount: 2,
          status: "created",
        },
      },
    })
    expect(JSON.stringify(response)).not.toContain("answer")
    expect(JSON.stringify(response)).not.toContain("first")

    await connected.server.close()
  })

  it("returns stable privacy-safe tool errors", async () => {
    const connected = await connectServer(
      vi
        .fn()
        .mockRejectedValue(new McpCreateMemoriesError("validation_failed")),
    )

    const response = await connected.request({
      id: 4,
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: {
          items: [{ answer: "secret", challenge: "unsafe", kind: "basic" }],
        },
        name: "create_memories",
      },
    })

    expect(response).toEqual({
      id: 4,
      jsonrpc: "2.0",
      result: {
        content: [
          {
            text: "validation_failed: The submitted Memories did not pass Lineage validation.",
            type: "text",
          },
        ],
        isError: true,
      },
    })
    expect(JSON.stringify(response)).not.toContain("secret")
    expect(JSON.stringify(response)).not.toContain("unsafe")

    await connected.server.close()
  })
})
