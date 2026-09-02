# Lineage corpus v1: full AI reference

## 1. Scope and authority

Portable, locally complete version-1 Lineage corpus and archive format.

JSON Schema enforces structural constraints. Authoritative semantic validation remains mandatory.

## 2. Wire entities

### 2.1 ResponseInteraction

ResponseInteraction version-1 wire object.

- `mode` (required; alternatives): Review response interaction. Use text capture or explicit self-check/no-capture.

### 2.2 SelfCheckResponse

SelfCheckResponse version-1 wire object.

- `mode` (required; literal): Self-check discriminator. Requires capture none.
- `capture` (required; literal): No response capture. The learner reveals and rates without typed capture.

### 2.3 EntityReference

EntityReference version-1 wire object.

- `id` (required; scalar; nonEmpty): Referenced stable identity. Must resolve in the referenced namespace.
- `revision` (optional; scalar): Optional exact revision. When present it must be positive and resolve exactly.

### 2.4 ClozeTarget

ClozeTarget version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable cloze-target identity. Independent of marker order and wording.
- `answer` (required; scalar): Withheld target answer. Must be disclosed after reveal.
- `hints` (optional; array): Optional hints. Hints must not leak the answer.

### 2.5 NormalizedPoint

NormalizedPoint version-1 wire object.

- `x` (required; scalar; maximum): Normalized horizontal coordinate. Inclusive range zero through one.
- `y` (required; scalar; maximum): Normalized vertical coordinate. Inclusive range zero through one.

### 2.6 RectangleGeometry

RectangleGeometry version-1 wire object.

- `type` (required; literal): Geometry discriminator. Selects normalized rectangle fields.
- `x` (required; scalar; maximum): Left coordinate. Inclusive range zero through one.
- `y` (required; scalar; maximum): Top coordinate. Inclusive range zero through one.
- `width` (required; scalar; minimum, maximum): Normalized width. Greater than zero and at most one.
- `height` (required; scalar; minimum, maximum): Normalized height. Greater than zero and at most one.

### 2.7 PolygonGeometry

PolygonGeometry version-1 wire object.

- `type` (required; literal): Geometry discriminator. Selects polygon points.
- `points` (required; array): Normalized polygon vertices. At least three points.

### 2.8 OcclusionRegion

OcclusionRegion version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable region identity. Geometry changes do not change identity.
- `label` (required; scalar): Human-readable region label. Must be non-empty.
- `accessibleDescription` (required; scalar): Accessible equivalent. Must describe the concealed region without leaking its answer.
- `geometry` (required; taggedChoice): Normalized geometry. Rectangle or polygon with coordinates from zero through one.

### 2.9 Source

Source version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable Source identity. Pairs with revision.
- `revision` (required; scalar; minimum): Positive immutable revision. Starts at one.
- `title` (required; scalar): Source title. Must be non-empty.
- `content` (required; scalar): Source content. Portable non-executable text.
- `assets` (optional; array): Referenced assets. All references resolve locally.
- `provenance` (optional; array): Origin records. All references resolve locally.

### 2.10 Material

Material version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable Material identity. Pairs with revision.
- `revision` (required; scalar; minimum): Positive immutable revision. Starts at one.
- `content` (required; array): Structured portable content. Ordered content blocks.
- `sources` (optional; array): Source references. All references resolve.
- `assets` (optional; array): Asset references. All references resolve.
- `provenance` (optional; array): Origin records. All references resolve.

### 2.11 Collection

Collection version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable collection identity. Organization never changes Prompt identity or review history.
- `title` (required; scalar; nonEmpty): Human-readable collection title. Titles need not be unique.
- `description` (optional; scalar): Optional collection description. Describes the organizational view.
- `parentId` (optional; reference): Optional parent collection. Must resolve and must not introduce a cycle.

### 2.12 CollectionMembership

CollectionMembership version-1 wire object.

- `collectionId` (required; reference): Containing collection. Must resolve locally.
- `promptId` (required; reference): Organized Prompt identity. Membership does not partition scheduling.

### 2.13 LearningTargetReference

Stable generalized learning target.

- `type` (required; enumeration): Learning target kind. Determines which revision and segment fields are required.
- `id` (required; scalar; nonEmpty): Stable target identity. Must resolve inside the corpus except for declared concepts.
- `revision` (optional; scalar; minimum): Exact immutable revision. Required for Prompt, Source, Material, and segment targets.
- `segmentId` (optional; scalar): Stable reading segment identity. Required only for source-segment and material-segment targets.

### 2.14 ReadingSegmentTarget

Revision-bound Source or Material segment owner.

- `type` (required; enumeration): Segment owner kind. Only Source and Material revisions can own reading segments.
- `id` (required; scalar; nonEmpty): Owner identity. Must resolve with revision.
- `revision` (required; scalar; minimum): Exact owner revision. Prevents progress drifting across edited prose.

### 2.15 ReadingSegment

Stable durable reading segment.

- `id` (required; scalar; nonEmpty): Stable segment identity within its revision-bound owner. Never derived from mutable character offsets.
- `target` (required; objectRef): Revision-bound Source or Material owner. The owner revision must resolve exactly.
- `ordinal` (required; scalar): Stable authored ordering within the owner revision. Used for coherent continuation, not identity.
- `content` (required; array): Durable segment content. Must contain at least one content block.

### 2.16 LearningObservation

Append-only non-recall learning evidence.

- `id` (required; scalar; nonEmpty): Stable observation identity. Append-only and unique among generalized observations.
- `target` (required; objectRef): Observed learning target. Must resolve to the exact durable target.
- `activityKind` (required; enumeration): Activity that produced the observation. Recall-specific scheduler evidence remains a Repetition.
- `observationKind` (required; enumeration): Factual observation kind. Does not persist inferred mastery.
- `observedAt` (required; scalar; semanticFormat): Observation timestamp. Hosts declare chronological replay order for merges.
- `durationMilliseconds` (optional; scalar): Observed duration. Non-negative when present.
- `assessment` (optional; scalar): Policy-neutral authored assessment. Required only by host policy when observationKind is assessed.
- `response` (optional; scalar): Optional captured learner response. Absence remains distinct from an empty response.
- `provenance` (optional; array): Origin records. All references resolve locally.

### 2.17 Asset

Asset version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable asset identity. Referenced by Prompts, Sources, and Materials.
- `mediaType` (required; scalar): IANA media type. Must be non-empty.
- `byteSize` (required; scalar): Exact byte count. Computed by the host from actual bytes.
- `sha256` (required; scalar; regexPattern): Lowercase SHA-256 digest. Exactly 64 hexadecimal characters, host-computed.
- `path` (required; scalar): Safe archive-relative path. Must begin assets/ and cannot traverse.
- `accessibleDescription` (optional; scalar): Accessible media equivalent. Required when media conveys review meaning.

### 2.18 ExtensionSet

ExtensionSet version-1 wire object.

- `required` (optional; array): Required extensions. Renderer support is mandatory.
- `optional` (optional; array): Optional extensions. Portable fallback is mandatory.

### 2.19 Prompt

Prompt version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable Prompt identity. One independently scheduled recall stream.
- `revision` (required; scalar; minimum): Positive immutable revision. Repetitions bind to this exact revision.
- `status` (optional; enumeration): Lifecycle status. Defaults to active.
- `kind` (optional; enumeration): Prompt kind. Defaults to basic.
- `challenge` (required; array): Pre-disclosure content. Must not reveal withheld material.
- `withheld` (required; array): Concealed answer material. Non-empty and fully disclosed by resolution.
- `resolution` (required; array): Post-disclosure content. Contains every withheld item.
- `response` (required; alternatives): Response policy. Typed capture or self-check/no-capture.
- `materials` (optional; array): Material references. All resolve locally.
- `sources` (optional; array): Source references. All resolve locally.
- `assets` (optional; array): Asset references. All resolve to archive bytes when exporting.
- `clozeTargets` (optional; array): Stable cloze targets. Required for cloze Prompts.
- `sourceAsset` (optional; reference): Occlusion source image. Required for image occlusion.
- `occlusionRegions` (optional; array): Stable occlusion regions. Required and non-empty for image occlusion.
- `presentationProfile` (optional; scalar): Presentation contract version. Defaults to lineage.review/1.
- `extensions` (optional; objectRef): Prompt extension requirements. Required and optional capabilities are explicit.
- `provenance` (optional; array): Origin records. All references resolve.

### 2.20 Relationship

Relationship version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable relationship identity. Unique among relationships.
- `kind` (required; enumeration): Relationship kind. Does not merge endpoint identities.
- `source` (required; objectRef): Source endpoint. Must resolve.
- `target` (required; objectRef): Target endpoint. Must resolve.

### 2.21 SchedulerObservation

SchedulerObservation version-1 wire object.

- `family` (required; scalar): Scheduler family. For example fsrs.
- `version` (required; scalar): Scheduler/model version. Must be explicit.
- `parameterDigest` (optional; scalar; regexPattern): Parameter-set SHA-256. Fingerprints exact parameters.
- `previousIntervalMinutes` (optional; scalar): Previous interval. Historical observation.
- `nextIntervalMinutes` (optional; scalar): Resulting interval. Historical observation.
- `dueAt` (optional; scalar; semanticFormat): Resulting due timestamp. Derived state captured for audit.

### 2.22 Repetition

Repetition version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable event identity. Append-only and unique.
- `promptId` (required; reference): Served Prompt identity. Must resolve with promptRevision.
- `promptRevision` (required; scalar; minimum): Served Prompt revision. Positive and exact.
- `snapshotDigest` (optional; scalar; regexPattern): Served corpus snapshot digest. SHA-256 when present.
- `presentationDigest` (optional; scalar; regexPattern): Served presentation digest. SHA-256 when present.
- `reviewedAt` (required; scalar; semanticFormat): Review timestamp. RFC 3339 date-time.
- `durationMilliseconds` (optional; scalar): Review duration. Non-negative.
- `capturedResponse` (optional; scalar): Captured learner response. Absent for self-check/no-capture.
- `assessment` (required; enumeration): Learner assessment. One of four scheduler-neutral ratings.
- `scheduler` (optional; objectRef): Historical scheduler observation. Replaceable current state is not corpus meaning.
- `provenance` (optional; array): Origin records. All references resolve.

### 2.23 RepetitionCorrection

RepetitionCorrection version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable correction identity. Distinct from target.
- `targetRepetitionId` (required; reference): Corrected event. Must resolve and cannot self-target.
- `correctedAt` (required; scalar; semanticFormat): Correction timestamp. RFC 3339 date-time.
- `reason` (required; scalar): Correction reason. Must be non-empty.
- `replacementAssessment` (optional; enumeration): Replacement assessment. Original event remains unchanged.
- `replacementResponse` (optional; scalar): Replacement response. Original event remains unchanged.
- `provenance` (optional; array): Origin records. All references resolve.

### 2.24 Provenance

Provenance version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable provenance identity. Unique among provenance records.
- `kind` (required; enumeration): Origin kind. Does not imply truth or trust.
- `recordedAt` (required; scalar; semanticFormat): Record timestamp. RFC 3339 date-time.
- `agent` (optional; scalar): Human or software agent. Optional attribution.
- `citation` (optional; scalar): Citation. Portable source citation.
- `license` (optional; scalar): License expression. Optional rights information.
- `note` (optional; scalar): Origin note. Optional explanatory text.
- `sources` (optional; array): Prior provenance records. Forms append-only derivation chains.

### 2.25 Extension

Extension version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable extension identity. Names a capability.
- `version` (required; scalar): Extension version. Must be non-empty.
- `requirement` (required; enumeration): Requirement level. Required extensions need support.
- `fallback` (optional; scalar): Portable fallback. Required for optional extensions.

### 2.26 Migration

Migration version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable migration identity. Unique among migrations.
- `fromVersion` (required; scalar): Source version. Non-negative.
- `toVersion` (required; scalar): Target version. Positive and greater than source.
- `appliedAt` (required; scalar; semanticFormat): Application timestamp. RFC 3339 date-time.
- `tool` (required; scalar): Migration tool. Must be non-empty.
- `toolVersion` (required; scalar): Tool version. Must be non-empty.

### 2.27 InteroperabilityReport

InteroperabilityReport version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable report identity. Unique among reports.
- `sourceFormat` (required; scalar): Source format. Must be non-empty.
- `targetFormat` (required; scalar): Target format. Must be non-empty.
- `status` (required; enumeration): Conversion status. Lossy requires declared losses.
- `losses` (optional; array): Declared losses. Non-empty when status is lossy.
- `preservedArtifacts` (optional; array): Preserved original artifact IDs. Supports faithful round trips.

### 2.28 CorpusDocument

CorpusDocument version-1 wire object.

- `format` (required; literal): Format discriminator. Exactly lineage.corpus.
- `formatVersion` (required; literal; minimum): Wire version. Exactly numeric version one.
- `corpusId` (required; scalar): Stable corpus identity. Application ownership is external.
- `prompts` (required; array): Prompt revisions. Identity/revision keys are unique.
- `sources` (optional; array): Source revisions. Defaults to empty.
- `materials` (optional; array): Material revisions. Defaults to empty.
- `collections` (optional; array): Identity-neutral organization. Defaults to empty for backward compatibility.
- `collectionMemberships` (optional; array): Prompt membership in collections. Memories may belong to multiple collections.
- `readingSegments` (optional; array): Stable revision-bound reading segments. Defaults to empty for backward compatibility.
- `learningObservations` (optional; array): Append-only non-recall learning evidence. Defaults to empty; Repetitions remain recall-specific evidence.
- `assets` (optional; array): Asset declarations. Defaults to empty.
- `relationships` (optional; array): Typed relationships. Defaults to empty.
- `repetitions` (optional; array): Review history. Append-oriented.
- `repetitionCorrections` (optional; array): Correction history. Append-oriented.
- `provenance` (optional; array): Origin records. Defaults to empty.
- `extensions` (optional; array): Capability declarations. Defaults to empty.
- `migrations` (optional; array): Forward migration history. Defaults to empty.
- `interoperability` (optional; array): Conversion reports. Defaults to empty.

### 2.29 ArchiveEntry

ArchiveEntry version-1 wire object.

- `path` (required; scalar): Safe relative archive path. No absolute paths or traversal.
- `byteSize` (required; scalar): Exact byte count. Computed from actual bytes.
- `sha256` (required; scalar; regexPattern): Lowercase SHA-256 digest. Computed from actual bytes.
- `mediaType` (required; scalar): Entry media type. Must be non-empty.
- `role` (required; enumeration): Entry role. Determines closure requirements.
- `required` (required; scalar): Dependency requirement. Required entries must be present.

### 2.30 Manifest

Manifest version-1 wire object.

- `format` (required; literal): Manifest discriminator. Exactly lineage.manifest.
- `formatVersion` (required; literal; minimum): Manifest version. Exactly numeric version one.
- `corpusId` (required; scalar): Enclosed corpus identity. Must equal corpus document identity.
- `corpus` (required; scalar): Corpus entry path. Safe relative path, normally corpus.json.
- `corpusSha256` (required; scalar; regexPattern): Canonical corpus digest. Host-computed SHA-256.
- `createdAt` (required; scalar; semanticFormat): Archive creation timestamp. RFC 3339 date-time.
- `modifiedAt` (required; scalar; semanticFormat): Archive modification timestamp. RFC 3339 date-time.
- `requiredProfiles` (optional; array): Required presentation profiles. All must be supported.
- `requiredExtensions` (optional; array): Required archive extensions. All must be supported.
- `optionalExtensions` (optional; array): Optional archive extensions. Fallbacks preserve portability.
- `entries` (required; array): Integrity table. Paths are unique and every required dependency is present.

## 3. Semantic diagnostics and invariants

### 3.1 `structure.invalid`

**Severity:** error. **Applies to:** corpus.

Document does not match the version-1 wire shape. Required fields, tags, or value constraints are invalid.

### 3.2 `format.unsupported-version`

**Severity:** error. **Applies to:** corpus.

The format version is unsupported. Only version 1 is accepted.

### 3.3 `identity.empty`

**Severity:** error. **Applies to:** identity.

A stable identity is empty. All durable entity identities are non-empty.

### 3.4 `identity.duplicate`

**Severity:** error. **Applies to:** identity.

A stable entity identity is duplicated. Identity/revision keys and event identities are unique in their namespaces.

### 3.5 `identity.duplicate-prompt-revision`

**Severity:** error. **Applies to:** prompt.

A Prompt identity and revision are duplicated. Each immutable Prompt revision key occurs once.

### 3.6 `revision.non-positive`

**Severity:** error. **Applies to:** revision.

A revision is not positive. Version-1 revisions begin at one.

### 3.7 `reference.unresolved`

**Severity:** error. **Applies to:** reference.

A referenced entity is absent. All references resolve inside the local dependency closure.

### 3.8 `collection.unresolved`

**Severity:** error. **Applies to:** collection.

A collection membership references an absent collection. Membership collections resolve locally.

### 3.9 `collection.prompt-unresolved`

**Severity:** error. **Applies to:** collection.

A collection membership references an absent Prompt. Membership Prompts resolve locally by stable identity.

### 3.10 `collection.parent-unresolved`

**Severity:** error. **Applies to:** collection.

A collection parent is absent. Parent collections resolve locally.

### 3.11 `collection.parent-cycle`

**Severity:** error. **Applies to:** collection.

Collection parent links form a cycle. Collection nesting is acyclic.

### 3.12 `collection.duplicate-membership`

**Severity:** error. **Applies to:** collection.

A Prompt membership is duplicated. Each collection and Prompt pair occurs at most once.

### 3.13 `disclosure.withheld-empty`

**Severity:** error. **Applies to:** prompt.

A Prompt has no withheld material. Every active-recall Prompt conceals at least one answer.

### 3.14 `disclosure.answer-leaked`

**Severity:** error. **Applies to:** prompt.

Challenge content contains withheld material. No withheld answer may appear in challenge or accessible fallback content.

### 3.15 `disclosure.answer-missing`

**Severity:** error. **Applies to:** prompt.

Resolution omits withheld material. Every withheld item appears in the resolution.

### 3.16 `response.invalid-self-check`

**Severity:** error. **Applies to:** prompt.

Self-check response configuration is invalid. Self-check mode uses capture none.

### 3.17 `cloze.targets-required`

**Severity:** error. **Applies to:** prompt.

A cloze Prompt has no targets. Cloze Prompts require stable targets.

### 3.18 `occlusion.source-required`

**Severity:** error. **Applies to:** prompt.

Image occlusion has no source asset. Image occlusion requires a declared image asset.

### 3.19 `occlusion.regions-required`

**Severity:** error. **Applies to:** prompt.

Image occlusion has no regions. At least one stable normalized region is required.

### 3.20 `asset.unresolved`

**Severity:** error. **Applies to:** asset.

A Prompt references an undeclared asset. Asset references resolve in the corpus.

### 3.21 `asset.integrity-host-required`

**Severity:** error. **Applies to:** asset.

Media integrity is not host-established. AI must not invent bytes, sizes, or digests.

### 3.22 `asset.path-unsafe`

**Severity:** error. **Applies to:** asset.

An asset path is unsafe. Paths are relative, normalized, unique, and cannot traverse.

### 3.23 `history.prompt-unresolved`

**Severity:** error. **Applies to:** repetition.

A repetition references an absent Prompt revision. History resolves to exact served Prompt revisions.

### 3.24 `history.correction-invalid`

**Severity:** error. **Applies to:** correction.

A correction target is missing or self-referential. Corrections are distinct append-only events.

### 3.25 `reading.segment-owner-unresolved`

**Severity:** error. **Applies to:** reading.

A reading segment owner revision is absent. Segments bind an exact Source or Material revision.

### 3.26 `reading.segment-content-empty`

**Severity:** error. **Applies to:** reading.

A reading segment has no durable content. Stable segments contain at least one content block.

### 3.27 `evidence.target-unresolved`

**Severity:** error. **Applies to:** evidence.

A learning observation target is absent or malformed. Evidence resolves to an exact durable learning target.

### 3.28 `evidence.replay-invalid`

**Severity:** error. **Applies to:** evidence.

Learning evidence cannot be replayed deterministically. Every observation carries a replay timestamp; hosts declare merge ordering.

### 3.29 `migration.chain-invalid`

**Severity:** error. **Applies to:** migration.

Migration history is not forward and contiguous. Each step starts at the preceding version and advances.

### 3.30 `extension.required-unsupported`

**Severity:** error. **Applies to:** extension.

A required extension is unsupported. Required capabilities must be understood by the renderer.

### 3.31 `extension.optional-fallback-missing`

**Severity:** error. **Applies to:** extension.

An optional extension lacks a fallback. Portable fallback content keeps the Prompt reviewable.

### 3.32 `interoperability.loss-unreported`

**Severity:** error. **Applies to:** interoperability.

A lossy conversion has no loss report. Losses must be explicit and inspectable.

### 3.33 `manifest.corpus-mismatch`

**Severity:** error. **Applies to:** manifest.

Manifest and corpus identities differ. The archive manifest names the enclosed corpus.

### 3.34 `archive.entry-missing`

**Severity:** error. **Applies to:** archive.

A declared archive entry is missing. All manifest entries must have actual bytes.

### 3.35 `archive.digest-mismatch`

**Severity:** error. **Applies to:** archive.

Archive entry digest does not match bytes. Hosts compute and verify SHA-256 over actual bytes.

### 3.36 `archive.duplicate-path`

**Severity:** error. **Applies to:** archive.

Archive paths are duplicated. Each normalized entry path occurs once.

## 4. Generated examples

- `basic.json`: Basic self-check Prompt. (valid)
- `collections.json`: Nested identity-neutral Prompt organization. (valid)
- `cloze.json`: Stable cloze targets. (valid)
- `image-occlusion.json`: Normalized stable regions. (host-media-required)
- `media.json`: Host-verified media reference. (host-media-required)
