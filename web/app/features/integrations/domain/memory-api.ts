import { z } from "zod"

const MAX_MEMORY_TEXT_LENGTH = 10_000
const MAX_HINT_LENGTH = 1000

const responseModeSchema = z.enum(["self-check", "text"])
const memoryTextSchema = z.string().trim().min(1).max(MAX_MEMORY_TEXT_LENGTH)

export const basicMemoryItemSchema = z
  .object({
    answer: memoryTextSchema,
    challenge: memoryTextSchema,
    hint: z.string().trim().min(1).max(MAX_HINT_LENGTH).optional(),
    kind: z.literal("basic"),
    responseMode: responseModeSchema.optional().default("self-check"),
  })
  .strict()

export const clozeMemoryItemSchema = z
  .object({
    kind: z.literal("cloze"),
    responseMode: responseModeSchema.optional().default("self-check"),
    text: memoryTextSchema,
  })
  .strict()
  .superRefine((item, context) => {
    const parsed = parseClozeText(item.text)
    if (!parsed.valid)
      context.addIssue({
        code: "custom",
        message: parsed.message,
        path: ["text"],
      })
  })

export const memoryApiItemSchema = z.discriminatedUnion("kind", [
  basicMemoryItemSchema,
  clozeMemoryItemSchema,
])

export const createMemoriesRequestSchema = z
  .object({ items: z.array(memoryApiItemSchema).min(1).max(100) })
  .strict()

export type BasicMemoryItem = z.infer<typeof basicMemoryItemSchema>
export type ClozeMemoryItem = z.infer<typeof clozeMemoryItemSchema>
export type CreateMemoriesRequest = z.infer<typeof createMemoriesRequestSchema>
export type MemoryApiItem = z.infer<typeof memoryApiItemSchema>

export type ParsedClozeTarget = {
  answer: string
  challenge: string
  targetIndex: number
}

export function parseClozeText(
  text: string,
):
  | { targets: ParsedClozeTarget[]; valid: true }
  | { message: string; valid: false } {
  const matches = [...text.matchAll(/\{\{([^{}]+)\}\}/g)]
  if (matches.length === 0)
    return {
      message: "Cloze text must contain at least one non-empty {{target}}.",
      valid: false,
    }
  const residue = text.replace(/\{\{[^{}]+\}\}/g, "")
  if (/[{}]/.test(residue))
    return { message: "Cloze braces are malformed or nested.", valid: false }

  const targets = matches.map((match, targetIndex) => {
    const answer = match[1]?.trim() ?? ""
    const offset = match.index ?? 0
    const before = text.slice(0, offset).replace(/\{\{([^{}]+)\}\}/g, "$1")
    const after = text
      .slice(offset + match[0].length)
      .replace(/\{\{([^{}]+)\}\}/g, "$1")
    return { answer, challenge: `${before}[…]${after}`, targetIndex }
  })
  if (targets.some(({ answer }) => !answer))
    return { message: "Cloze targets cannot be empty.", valid: false }
  return { targets, valid: true }
}

export function countCreatedPrompts(request: CreateMemoriesRequest) {
  return request.items.reduce((count, item) => {
    if (item.kind === "basic") return count + 1
    const parsed = parseClozeText(item.text)
    return count + (parsed.valid ? parsed.targets.length : 0)
  }, 0)
}
