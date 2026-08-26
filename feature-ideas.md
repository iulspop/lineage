# Lineage Feature Ideas

This document collects promising product and format ideas that are not yet committed parts of the Lineage specification or implementation roadmap.

## Portable `.lineage` archive with media

Keep canonical JSON as a convenient interchange format for small, text-only corpora, while also supporting a portable `.lineage` archive containing a corpus and its complete local dependency closure.

The archive should use a standard ZIP container rather than a custom binary format. A possible initial structure is:

```text
example.lineage
├── manifest.json
├── corpus.json
├── assets/
│   ├── sha256-a37f...png
│   └── sha256-b921...mp3
└── representations/
    └── original/
        └── source.apkg
```

### Manifest responsibilities

`manifest.json` should identify and verify the package rather than redefine corpus semantics. It may contain:

- Archive format name and version.
- Stable corpus identity.
- Path to the canonical corpus document.
- Asset identities, paths, media types, byte sizes, and cryptographic digests.
- Required presentation profiles and extensions.
- Optional original or enhanced representations.

Example:

```json
{
  "format": "lineage.archive",
  "formatVersion": 1,
  "corpusId": "powers-of-i",
  "corpus": "corpus.json",
  "assets": [
    {
      "id": "complex-powers-diagram",
      "path": "assets/sha256-a37f...png",
      "mediaType": "image/png",
      "byteSize": 48291,
      "sha256": "a37f..."
    }
  ]
}
```

### Desired invariants

- The archive is completely usable offline.
- Every required asset is present within the archive.
- Asset bytes match their declared sizes and cryptographic digests.
- Corpus content references assets by stable identity or content digest rather than incidental archive position.
- Archive paths are relative and safe; path traversal and ambiguous duplicate paths are rejected.
- Import applies explicit limits for archive size, expanded size, file count, and individual asset size.
- Missing, duplicated, unsupported-required, or digest-mismatched dependencies cause validation failure.
- Unknown optional files and extensions can be preserved without being trusted or executed.
- Original Anki fields, templates, HTML, CSS, JavaScript, and media may be retained for provenance and interoperability without becoming the only canonical review representation.
- Canonically equivalent corpora can be exported deterministically, including stable entry ordering and normalized metadata.

### Import boundary

A proposed import pipeline is:

```text
.lineage archive
    ↓ safely inspect and unpack
manifest decoding and validation
    ↓
asset availability, size, media-type, and digest validation
    ↓
corpus JSON decoding
    ↓
Agda semantic validation
    ↓
atomic persistence of the corpus snapshot and referenced assets
```

The semantic specification and integrity laws should remain in the proved Lineage core where practical. TypeScript may own ZIP processing, streaming I/O, storage, and platform integration through a narrow adapter, but must not independently redefine Lineage validity.

### Relationship to canonical JSON

JSON remains useful as:

- A lightweight format for text-only corpora.
- An inspectable canonical corpus document inside an archive.
- A debugging and conformance-fixture representation.
- An API boundary for hosts that do not need packaged media.

The `.lineage` archive is therefore a physical packaging format around Lineage data and dependencies, not a replacement ontology or an alternative source of semantic truth.

### Open design questions

- Whether `manifest.json` or `corpus.json` owns format compatibility declarations shared by both.
- Whether assets are stored strictly by digest or by stable asset identity plus digest.
- Whether archive-level signatures should be supported in the first version or added as an extension.
- How deterministic ZIP metadata should be normalized across implementations.
- Whether large assets may be externally referenced as optional dependencies while preserving a fully local canonical fallback.
- How streaming validation and extraction should work for very large corpora.
- How `.apkg` imports and exports preserve original media names while canonical Lineage assets remain content-addressed.

## Agda-generated specifications for AI corpus authoring

Use the formal Agda core to generate a family of synchronized, AI-facing specification artifacts. These artifacts would act as compact cheat sheets, comprehensive references, constrained-output schemas, and repair guidance for functions in which an AI generates candidate Lineage corpora.

The artifacts should be generated from an explicit machine-readable format description in Agda rather than by asking an AI to summarize arbitrary Agda source code. This keeps documentation, schemas, host types, examples, and validation behavior aligned with the authoritative format definition.

### Generated artifacts

Generate several representations for different consumers and context budgets:

```text
generated/
├── spec/
│   ├── lineage-ai-brief.md
│   ├── lineage-ai-authoring.md
│   └── lineage-ai-full.md
├── schema/
│   ├── lineage-corpus.schema.json
│   └── lineage-manifest.schema.json
├── types/
│   └── lineage-corpus.ts
├── examples/
│   ├── basic.json
│   ├── cloze.json
│   ├── image-occlusion.json
│   └── media.json
└── conformance/
    ├── valid/
    └── invalid/
```

#### Brief AI specification

`lineage-ai-brief.md` should be small enough to include in routine generation requests. It should contain:

- The minimal corpus structure.
- Required fields and allowed values.
- Critical semantic invariants.
- Supported prompt forms.
- Small valid examples.
- Common invalid patterns.
- An instruction to produce only the requested candidate corpus document.

A target size of roughly 1,000–2,000 model tokens would make it practical to include frequently.

#### Authoring specification

`lineage-ai-authoring.md` should cover richer authoring tasks, including:

- Structured content.
- Assets and media references.
- Cloze targets.
- Image-occlusion regions.
- Accessibility equivalents.
- Disclosure-safe challenge and resolution construction.
- Provenance and source references relevant to generated content.

#### Full specification

`lineage-ai-full.md` should document every supported entity, field, invariant, and compatibility rule, including identity, revisions, relationships, repetitions, migrations, extensions, archive integrity, and interoperability. It should be split into addressable sections so an application can retrieve only the rules relevant to a generation or repair task.

#### JSON Schema and host types

Generated JSON Schemas should provide constrained-output contracts for model APIs and structural validation. Generated TypeScript types should prevent the web application’s host-facing types from drifting away from the formal wire format.

JSON Schema can enforce shape-level properties such as required fields, positive revisions, tagged alternatives, coordinate ranges, and array constraints. It cannot express every semantic invariant, so successful schema validation must not replace Agda semantic validation.

#### Conformance fixtures

Generate valid and invalid examples with stable diagnostic expectations. An invalid fixture may have the form:

```json
{
  "expectedError": "disclosure.answer-leaked",
  "document": {}
}
```

These fixtures can test implementations and teach an AI how to repair specific failures without regenerating unrelated content.

### Format-description algebra

Define a schema and rule vocabulary in Agda, for example:

```agda
data FieldRequirement : Set where
  required optional : FieldRequirement

data Schema : Set where
  text      : Schema
  natural   : Schema
  boolean   : Schema
  array     : Schema → Schema
  object    : List Field → Schema
  choice    : List Alternative → Schema
  reference : EntityKind → Schema

record Field : Set where
  field
    name        : String
    requirement : FieldRequirement
    schema      : Schema
    summary     : String
    explanation : String

record Rule : Set where
  field
    code        : String
    severity    : Severity
    summary     : String
    explanation : String
    appliesTo   : EntityKind
```

Provide interpreters from the same description:

```agda
toJSONSchema : FormatDescription → JSON
toBriefSpec  : FormatDescription → Text
toFullSpec   : FormatDescription → Text
toTypeScript : FormatDescription → Text
toExamples   : FormatDescription → List Fixture
```

Where feasible, the executable decoder and schema generator should also be interpretations of this shared format description. This is stronger than separately maintaining an Agda model, prose document, Zod schema, JSON Schema, and TypeScript interface.

### Correspondence and proof obligations

Generating documentation from Agda is not sufficient by itself. The generated description must correspond to the real decoder and validator.

Important properties include:

```agda
decode-sound :
  decode input ≡ success corpus →
  Valid corpus

schema-accepts-encoding :
  Valid corpus →
  JSONSchemaAccepts schema (encode corpus)
```

Additional useful properties include canonical encode/decode round trips, stable diagnostic codes, and preservation of denotation through canonicalization and migrations.

### Structured validation diagnostics

Replace Boolean-only host validation with structured diagnostics suitable for automated repair:

```json
{
  "valid": false,
  "diagnostics": [
    {
      "code": "disclosure.answer-leaked",
      "path": "/prompts/2/challenge/0",
      "message": "Challenge content contains a withheld answer.",
      "relatedPath": "/prompts/2/withheld/0"
    }
  ]
}
```

Diagnostics should have stable codes, precise document paths, concise explanations, and related paths where useful. The application can send only the failed candidate, relevant specification sections, and diagnostics back to the model for repair.

### AI corpus-generation boundary

AI output must be treated as untrusted input and must not write directly into durable storage:

```text
authoring request
    ↓
AI receives the brief spec and relevant examples
    ↓
AI produces a candidate corpus
    ↓
structural decoding and schema validation
    ↓
Agda semantic validation
    ↓
bounded diagnostic repair loop
    ↓
human preview and explicit acceptance
    ↓
canonicalization and durable persistence
```

For media-bearing corpora:

```text
AI proposes logical content and asset requirements
    ↓
host obtains or generates actual media bytes
    ↓
host computes sizes and cryptographic digests
    ↓
asset references and dependency closure are validated
    ↓
.lineage archive is produced
```

The AI must not invent asset digests or claim that media exists. The host computes integrity metadata from actual bytes.

### Repair behavior

Repairs should be bounded and localized:

- Return structured diagnostics from the authoritative validator.
- Retrieve only the full-spec sections relevant to those diagnostics.
- Ask the model to preserve unrelated Prompt identities, revisions, and content.
- Revalidate every repaired candidate.
- Limit repair attempts and surface unresolved failures to the user.
- Require a human preview before persistence or archive export.

### Implementation sequence

1. Define the actual version-1 corpus wire model rather than treating the current minimal web DTO as the complete Lineage format.
2. Define the Agda `FormatDescription` and stable rule/diagnostic vocabulary.
3. Derive the decoder and generated artifacts from the shared description where practical.
4. Generate brief, authoring, and full specifications, JSON Schemas, TypeScript types, and conformance fixtures.
5. Replace Boolean validation at the host boundary with structured diagnostics.
6. Implement candidate generation and a bounded repair loop.
7. Add a human review and acceptance step before canonical persistence.
8. Extend the same process to `.lineage` archives and media dependency closure.

### Current limitation

The current web corpus DTO supports only a small text-prompt subset: corpus identity/version and Prompts containing identity, revision, challenge, withheld content, resolution, and response type. Although the Agda repository models many additional concepts, they are not yet unified into one production decoder and wire schema. Consolidating the real version-1 wire model is therefore a prerequisite for honestly generating a complete specification bundle.
