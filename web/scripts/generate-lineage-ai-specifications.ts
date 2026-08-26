import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import lineageCore from "../app/features/lineage/generated/lineage-core.mjs"

type FormatDescription = {
  diagnosticCodes: string[]
  examples: string[]
  formatName: string
  promptKinds: string[]
  responseModes: string[]
  version: number
}

type GeneratedFile = { content: string; relativePath: string }

const outputDirectory = path.resolve(
  process.argv[2] ?? "../generated/lineage-ai",
)
const description = JSON.parse(
  lineageCore.formatDescriptionJson,
) as FormatDescription

const responseSchema = {
  oneOf: [
    { const: "text" },
    {
      additionalProperties: false,
      properties: {
        capture: { const: "none" },
        mode: { const: "self-check" },
      },
      required: ["mode", "capture"],
      type: "object",
    },
  ],
}

const clozeTargetSchema = {
  additionalProperties: false,
  properties: {
    answer: { minLength: 1, type: "string" },
    hints: { items: { type: "string" }, type: "array" },
    id: { minLength: 1, type: "string" },
  },
  required: ["id", "answer"],
  type: "object",
}

const regionSchema = {
  additionalProperties: false,
  properties: {
    accessibleDescription: { minLength: 1, type: "string" },
    geometry: {
      oneOf: [
        {
          additionalProperties: false,
          properties: {
            height: { maximum: 1, minimum: 0, type: "number" },
            type: { const: "rectangle" },
            width: { maximum: 1, minimum: 0, type: "number" },
            x: { maximum: 1, minimum: 0, type: "number" },
            y: { maximum: 1, minimum: 0, type: "number" },
          },
          required: ["type", "x", "y", "width", "height"],
          type: "object",
        },
        {
          additionalProperties: false,
          properties: {
            points: {
              items: {
                additionalProperties: false,
                properties: {
                  x: { maximum: 1, minimum: 0, type: "number" },
                  y: { maximum: 1, minimum: 0, type: "number" },
                },
                required: ["x", "y"],
                type: "object",
              },
              minItems: 3,
              type: "array",
            },
            type: { const: "polygon" },
          },
          required: ["type", "points"],
          type: "object",
        },
      ],
    },
    id: { minLength: 1, type: "string" },
    label: { minLength: 1, type: "string" },
  },
  required: ["id", "label", "geometry", "accessibleDescription"],
  type: "object",
}

const assetSchema = {
  additionalProperties: false,
  properties: {
    byteSize: { minimum: 0, type: "integer" },
    id: { minLength: 1, type: "string" },
    mediaType: { minLength: 1, type: "string" },
    path: {
      minLength: 1,
      pattern: "^assets/[A-Za-z0-9._/-]+$",
      type: "string",
    },
    sha256: { pattern: "^[a-f0-9]{64}$", type: "string" },
  },
  required: ["id", "mediaType", "byteSize", "sha256", "path"],
  type: "object",
}

const promptSchema = {
  additionalProperties: false,
  properties: {
    challenge: { items: { type: "string" }, type: "array" },
    clozeTargets: { items: clozeTargetSchema, minItems: 1, type: "array" },
    id: { minLength: 1, type: "string" },
    kind: { enum: description.promptKinds },
    occlusionRegions: { items: regionSchema, minItems: 1, type: "array" },
    resolution: { items: { type: "string" }, type: "array" },
    response: responseSchema,
    revision: { minimum: 1, type: "integer" },
    sourceAsset: { minLength: 1, type: "string" },
    withheld: { items: { type: "string" }, minItems: 1, type: "array" },
  },
  required: [
    "id",
    "revision",
    "kind",
    "challenge",
    "withheld",
    "resolution",
    "response",
  ],
  type: "object",
}

const corpusSchema = {
  $id: "https://lineage.local/schema/lineage-corpus-v1.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    assets: { items: assetSchema, type: "array" },
    corpusId: { minLength: 1, type: "string" },
    format: { const: description.formatName },
    formatVersion: { const: description.version },
    prompts: { items: promptSchema, type: "array" },
  },
  required: ["format", "formatVersion", "corpusId", "prompts"],
  title: "Lineage corpus version 1",
  type: "object",
}

const candidateSchema = {
  $id: "https://lineage.local/schema/lineage-ai-candidate-v1.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  additionalProperties: false,
  properties: {
    candidate: corpusSchema,
    mediaRequests: {
      items: {
        additionalProperties: false,
        properties: {
          assetId: { minLength: 1, type: "string" },
          description: { minLength: 1, type: "string" },
          mediaType: { minLength: 1, type: "string" },
        },
        required: ["assetId", "description", "mediaType"],
        type: "object",
      },
      type: "array",
    },
  },
  required: ["candidate", "mediaRequests"],
  title: "Untrusted Lineage AI candidate version 1",
  type: "object",
}

const basic = {
  corpusId: "example-basic",
  format: description.formatName,
  formatVersion: description.version,
  prompts: [
    {
      challenge: ["What is the capital of France?"],
      id: "capital-of-france",
      kind: "basic",
      resolution: ["What is the capital of France?", "Paris"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["Paris"],
    },
  ],
}
const cloze = {
  corpusId: "example-cloze",
  format: description.formatName,
  formatVersion: description.version,
  prompts: [
    {
      challenge: ["The capital of France is […]."],
      clozeTargets: [
        { answer: "Paris", hints: ["European capital"], id: "france-capital" },
      ],
      id: "france-capital-cloze",
      kind: "cloze",
      resolution: ["The capital of France is Paris.", "Paris"],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      withheld: ["Paris"],
    },
  ],
}
const imageOcclusion = {
  assets: [
    {
      byteSize: 1234,
      id: "heart-diagram",
      mediaType: "image/png",
      path: "assets/heart-diagram.png",
      sha256: "HOST_COMPUTED_SHA256_REQUIRED".padEnd(64, "0").slice(0, 64),
    },
  ],
  corpusId: "example-image-occlusion",
  format: description.formatName,
  formatVersion: description.version,
  prompts: [
    {
      challenge: ["Name the covered chamber."],
      id: "heart-left-ventricle",
      kind: "image-occlusion",
      occlusionRegions: [
        {
          accessibleDescription:
            "Lower-right chamber in the displayed anatomical orientation.",
          geometry: {
            height: 0.24,
            type: "rectangle",
            width: 0.2,
            x: 0.58,
            y: 0.56,
          },
          id: "left-ventricle-region",
          label: "Left ventricle",
        },
      ],
      resolution: [
        "The covered chamber is the left ventricle.",
        "Left ventricle",
      ],
      response: { capture: "none", mode: "self-check" },
      revision: 1,
      sourceAsset: "heart-diagram",
      withheld: ["Left ventricle"],
    },
  ],
}
const media = {
  assets: [
    {
      byteSize: 4321,
      id: "bird-call",
      mediaType: "audio/ogg",
      path: "assets/bird-call.ogg",
      sha256: "HOST_COMPUTED_SHA256_REQUIRED".padEnd(64, "0").slice(0, 64),
    },
  ],
  corpusId: "example-media",
  format: description.formatName,
  formatVersion: description.version,
  prompts: [
    {
      challenge: ["Listen to asset bird-call. Which bird is calling?"],
      id: "identify-bird-call",
      kind: "basic",
      resolution: ["The recording is a common loon call."],
      response: "text",
      revision: 1,
      sourceAsset: "bird-call",
      withheld: ["common loon"],
    },
  ],
}

const rules = [
  [
    "disclosure.answer-leaked",
    "Challenge content must not contain withheld material.",
  ],
  [
    "disclosure.answer-missing",
    "Resolution content must contain every withheld item.",
  ],
  ["revision.non-positive", "Prompt revisions begin at one."],
  [
    "identity.duplicate-prompt-revision",
    "Prompt identity and revision pairs are unique.",
  ],
  [
    "cloze.targets-required",
    "Cloze prompts require stable target definitions.",
  ],
  [
    "occlusion.source-required",
    "Image occlusion requires a declared source asset.",
  ],
  [
    "asset.integrity-host-required",
    "Only the host computes byte sizes and SHA-256 digests.",
  ],
] as const

const brief = `# Lineage corpus v${description.version}: AI brief

Generate JSON matching \`${description.formatName}\` version ${description.version}.

- Preserve stable Prompt IDs and use positive immutable revisions.
- Keep every withheld answer out of \`challenge\` and include it in \`resolution\`.
- Use \`response: { "mode": "self-check", "capture": "none" }\` when the learner recalls, reveals, then self-assesses.
- Prompt kinds: ${description.promptKinds.join(", ")}.
- Never invent media bytes, byte sizes, SHA-256 digests, or claim an asset exists. Return media requests to the host instead.
- Output only a candidate. A human must preview and explicitly accept it before persistence.
`

const authoring = `# Lineage corpus v${description.version}: AI authoring guide

${brief}
## Repair contract

Treat diagnostics as authoritative. Repair only the paths named by diagnostics, preserve unrelated identities and revisions, and stop after the host's bounded attempt limit.

## Stable diagnostic codes

${description.diagnosticCodes.map((code) => `- \`${code}\``).join("\n")}

## Semantic rules

${rules.map(([code, text]) => `- **${code}**: ${text}`).join("\n")}
`

const full = `# Lineage corpus v${description.version}: full generated specification

${authoring}
## Canonical document

A document has \`format\`, \`formatVersion\`, \`corpusId\`, \`prompts\`, and optional \`assets\`. Unknown fields are rejected by the generated schema.

## Prompt

Every Prompt has stable \`id\`, positive \`revision\`, \`kind\`, \`challenge\`, non-empty \`withheld\`, \`resolution\`, and \`response\`. Cloze prompts add \`clozeTargets\`. Image occlusion adds \`sourceAsset\` and \`occlusionRegions\` with normalized geometry.

## Canonicalization and persistence

The host structurally decodes the candidate, runs semantic validation, previews it to a human, and only after explicit acceptance serializes canonical JSON, computes its digest, and appends an immutable owner-scoped snapshot.

## Media boundary

AI output may request media but cannot establish asset integrity. The host obtains bytes, computes byte size and SHA-256, inserts the verified declaration, validates dependency closure, and only then persists or exports a \`.lineage\` archive.
`

const types = `// Generated from Lineage.Specification.CorpusWireV1. Do not edit.
export type LineageResponse = "text" | { mode: "self-check"; capture: "none" }
export type LineagePromptKind = "basic" | "cloze" | "image-occlusion"
export type LineageClozeTarget = { id: string; answer: string; hints?: string[] }
export type LineagePoint = { x: number; y: number }
export type LineageGeometry =
  | { type: "rectangle"; x: number; y: number; width: number; height: number }
  | { type: "polygon"; points: LineagePoint[] }
export type LineageOcclusionRegion = {
  id: string
  label: string
  geometry: LineageGeometry
  accessibleDescription: string
}
export type LineageAsset = {
  id: string
  mediaType: string
  byteSize: number
  sha256: string
  path: string
}
export type LineagePrompt = {
  id: string
  revision: number
  kind: LineagePromptKind
  challenge: string[]
  withheld: string[]
  resolution: string[]
  response: LineageResponse
  clozeTargets?: LineageClozeTarget[]
  sourceAsset?: string
  occlusionRegions?: LineageOcclusionRegion[]
}
export type LineageCorpusV1 = {
  format: "lineage.corpus"
  formatVersion: 1
  corpusId: string
  prompts: LineagePrompt[]
  assets?: LineageAsset[]
}
export type LineageDiagnostic = {
  code: string
  path: string
  message: string
  relatedPath?: string
  severity: "error" | "warning" | "information"
}
`

const validFixture = { document: basic, expectedValid: true }
const invalidFixtures = [
  {
    document: {
      ...basic,
      prompts: [
        { ...basic.prompts[0], challenge: ["Paris is the capital of France."] },
      ],
    },
    expectedDiagnostic: {
      code: "disclosure.answer-leaked",
      path: "/prompts/0/challenge/0",
      relatedPath: "/prompts/0/withheld/0",
    },
  },
  {
    document: { ...basic, prompts: [{ ...basic.prompts[0], revision: 0 }] },
    expectedDiagnostic: {
      code: "revision.non-positive",
      path: "/prompts/0/revision",
    },
  },
]

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const files: GeneratedFile[] = [
  { content: brief, relativePath: "lineage-ai-brief.md" },
  { content: authoring, relativePath: "lineage-ai-authoring.md" },
  { content: full, relativePath: "lineage-ai-full.md" },
  {
    content: json(corpusSchema),
    relativePath: "schemas/lineage-corpus-v1.schema.json",
  },
  {
    content: json(candidateSchema),
    relativePath: "schemas/lineage-ai-candidate-v1.schema.json",
  },
  { content: types, relativePath: "types/lineage-corpus-v1.ts" },
  { content: json(basic), relativePath: "examples/basic.json" },
  { content: json(cloze), relativePath: "examples/cloze.json" },
  {
    content: json(imageOcclusion),
    relativePath: "examples/image-occlusion.json",
  },
  { content: json(media), relativePath: "examples/media.json" },
  { content: json(validFixture), relativePath: "fixtures/valid/basic.json" },
  {
    content: json(invalidFixtures[0]),
    relativePath: "fixtures/invalid/disclosure-leak.json",
  },
  {
    content: json(invalidFixtures[1]),
    relativePath: "fixtures/invalid/non-positive-revision.json",
  },
  { content: json(description), relativePath: "format-description.json" },
]

await rm(outputDirectory, { force: true, recursive: true })
for (const file of files) {
  const destination = path.join(outputDirectory, file.relativePath)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, file.content)
}
console.log(
  `Generated ${files.length} Lineage AI specification artifacts in ${outputDirectory}`,
)
