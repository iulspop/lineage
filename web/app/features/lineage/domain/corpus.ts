import { z } from "zod"

export const responseInteractionSchema = z.union([
  z.literal("text"),
  z.object({
    capture: z.literal("none"),
    mode: z.literal("self-check"),
  }),
])

const clozeTargetSchema = z.object({
  answer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  id: z.string().min(1),
})

const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})

const occlusionRegionSchema = z.object({
  accessibleDescription: z.string().min(1),
  geometry: z.union([
    z.object({
      height: z.number().min(0).max(1),
      type: z.literal("rectangle"),
      width: z.number().min(0).max(1),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    }),
    z.object({
      points: z.array(normalizedPointSchema).min(3),
      type: z.literal("polygon"),
    }),
  ]),
  id: z.string().min(1),
  label: z.string().min(1),
})

export const assetSchema = z.object({
  byteSize: z.int().nonnegative(),
  id: z.string().min(1),
  mediaType: z.string().min(1),
  path: z.string().regex(/^assets\/[A-Za-z0-9._/-]+$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
})

export const reviewContractSchema = z.object({
  challenge: z.array(z.string()),
  clozeTargets: z.array(clozeTargetSchema).min(1).optional(),
  id: z.string().min(1),
  kind: z
    .enum(["basic", "cloze", "image-occlusion"])
    .optional()
    .default("basic"),
  occlusionRegions: z.array(occlusionRegionSchema).min(1).optional(),
  resolution: z.array(z.string()),
  response: responseInteractionSchema,
  revision: z.int().positive(),
  sourceAsset: z.string().min(1).optional(),
  withheld: z.array(z.string()).min(1),
})

export const corpusDocumentSchema = z.object({
  assets: z.array(assetSchema).optional().default([]),
  corpusId: z.string().min(1),
  format: z.literal("lineage.corpus"),
  formatVersion: z.literal(1),
  prompts: z.array(reviewContractSchema),
})

export type ReviewContract = z.input<typeof reviewContractSchema>
export type CorpusDocument = z.output<typeof corpusDocumentSchema>
export type LineageDiagnostic = {
  code: string
  message: string
  path: string
  relatedPath?: string
  severity: "error" | "warning" | "information"
}
export type CorpusValidationResult =
  | { diagnostics: []; document: CorpusDocument; valid: true }
  | { diagnostics: LineageDiagnostic[]; valid: false }

export function capturesResponse(contract: ReviewContract) {
  return contract.response === "text"
}

export function responseDescriptor(contract: ReviewContract) {
  return capturesResponse(contract) ? "text" : "self-check:none"
}

export function parseCorpusDocument(input: unknown): CorpusDocument {
  return corpusDocumentSchema.parse(input)
}

export function serializeCorpusDocument(document: CorpusDocument): string {
  return JSON.stringify(document)
}

export function structuralDiagnostics(error: z.ZodError): LineageDiagnostic[] {
  return error.issues.map((issue) => {
    const finalSegment = issue.path.at(-1)
    return {
      code:
        finalSegment === "formatVersion"
          ? "format.unsupported-version"
          : finalSegment === "revision" && issue.code === "too_small"
            ? "revision.non-positive"
            : "structure.invalid",
      message: issue.message,
      path: `/${issue.path.map(escapePointerSegment).join("/")}`,
      severity: "error",
    }
  })
}

function escapePointerSegment(segment: PropertyKey) {
  return String(segment).replaceAll("~", "~0").replaceAll("/", "~1")
}
