import { z } from "zod"

export const reviewContractSchema = z.object({
  challenge: z.array(z.string()),
  id: z.string().min(1),
  resolution: z.array(z.string()),
  response: z.string().min(1),
  revision: z.int().positive(),
  withheld: z.array(z.string()).min(1),
})

export const corpusDocumentSchema = z.object({
  corpusId: z.string().min(1),
  format: z.literal("lineage.corpus"),
  formatVersion: z.literal(1),
  prompts: z.array(reviewContractSchema),
})

export type ReviewContract = z.infer<typeof reviewContractSchema>
export type CorpusDocument = z.infer<typeof corpusDocumentSchema>

export function parseCorpusDocument(input: unknown): CorpusDocument {
  return corpusDocumentSchema.parse(input)
}

export function serializeCorpusDocument(document: CorpusDocument): string {
  return JSON.stringify(document)
}
