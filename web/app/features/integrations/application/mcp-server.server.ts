import { McpServer } from "@modelcontextprotocol/server"

import type { McpCreateMemoriesResult } from "../domain/mcp"
import {
  MCP_CREATE_MEMORIES_DESCRIPTION,
  MCP_CREATE_MEMORIES_TOOL,
  McpCreateMemoriesError,
  mcpCreateMemoriesInputSchema,
  mcpCreateMemoriesResultSchema,
} from "../domain/mcp"
import type { CreateMemoriesRequest } from "../domain/memory-api"

export type ExecuteMcpCreateMemories = (
  request: CreateMemoriesRequest,
  mcpRequestId: number | string,
) => Promise<McpCreateMemoriesResult>

export function createMcpMemoryServer({
  createMemories,
}: {
  createMemories: ExecuteMcpCreateMemories
}) {
  const server = new McpServer(
    { name: "lineage", version: "1.0.0" },
    { capabilities: { tools: {} } },
  )

  server.registerTool(
    MCP_CREATE_MEMORIES_TOOL,
    {
      description: MCP_CREATE_MEMORIES_DESCRIPTION,
      inputSchema: mcpCreateMemoriesInputSchema,
      outputSchema: mcpCreateMemoriesResultSchema,
      title: "Create Memories",
    },
    async (request, context) => {
      try {
        const result = await createMemories(request, context.mcpReq.id)
        return {
          content: [
            {
              text: `Created ${result.createdMemoryCount} Memories from ${result.itemCount} items.`,
              type: "text" as const,
            },
          ],
          structuredContent: result,
        }
      } catch (error) {
        const safeError =
          error instanceof McpCreateMemoriesError
            ? error
            : new McpCreateMemoriesError("write_conflict")
        return {
          content: [
            {
              text: `${safeError.code}: ${safeError.message}`,
              type: "text" as const,
            },
          ],
          isError: true,
        }
      }
    },
  )

  return server
}
