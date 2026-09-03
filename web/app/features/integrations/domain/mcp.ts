import { z } from "zod"

import { createMemoriesRequestSchema } from "./memory-api"

export const MCP_CREATE_MEMORIES_TOOL = "create_memories"

export const mcpCreateMemoriesInputSchema = createMemoriesRequestSchema

export const mcpCreateMemoriesResultSchema = z
  .object({
    createdMemoryCount: z.number().int().nonnegative(),
    itemCount: z.number().int().min(1).max(100),
    status: z.literal("created"),
  })
  .strict()

export type McpCreateMemoriesResult = z.infer<
  typeof mcpCreateMemoriesResultSchema
>

export type McpCreateMemoriesErrorCode =
  | "request_in_progress"
  | "validation_failed"
  | "workspace_unavailable"
  | "write_conflict"

const MCP_CREATE_MEMORIES_ERROR_MESSAGES: Record<
  McpCreateMemoriesErrorCode,
  string
> = {
  request_in_progress:
    "An identical request is already being processed. Retry shortly.",
  validation_failed: "The submitted Memories did not pass Lineage validation.",
  workspace_unavailable: "No active Lineage workspace is available.",
  write_conflict:
    "The active workspace changed during creation. Retry the request.",
}

export class McpCreateMemoriesError extends Error {
  readonly code: McpCreateMemoriesErrorCode

  constructor(code: McpCreateMemoriesErrorCode) {
    super(MCP_CREATE_MEMORIES_ERROR_MESSAGES[code])
    this.name = "McpCreateMemoriesError"
    this.code = code
  }
}

export const MCP_CREATE_MEMORIES_DESCRIPTION = `Create 1–100 Memories in the connected user's active Lineage workspace.

Each basic item must contain exactly one retrieval target: one challenge with one answer. Split multi-fact questions into separate basic items. Each {{target}} in a cloze item becomes its own independently scheduled Memory, so use multiple targets only when each deletion is meaningful on its own.

This write-only tool returns counts only. It does not expose corpus contents, answers, review history, scheduling state, sources, assets, or durable identifiers.`
