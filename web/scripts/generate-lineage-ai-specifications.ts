import { mkdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"

import lineageCore from "../app/features/lineage/generated/lineage-core.mjs"

type FormatDescription = {
  diagnosticCodes: string[]
  entities: string[]
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
const ref = (name: string) => ({ $ref: `#/$defs/${name}` })
const string = { type: "string" }
const id = { minLength: 1, type: "string" }
const revision = { minimum: 1, type: "integer" }
const timestamp = { format: "date-time", type: "string" }
const digest = { pattern: "^[a-f0-9]{64}$", type: "string" }
const array = (items: unknown, minItems?: number) => ({
  items,
  ...(minItems ? { minItems } : {}),
  type: "array",
})
const object = (properties: object, required: string[] = []) => ({
  additionalProperties: false,
  properties,
  required,
  type: "object",
})

const defs = {
  Asset: object(
    {
      accessibleDescription: string,
      byteSize: { minimum: 0, type: "integer" },
      id,
      mediaType: id,
      path: {
        pattern: "^assets/(?!.*(?:^|/)\\.\\.(?:/|$))[A-Za-z0-9._/-]+$",
        type: "string",
      },
      sha256: digest,
    },
    ["id", "mediaType", "byteSize", "sha256", "path"],
  ),
  ClozeTarget: object({ answer: id, hints: array(string), id }, [
    "id",
    "answer",
  ]),
  EntityReference: object({ id, revision }, ["id"]),
  Extension: object(
    {
      fallback: id,
      id,
      requirement: { enum: ["required", "optional"] },
      version: id,
    },
    ["id", "version", "requirement"],
  ),
  InteroperabilityReport: object(
    {
      id,
      losses: array(string),
      preservedArtifacts: array(id),
      sourceFormat: id,
      status: { enum: ["exact", "lossy"] },
      targetFormat: id,
    },
    ["id", "sourceFormat", "targetFormat", "status"],
  ),
  Material: object(
    {
      assets: array(id),
      content: array(string),
      id,
      provenance: array(id),
      revision,
      sources: array(id),
    },
    ["id", "revision", "content"],
  ),
  Migration: object(
    {
      appliedAt: timestamp,
      fromVersion: { minimum: 0, type: "integer" },
      id,
      tool: id,
      toolVersion: id,
      toVersion: revision,
    },
    ["id", "fromVersion", "toVersion", "appliedAt", "tool", "toolVersion"],
  ),
  OcclusionRegion: object(
    {
      accessibleDescription: id,
      geometry: {
        oneOf: [
          object(
            {
              height: { exclusiveMinimum: 0, maximum: 1, type: "number" },
              type: { const: "rectangle" },
              width: { exclusiveMinimum: 0, maximum: 1, type: "number" },
              x: { maximum: 1, minimum: 0, type: "number" },
              y: { maximum: 1, minimum: 0, type: "number" },
            },
            ["type", "x", "y", "width", "height"],
          ),
          object(
            {
              points: array(
                object(
                  {
                    x: { maximum: 1, minimum: 0, type: "number" },
                    y: { maximum: 1, minimum: 0, type: "number" },
                  },
                  ["x", "y"],
                ),
                3,
              ),
              type: { const: "polygon" },
            },
            ["type", "points"],
          ),
        ],
      },
      id,
      label: id,
    },
    ["id", "label", "geometry", "accessibleDescription"],
  ),
  Provenance: object(
    {
      agent: string,
      citation: string,
      id,
      kind: { enum: ["authored", "imported", "cited", "derived", "corrected"] },
      license: string,
      note: string,
      recordedAt: timestamp,
      sources: array(id),
    },
    ["id", "kind", "recordedAt"],
  ),
  Relationship: object(
    {
      id,
      kind: {
        enum: [
          "prerequisite",
          "related",
          "derived-from",
          "sibling",
          "duplicate-of",
        ],
      },
      source: ref("EntityReference"),
      target: ref("EntityReference"),
    },
    ["id", "kind", "source", "target"],
  ),
  Repetition: object(
    {
      assessment: { enum: ["again", "hard", "good", "easy"] },
      capturedResponse: string,
      durationMilliseconds: { minimum: 0, type: "integer" },
      id,
      presentationDigest: digest,
      promptId: id,
      promptRevision: revision,
      provenance: array(id),
      reviewedAt: timestamp,
      scheduler: object(
        {
          dueAt: timestamp,
          family: id,
          nextIntervalMinutes: { minimum: 0, type: "integer" },
          parameterDigest: digest,
          previousIntervalMinutes: { minimum: 0, type: "integer" },
          version: id,
        },
        ["family", "version"],
      ),
      snapshotDigest: digest,
    },
    ["id", "promptId", "promptRevision", "reviewedAt", "assessment"],
  ),
  RepetitionCorrection: object(
    {
      correctedAt: timestamp,
      id,
      provenance: array(id),
      reason: id,
      replacementAssessment: { enum: ["again", "hard", "good", "easy"] },
      replacementResponse: string,
      targetRepetitionId: id,
    },
    ["id", "targetRepetitionId", "correctedAt", "reason"],
  ),
  ResponseInteraction: {
    oneOf: [
      { const: "text" },
      object({ capture: { const: "none" }, mode: { const: "self-check" } }, [
        "mode",
        "capture",
      ]),
    ],
  },
  Source: object(
    {
      assets: array(id),
      content: string,
      id,
      provenance: array(id),
      revision,
      title: id,
    },
    ["id", "revision", "title", "content"],
  ),
}
const prompt = object(
  {
    assets: array(id),
    challenge: array(string),
    clozeTargets: array(ref("ClozeTarget"), 1),
    extensions: object({ optional: array(id), required: array(id) }),
    id,
    kind: { enum: description.promptKinds },
    materials: array(id),
    occlusionRegions: array(ref("OcclusionRegion"), 1),
    presentationProfile: id,
    provenance: array(id),
    resolution: array(string),
    response: ref("ResponseInteraction"),
    revision,
    sourceAsset: id,
    sources: array(id),
    status: { enum: ["active", "suspended", "retired"] },
    withheld: array(string, 1),
  },
  ["id", "revision", "kind", "challenge", "withheld", "resolution", "response"],
)
const corpusSchema = {
  $defs: { ...defs, Prompt: prompt },
  $id: "https://lineage.dev/schema/lineage-corpus.schema.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  ...object(
    {
      assets: array(ref("Asset")),
      corpusId: id,
      extensions: array(ref("Extension")),
      format: { const: description.formatName },
      formatVersion: { const: description.version },
      interoperability: array(ref("InteroperabilityReport")),
      materials: array(ref("Material")),
      migrations: array(ref("Migration")),
      prompts: array(ref("Prompt")),
      provenance: array(ref("Provenance")),
      relationships: array(ref("Relationship")),
      repetitionCorrections: array(ref("RepetitionCorrection")),
      repetitions: array(ref("Repetition")),
      sources: array(ref("Source")),
    },
    ["format", "formatVersion", "corpusId", "prompts"],
  ),
  title: "Lineage corpus version 1",
}
const archiveEntry = object(
  {
    byteSize: { minimum: 0, type: "integer" },
    mediaType: id,
    path: {
      pattern: "^(?!/)(?!.*(?:^|/)\\.\\.(?:/|$))[A-Za-z0-9._/-]+$",
      type: "string",
    },
    required: { type: "boolean" },
    sha256: digest,
  },
  ["path", "mediaType", "byteSize", "sha256"],
)
const manifestSchema = {
  $id: "https://lineage.dev/schema/lineage-manifest.schema.json",
  $schema: "https://json-schema.org/draft/2020-12/schema",
  ...object(
    {
      corpus: { const: "corpus.json" },
      corpusId: id,
      corpusSha256: digest,
      createdAt: timestamp,
      entries: array(archiveEntry, 1),
      extensions: object({ optional: array(id), required: array(id) }),
      format: { const: "lineage.manifest" },
      formatVersion: { const: 1 },
      modifiedAt: timestamp,
      presentationProfiles: array(id),
    },
    [
      "format",
      "formatVersion",
      "corpusId",
      "corpus",
      "corpusSha256",
      "createdAt",
      "modifiedAt",
      "entries",
    ],
  ),
  title: "Lineage archive manifest version 1",
}

const basePrompt = {
  assets: [],
  challenge: ["What is the capital of France?"],
  extensions: { optional: [], required: [] },
  id: "capital-of-france",
  kind: "basic",
  materials: [],
  presentationProfile: "lineage.review/1",
  provenance: [],
  resolution: ["What is the capital of France?", "Paris"],
  response: { capture: "none", mode: "self-check" },
  revision: 1,
  sources: [],
  status: "active",
  withheld: ["Paris"],
}
const base = {
  assets: [],
  corpusId: "example-basic",
  extensions: [],
  format: description.formatName,
  formatVersion: description.version,
  interoperability: [],
  materials: [],
  migrations: [],
  prompts: [basePrompt],
  provenance: [],
  relationships: [],
  repetitionCorrections: [],
  repetitions: [],
  sources: [],
}
const cloze = {
  ...base,
  corpusId: "example-cloze",
  prompts: [
    {
      ...basePrompt,
      challenge: ["The capital of France is […]."],
      clozeTargets: [
        { answer: "Paris", hints: ["European capital"], id: "france-capital" },
      ],
      id: "france-capital-cloze",
      kind: "cloze",
      resolution: ["The capital of France is Paris.", "Paris"],
    },
  ],
}
const hostDigest = "HOST_COMPUTED_SHA256_REQUIRED"
const mediaAsset = {
  accessibleDescription: "Host-provided diagram.",
  byteSize: "HOST_COMPUTED_BYTE_SIZE_REQUIRED",
  id: "heart-diagram",
  mediaType: "image/png",
  path: "assets/heart-diagram.png",
  sha256: hostDigest,
}
const imageOcclusion = {
  ...base,
  assets: [mediaAsset],
  corpusId: "example-image-occlusion",
  prompts: [
    {
      ...basePrompt,
      assets: ["heart-diagram"],
      challenge: ["Name the covered chamber."],
      id: "heart-left-ventricle",
      kind: "image-occlusion",
      occlusionRegions: [
        {
          accessibleDescription:
            "Lower-right chamber in anatomical orientation.",
          geometry: {
            height: 0.24,
            type: "rectangle",
            width: 0.2,
            x: 0.58,
            y: 0.56,
          },
          id: "left-ventricle",
          label: "Left ventricle",
        },
      ],
      resolution: ["Left ventricle"],
      sourceAsset: "heart-diagram",
      withheld: ["Left ventricle"],
    },
  ],
}
const media = {
  ...base,
  assets: [mediaAsset],
  corpusId: "example-media",
  prompts: [
    {
      ...basePrompt,
      assets: ["heart-diagram"],
      id: "heart-media",
      resolution: ["Heart diagram", "heart"],
      withheld: ["heart"],
    },
  ],
}
const fullHistory = {
  ...base,
  corpusId: "example-history",
  repetitions: [
    {
      assessment: "good",
      id: "review-1",
      promptId: "capital-of-france",
      promptRevision: 1,
      reviewedAt: "2026-08-26T12:00:00Z",
      scheduler: {
        dueAt: "2026-09-01T12:00:00Z",
        family: "fsrs",
        version: "6",
      },
      snapshotDigest: "0".repeat(64),
    },
  ],
}

const entityDescriptions: Record<string, string> = {
  ArchiveEntry: "Safe path, byte count, media type, and host-computed digest.",
  Asset: "Content-addressed local media declaration verified from bytes.",
  ClozeTarget:
    "Stable cloze identity independent of marker number or position.",
  CorpusDocument:
    "Top-level canonical corpus; ownership and current due state are excluded.",
  Extension:
    "Versioned required or optional capability with portable fallback.",
  InteroperabilityReport: "Exactness or named losses for conversion.",
  Manifest: "Archive root binding corpus and entry digests.",
  Material: "Reusable immutable content fragment revision.",
  Migration: "Explicit forward format migration.",
  OcclusionRegion:
    "Stable region identity with normalized geometry and accessible description.",
  Prompt: "Stable independently scheduled review contract revision.",
  Provenance: "Auditable origin, citation, license, and derivation record.",
  Relationship: "Typed identity-neutral edge.",
  Repetition: "Append-only review event tied to an exact Prompt revision.",
  RepetitionCorrection: "Append-only correction; never overwrites its target.",
  ResponseInteraction: "Typed response capture or reveal-and-self-check.",
  Source: "Shared immutable authored/imported source revision.",
}
const rules = [
  [
    "identity",
    "Stable IDs identify durable entities; Prompt identity means continuity of one review stream. Revisions are positive and immutable.",
  ],
  [
    "disclosure",
    "Challenge, accessible descriptions, fallbacks, and labels visible before reveal must not leak withheld answers; resolution must disclose all answers.",
  ],
  [
    "references",
    "Every Prompt/source/material/provenance/asset reference resolves in the same locally complete corpus or archive.",
  ],
  [
    "history",
    "Repetitions and corrections are append-only; repetitions resolve to exact Prompt revisions; corrections target distinct existing events.",
  ],
  [
    "migrations",
    "Migration history is ordered, contiguous, forward-only, and meaning-preserving.",
  ],
  [
    "extensions",
    "Required extensions require support. Optional extensions require canonical portable fallbacks.",
  ],
  [
    "interoperability",
    "Exact conversions report no losses; lossy conversions enumerate each loss and preserve original artifacts where possible.",
  ],
  [
    "archive",
    "Paths are normalized relative paths; entries are unique; sizes and SHA-256 digests are computed from actual bytes; undeclared and missing required entries are rejected.",
  ],
  [
    "canonicalization",
    "Canonical JSON recursively sorts object keys, preserves array order, materializes defaults, and is idempotent.",
  ],
]
const brief = `# Lineage corpus v1: AI brief\n\nGenerate only the requested JSON candidate matching \`${description.formatName}\` version ${description.version}.\n\n## Minimal structure\n\n\`{ "format": "lineage.corpus", "formatVersion": 1, "corpusId": "...", "prompts": [...] }\`\n\n- Prompt kinds: ${description.promptKinds.join(", ")}.\n- Response modes: \`"text"\` or \`{ "mode": "self-check", "capture": "none" }\`.\n- Prompt IDs are stable; revisions are positive and immutable.\n- Keep withheld answers out of every pre-reveal representation and include them in resolution.\n- Resolve all source, material, asset, provenance, extension, history, and relationship references.\n- Never invent media bytes, sizes, paths, or SHA-256 digests. Return media requirements to the host.\n- Do not mutate repetition history; add correction events.\n- A human must preview and explicitly accept before persistence.\n\n## Common invalid patterns\n\nAnswer leakage; missing resolution answers; duplicate identities; revision 0; unresolved references; missing cloze targets; invalid occlusion geometry; invented asset integrity; unsafe archive paths; non-contiguous migrations; unreported conversion loss.\n\n## Small valid example\n\n\`\`\`json\n${JSON.stringify(base, null, 2)}\n\`\`\`\n`
const authoring = `# Lineage corpus v1: AI authoring specification\n\n${brief}\n## Content and review contracts\n\nChallenge and resolution are explicit canonical views. Structured reusable content belongs in Materials and Sources; Prompts reference them without losing a complete review contract. Accessibility descriptions preserve reading order and the disclosure boundary. Cloze targets and occlusion regions have stable IDs independent of position, numbering, wording, or geometry.\n\n## Media\n\nAI output may propose an asset ID, media type, accessible description, and purpose. The host obtains bytes, chooses a safe \`assets/...\` path, computes byte size and SHA-256, and then revalidates dependency closure. Placeholder media examples are intentionally not importable.\n\n## Provenance\n\nUse provenance for authorship, citations, licenses, imports, derivations, and corrections. Provenance is evidence of origin, not a truth claim. Preserve source chains.\n\n## Repair protocol\n\nUse stable diagnostic code/path pairs. Modify only named paths, preserve unrelated IDs/revisions/history, revalidate after every attempt, stop at the configured limit, and return unresolved failures for human action.\n`
const full = `# Lineage corpus v1: full AI reference\n\n## 1. Scope and authority\n\nThis generated reference describes the canonical version-1 corpus and archive boundary. JSON Schema proves shape only; authoritative semantic validation remains mandatory.\n\n## 2. Entities\n\n${Object.entries(
  entityDescriptions,
)
  .map(
    ([name, text]) =>
      `### 2.${Object.keys(entityDescriptions).indexOf(name) + 1} ${name}\n\n${text}`,
  )
  .join(
    "\n\n",
  )}\n\n## 3. Invariants\n\n${rules.map(([name, text], index) => `### 3.${index + 1} ${name}\n\n${text}`).join("\n\n")}\n\n## 4. Compatibility\n\nReaders reject unknown required format versions and required extensions. Unknown optional extensions remain reviewable through fallbacks. Migrations preserve denotation and remain recorded. Import/export reports exactness or explicit losses. Original Anki or other source artifacts may be preserved as archive entries without becoming the canonical representation.\n\n## 5. Decoder and validation pipeline\n\nParse JSON; validate against the generated schema; decode tagged alternatives and materialize defaults; run semantic validation; verify references and history; for archives verify paths, sizes, digests, and dependency closure; canonicalize; preview; explicitly accept; persist atomically.\n\n## 6. Stable diagnostics\n\n${description.diagnosticCodes.map((code) => `- \`${code}\``).join("\n")}\n\n## 7. Canonical round trips\n\nFor valid corpus \`c\`: decoding \`encode(c)\` succeeds with the same denotation; canonicalization is idempotent; generated schema accepts canonical encodings; migrations and import/export marked exact preserve denotation.\n`
const types = `// Generated from Lineage.Specification.CorpusWireV1. Do not edit.\nexport type LineageResponse = "text" | { mode: "self-check"; capture: "none" }\nexport type LineagePromptKind = ${description.promptKinds.map((v) => JSON.stringify(v)).join(" | ")}\nexport type EntityReference = { id: string; revision?: number }\nexport type Asset = { id: string; mediaType: string; byteSize: number; sha256: string; path: string; accessibleDescription?: string }\nexport type Prompt = { id: string; revision: number; status?: "active" | "suspended" | "retired"; kind: LineagePromptKind; challenge: string[]; withheld: string[]; resolution: string[]; response: LineageResponse; materials?: string[]; sources?: string[]; assets?: string[]; provenance?: string[]; presentationProfile?: string; extensions?: { required?: string[]; optional?: string[] }; clozeTargets?: { id: string; answer: string; hints?: string[] }[]; sourceAsset?: string; occlusionRegions?: unknown[] }\nexport type CorpusDocument = { format: "lineage.corpus"; formatVersion: 1; corpusId: string; prompts: Prompt[]; sources?: unknown[]; materials?: unknown[]; assets?: Asset[]; relationships?: unknown[]; repetitions?: unknown[]; repetitionCorrections?: unknown[]; provenance?: unknown[]; extensions?: unknown[]; migrations?: unknown[]; interoperability?: unknown[] }\nexport type LineageManifest = { format: "lineage.manifest"; formatVersion: 1; corpusId: string; corpus: "corpus.json"; corpusSha256: string; createdAt: string; modifiedAt: string; entries: { path: string; mediaType: string; byteSize: number; sha256: string; required?: boolean }[]; presentationProfiles?: string[]; extensions?: { required?: string[]; optional?: string[] } }\n`

const invalid = [
  [
    "disclosure-leak.json",
    "disclosure.answer-leaked",
    "/prompts/0/challenge/0",
    {
      ...base,
      prompts: [
        { ...basePrompt, challenge: ["Paris is the capital of France."] },
      ],
    },
  ],
  [
    "non-positive-revision.json",
    "revision.non-positive",
    "/prompts/0/revision",
    { ...base, prompts: [{ ...basePrompt, revision: 0 }] },
  ],
  [
    "unresolved-asset.json",
    "asset.unresolved",
    "/prompts/0/assets/0",
    { ...base, prompts: [{ ...basePrompt, assets: ["missing"] }] },
  ],
  [
    "unresolved-history.json",
    "history.prompt-unresolved",
    "/repetitions/0/promptId",
    {
      ...base,
      repetitions: [
        {
          assessment: "good",
          id: "review-1",
          promptId: "missing",
          promptRevision: 1,
          reviewedAt: "2026-08-26T12:00:00Z",
        },
      ],
    },
  ],
  [
    "invalid-correction.json",
    "history.correction-invalid",
    "/repetitionCorrections/0/targetRepetitionId",
    {
      ...base,
      repetitionCorrections: [
        {
          correctedAt: "2026-08-26T12:00:00Z",
          id: "correction-1",
          reason: "Incorrect rating",
          targetRepetitionId: "missing",
        },
      ],
    },
  ],
  [
    "migration-gap.json",
    "migration.chain-invalid",
    "/migrations/1/fromVersion",
    {
      ...base,
      migrations: [
        {
          appliedAt: "2026-08-26T12:00:00Z",
          fromVersion: 1,
          id: "m1",
          tool: "lineage",
          toolVersion: "1",
          toVersion: 2,
        },
        {
          appliedAt: "2026-08-26T12:01:00Z",
          fromVersion: 3,
          id: "m2",
          tool: "lineage",
          toolVersion: "1",
          toVersion: 4,
        },
      ],
    },
  ],
  [
    "loss-unreported.json",
    "interoperability.loss-unreported",
    "/interoperability/0/losses",
    {
      ...base,
      interoperability: [
        {
          id: "anki-export",
          losses: [],
          sourceFormat: "lineage.corpus/1",
          status: "lossy",
          targetFormat: "anki.apkg",
        },
      ],
    },
  ],
] as const
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
const files: GeneratedFile[] = [
  { content: brief, relativePath: "spec/lineage-ai-brief.md" },
  { content: authoring, relativePath: "spec/lineage-ai-authoring.md" },
  { content: full, relativePath: "spec/lineage-ai-full.md" },
  {
    content: json(corpusSchema),
    relativePath: "schema/lineage-corpus.schema.json",
  },
  {
    content: json(manifestSchema),
    relativePath: "schema/lineage-manifest.schema.json",
  },
  { content: types, relativePath: "types/lineage-corpus.ts" },
  { content: json(base), relativePath: "examples/basic.json" },
  { content: json(cloze), relativePath: "examples/cloze.json" },
  {
    content: json(imageOcclusion),
    relativePath: "examples/image-occlusion.json",
  },
  { content: json(media), relativePath: "examples/media.json" },
  {
    content: json({ document: base }),
    relativePath: "conformance/valid/basic.json",
  },
  {
    content: json({ document: fullHistory }),
    relativePath: "conformance/valid/history.json",
  },
  ...invalid.map(([fileName, code, diagnosticPath, document]) => ({
    content: json({
      document,
      expectedDiagnostic: { code, path: diagnosticPath },
    }),
    relativePath: `conformance/invalid/${fileName}`,
  })),
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
