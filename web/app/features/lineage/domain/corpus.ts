import { z } from "zod"

const id = z.string().min(1)
const revision = z.int().positive()
const timestamp = z.string().datetime({ offset: true })
const sha256 = z.string().regex(/^[a-f0-9]{64}$/)
const safeArchivePath = z
  .string()
  .min(1)
  .regex(/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]+$/)

export const responseInteractionSchema = z.union([
  z.literal("text"),
  z.object({ capture: z.literal("none"), mode: z.literal("self-check") }),
])

const entityReferenceSchema = z.object({ id, revision: revision.optional() })
const clozeTargetSchema = z.object({
  answer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  id,
})
const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
})
const occlusionRegionSchema = z.object({
  accessibleDescription: z.string().min(1),
  geometry: z.union([
    z.object({
      height: z.number().positive().max(1),
      type: z.literal("rectangle"),
      width: z.number().positive().max(1),
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
    }),
    z.object({
      points: z.array(normalizedPointSchema).min(3),
      type: z.literal("polygon"),
    }),
  ]),
  id,
  label: z.string().min(1),
})

export const assetSchema = z.object({
  accessibleDescription: z.string().min(1).optional(),
  byteSize: z.int().nonnegative(),
  id,
  mediaType: z.string().min(1),
  path: safeArchivePath.regex(/^assets\//),
  sha256,
})

const sourceSchema = z.object({
  assets: z.array(id).optional().default([]),
  content: z.string(),
  id,
  provenance: z.array(id).optional().default([]),
  revision,
  title: z.string().min(1),
})
const materialSchema = z.object({
  assets: z.array(id).optional().default([]),
  content: z.array(z.string()),
  id,
  provenance: z.array(id).optional().default([]),
  revision,
  sources: z.array(id).optional().default([]),
})

export const reviewContractSchema = z.object({
  assets: z.array(id).optional().default([]),
  challenge: z.array(z.string()),
  clozeTargets: z.array(clozeTargetSchema).min(1).optional(),
  extensions: z
    .object({
      optional: z.array(id).optional().default([]),
      required: z.array(id).optional().default([]),
    })
    .optional()
    .default({ optional: [], required: [] }),
  id,
  kind: z
    .enum(["basic", "cloze", "image-occlusion"])
    .optional()
    .default("basic"),
  materials: z.array(id).optional().default([]),
  occlusionRegions: z.array(occlusionRegionSchema).min(1).optional(),
  presentationProfile: z.string().min(1).optional().default("lineage.review/1"),
  provenance: z.array(id).optional().default([]),
  resolution: z.array(z.string()),
  response: responseInteractionSchema,
  revision,
  sourceAsset: id.optional(),
  sources: z.array(id).optional().default([]),
  status: z
    .enum(["active", "suspended", "retired"])
    .optional()
    .default("active"),
  withheld: z.array(z.string()).min(1),
})

const relationshipSchema = z.object({
  id,
  kind: z.enum([
    "prerequisite",
    "related",
    "derived-from",
    "sibling",
    "duplicate-of",
  ]),
  source: entityReferenceSchema,
  target: entityReferenceSchema,
})
const provenanceSchema = z.object({
  agent: z.string().optional(),
  citation: z.string().optional(),
  id,
  kind: z.enum(["authored", "imported", "cited", "derived", "corrected"]),
  license: z.string().optional(),
  note: z.string().optional(),
  recordedAt: timestamp,
  sources: z.array(id).optional().default([]),
})
const extensionSchema = z.object({
  fallback: z.string().min(1).optional(),
  id,
  requirement: z.enum(["required", "optional"]),
  version: z.string().min(1),
})
const migrationSchema = z.object({
  appliedAt: timestamp,
  fromVersion: z.int().nonnegative(),
  id,
  tool: z.string().min(1),
  toolVersion: z.string().min(1),
  toVersion: z.int().positive(),
})
const repetitionSchema = z.object({
  assessment: z.enum(["again", "hard", "good", "easy"]),
  capturedResponse: z.string().optional(),
  durationMilliseconds: z.int().nonnegative().optional(),
  id,
  presentationDigest: sha256.optional(),
  promptId: id,
  promptRevision: revision,
  provenance: z.array(id).optional().default([]),
  reviewedAt: timestamp,
  scheduler: z
    .object({
      dueAt: timestamp.optional(),
      family: z.string().min(1),
      nextIntervalMinutes: z.int().nonnegative().optional(),
      parameterDigest: sha256.optional(),
      previousIntervalMinutes: z.int().nonnegative().optional(),
      version: z.string().min(1),
    })
    .optional(),
  snapshotDigest: sha256.optional(),
})
const correctionSchema = z.object({
  correctedAt: timestamp,
  id,
  provenance: z.array(id).optional().default([]),
  reason: z.string().min(1),
  replacementAssessment: z.enum(["again", "hard", "good", "easy"]).optional(),
  replacementResponse: z.string().optional(),
  targetRepetitionId: id,
})
const interoperabilitySchema = z.object({
  id,
  losses: z.array(z.string()).optional().default([]),
  preservedArtifacts: z.array(id).optional().default([]),
  sourceFormat: z.string().min(1),
  status: z.enum(["exact", "lossy"]),
  targetFormat: z.string().min(1),
})

export const corpusDocumentSchema = z.object({
  assets: z.array(assetSchema).optional().default([]),
  corpusId: id,
  extensions: z.array(extensionSchema).optional().default([]),
  format: z.literal("lineage.corpus"),
  formatVersion: z.literal(1),
  interoperability: z.array(interoperabilitySchema).optional().default([]),
  materials: z.array(materialSchema).optional().default([]),
  migrations: z.array(migrationSchema).optional().default([]),
  prompts: z.array(reviewContractSchema),
  provenance: z.array(provenanceSchema).optional().default([]),
  relationships: z.array(relationshipSchema).optional().default([]),
  repetitionCorrections: z.array(correctionSchema).optional().default([]),
  repetitions: z.array(repetitionSchema).optional().default([]),
  sources: z.array(sourceSchema).optional().default([]),
})

export const archiveEntrySchema = z.object({
  byteSize: z.int().nonnegative(),
  mediaType: z.string().min(1),
  path: safeArchivePath,
  required: z.boolean().optional().default(true),
  sha256,
})
export const lineageManifestSchema = z.object({
  corpus: safeArchivePath,
  corpusId: id,
  corpusSha256: sha256,
  createdAt: timestamp,
  entries: z.array(archiveEntrySchema).min(1),
  extensions: z
    .object({
      optional: z.array(id).optional().default([]),
      required: z.array(id).optional().default([]),
    })
    .optional()
    .default({ optional: [], required: [] }),
  format: z.literal("lineage.manifest"),
  formatVersion: z.literal(1),
  modifiedAt: timestamp,
  presentationProfiles: z.array(z.string().min(1)).optional().default([]),
})

export type ReviewContract = z.input<typeof reviewContractSchema>
export type CorpusDocument = z.output<typeof corpusDocumentSchema>
export type LineageManifest = z.output<typeof lineageManifestSchema>
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
  return canonicalStringify(document)
}
export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortJson(value))
}
function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson)
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJson(child)]),
    )
  return value
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
            : finalSegment === "sha256"
              ? "asset.integrity-host-required"
              : finalSegment === "path"
                ? "asset.path-unsafe"
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
