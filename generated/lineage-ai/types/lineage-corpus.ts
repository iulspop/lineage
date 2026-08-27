// Generated from Lineage.Specification.CorpusWireV1. Do not edit.

/** ResponseInteraction version-1 wire object. */
export interface ResponseInteraction {
  /** Review response interaction. Use text capture or explicit self-check/no-capture. */
  "mode": "text" | SelfCheckResponse

}

/** SelfCheckResponse version-1 wire object. */
export interface SelfCheckResponse {
  /** Self-check discriminator. Requires capture none. */
  "mode": "self-check"
  /** No response capture. The learner reveals and rates without typed capture. */
  "capture": "none"

}

/** EntityReference version-1 wire object. */
export interface EntityReference {
  /** Referenced stable identity. Must resolve in the referenced namespace. */
  "id": string
  /** Optional exact revision. When present it must be positive and resolve exactly. */
  "revision"?: number

}

/** ClozeTarget version-1 wire object. */
export interface ClozeTarget {
  /** Stable cloze-target identity. Independent of marker order and wording. */
  "id": string
  /** Withheld target answer. Must be disclosed after reveal. */
  "answer": string
  /** Optional hints. Hints must not leak the answer. */
  "hints"?: Array<string>

}

/** NormalizedPoint version-1 wire object. */
export interface NormalizedPoint {
  /** Normalized horizontal coordinate. Inclusive range zero through one. */
  "x": number
  /** Normalized vertical coordinate. Inclusive range zero through one. */
  "y": number

}

/** RectangleGeometry version-1 wire object. */
export interface RectangleGeometry {
  /** Geometry discriminator. Selects normalized rectangle fields. */
  "type": "rectangle"
  /** Left coordinate. Inclusive range zero through one. */
  "x": number
  /** Top coordinate. Inclusive range zero through one. */
  "y": number
  /** Normalized width. Greater than zero and at most one. */
  "width": number
  /** Normalized height. Greater than zero and at most one. */
  "height": number

}

/** PolygonGeometry version-1 wire object. */
export interface PolygonGeometry {
  /** Geometry discriminator. Selects polygon points. */
  "type": "polygon"
  /** Normalized polygon vertices. At least three points. */
  "points": Array<NormalizedPoint>

}

/** OcclusionRegion version-1 wire object. */
export interface OcclusionRegion {
  /** Stable region identity. Geometry changes do not change identity. */
  "id": string
  /** Human-readable region label. Must be non-empty. */
  "label": string
  /** Accessible equivalent. Must describe the concealed region without leaking its answer. */
  "accessibleDescription": string
  /** Normalized geometry. Rectangle or polygon with coordinates from zero through one. */
  "geometry": RectangleGeometry | PolygonGeometry

}

/** Source version-1 wire object. */
export interface Source {
  /** Stable Source identity. Pairs with revision. */
  "id": string
  /** Positive immutable revision. Starts at one. */
  "revision": number
  /** Source title. Must be non-empty. */
  "title": string
  /** Source content. Portable non-executable text. */
  "content": string
  /** Referenced assets. All references resolve locally. */
  "assets"?: Array<string>
  /** Origin records. All references resolve locally. */
  "provenance"?: Array<string>

}

/** Material version-1 wire object. */
export interface Material {
  /** Stable Material identity. Pairs with revision. */
  "id": string
  /** Positive immutable revision. Starts at one. */
  "revision": number
  /** Structured portable content. Ordered content blocks. */
  "content": Array<string>
  /** Source references. All references resolve. */
  "sources"?: Array<string>
  /** Asset references. All references resolve. */
  "assets"?: Array<string>
  /** Origin records. All references resolve. */
  "provenance"?: Array<string>

}

/** Collection version-1 wire object. */
export interface Collection {
  /** Stable collection identity. Organization never changes Prompt identity or review history. */
  "id": string
  /** Human-readable collection title. Titles need not be unique. */
  "title": string
  /** Optional collection description. Describes the organizational view. */
  "description"?: string
  /** Optional parent collection. Must resolve and must not introduce a cycle. */
  "parentId"?: string

}

/** CollectionMembership version-1 wire object. */
export interface CollectionMembership {
  /** Containing collection. Must resolve locally. */
  "collectionId": string
  /** Organized Prompt identity. Membership does not partition scheduling. */
  "promptId": string

}

/** Asset version-1 wire object. */
export interface Asset {
  /** Stable asset identity. Referenced by Prompts, Sources, and Materials. */
  "id": string
  /** IANA media type. Must be non-empty. */
  "mediaType": string
  /** Exact byte count. Computed by the host from actual bytes. */
  "byteSize": number
  /** Lowercase SHA-256 digest. Exactly 64 hexadecimal characters, host-computed. */
  "sha256": string
  /** Safe archive-relative path. Must begin assets/ and cannot traverse. */
  "path": string
  /** Accessible media equivalent. Required when media conveys review meaning. */
  "accessibleDescription"?: string

}

/** ExtensionSet version-1 wire object. */
export interface ExtensionSet {
  /** Required extensions. Renderer support is mandatory. */
  "required"?: Array<string>
  /** Optional extensions. Portable fallback is mandatory. */
  "optional"?: Array<string>

}

/** Prompt version-1 wire object. */
export interface Prompt {
  /** Stable Prompt identity. One independently scheduled recall stream. */
  "id": string
  /** Positive immutable revision. Repetitions bind to this exact revision. */
  "revision": number
  /** Lifecycle status. Defaults to active. */
  "status"?: "active" | "suspended" | "retired"
  /** Prompt kind. Defaults to basic. */
  "kind"?: "basic" | "cloze" | "image-occlusion"
  /** Pre-disclosure content. Must not reveal withheld material. */
  "challenge": Array<string>
  /** Concealed answer material. Non-empty and fully disclosed by resolution. */
  "withheld": Array<string>
  /** Post-disclosure content. Contains every withheld item. */
  "resolution": Array<string>
  /** Response policy. Typed capture or self-check/no-capture. */
  "response": "text" | SelfCheckResponse
  /** Material references. All resolve locally. */
  "materials"?: Array<string>
  /** Source references. All resolve locally. */
  "sources"?: Array<string>
  /** Asset references. All resolve to archive bytes when exporting. */
  "assets"?: Array<string>
  /** Stable cloze targets. Required for cloze Prompts. */
  "clozeTargets"?: Array<ClozeTarget>
  /** Occlusion source image. Required for image occlusion. */
  "sourceAsset"?: string
  /** Stable occlusion regions. Required and non-empty for image occlusion. */
  "occlusionRegions"?: Array<OcclusionRegion>
  /** Presentation contract version. Defaults to lineage.review/1. */
  "presentationProfile"?: string
  /** Prompt extension requirements. Required and optional capabilities are explicit. */
  "extensions"?: ExtensionSet
  /** Origin records. All references resolve. */
  "provenance"?: Array<string>

}

/** Relationship version-1 wire object. */
export interface Relationship {
  /** Stable relationship identity. Unique among relationships. */
  "id": string
  /** Relationship kind. Does not merge endpoint identities. */
  "kind": "prerequisite" | "related" | "derived-from" | "sibling" | "duplicate-of"
  /** Source endpoint. Must resolve. */
  "source": EntityReference
  /** Target endpoint. Must resolve. */
  "target": EntityReference

}

/** SchedulerObservation version-1 wire object. */
export interface SchedulerObservation {
  /** Scheduler family. For example fsrs. */
  "family": string
  /** Scheduler/model version. Must be explicit. */
  "version": string
  /** Parameter-set SHA-256. Fingerprints exact parameters. */
  "parameterDigest"?: string
  /** Previous interval. Historical observation. */
  "previousIntervalMinutes"?: number
  /** Resulting interval. Historical observation. */
  "nextIntervalMinutes"?: number
  /** Resulting due timestamp. Derived state captured for audit. */
  "dueAt"?: string

}

/** Repetition version-1 wire object. */
export interface Repetition {
  /** Stable event identity. Append-only and unique. */
  "id": string
  /** Served Prompt identity. Must resolve with promptRevision. */
  "promptId": string
  /** Served Prompt revision. Positive and exact. */
  "promptRevision": number
  /** Served corpus snapshot digest. SHA-256 when present. */
  "snapshotDigest"?: string
  /** Served presentation digest. SHA-256 when present. */
  "presentationDigest"?: string
  /** Review timestamp. RFC 3339 date-time. */
  "reviewedAt": string
  /** Review duration. Non-negative. */
  "durationMilliseconds"?: number
  /** Captured learner response. Absent for self-check/no-capture. */
  "capturedResponse"?: string
  /** Learner assessment. One of four scheduler-neutral ratings. */
  "assessment": "again" | "hard" | "good" | "easy"
  /** Historical scheduler observation. Replaceable current state is not corpus meaning. */
  "scheduler"?: SchedulerObservation
  /** Origin records. All references resolve. */
  "provenance"?: Array<string>

}

/** RepetitionCorrection version-1 wire object. */
export interface RepetitionCorrection {
  /** Stable correction identity. Distinct from target. */
  "id": string
  /** Corrected event. Must resolve and cannot self-target. */
  "targetRepetitionId": string
  /** Correction timestamp. RFC 3339 date-time. */
  "correctedAt": string
  /** Correction reason. Must be non-empty. */
  "reason": string
  /** Replacement assessment. Original event remains unchanged. */
  "replacementAssessment"?: "again" | "hard" | "good" | "easy"
  /** Replacement response. Original event remains unchanged. */
  "replacementResponse"?: string
  /** Origin records. All references resolve. */
  "provenance"?: Array<string>

}

/** Provenance version-1 wire object. */
export interface Provenance {
  /** Stable provenance identity. Unique among provenance records. */
  "id": string
  /** Origin kind. Does not imply truth or trust. */
  "kind": "authored" | "imported" | "cited" | "derived" | "corrected"
  /** Record timestamp. RFC 3339 date-time. */
  "recordedAt": string
  /** Human or software agent. Optional attribution. */
  "agent"?: string
  /** Citation. Portable source citation. */
  "citation"?: string
  /** License expression. Optional rights information. */
  "license"?: string
  /** Origin note. Optional explanatory text. */
  "note"?: string
  /** Prior provenance records. Forms append-only derivation chains. */
  "sources"?: Array<string>

}

/** Extension version-1 wire object. */
export interface Extension {
  /** Stable extension identity. Names a capability. */
  "id": string
  /** Extension version. Must be non-empty. */
  "version": string
  /** Requirement level. Required extensions need support. */
  "requirement": "required" | "optional"
  /** Portable fallback. Required for optional extensions. */
  "fallback"?: string

}

/** Migration version-1 wire object. */
export interface Migration {
  /** Stable migration identity. Unique among migrations. */
  "id": string
  /** Source version. Non-negative. */
  "fromVersion": number
  /** Target version. Positive and greater than source. */
  "toVersion": number
  /** Application timestamp. RFC 3339 date-time. */
  "appliedAt": string
  /** Migration tool. Must be non-empty. */
  "tool": string
  /** Tool version. Must be non-empty. */
  "toolVersion": string

}

/** InteroperabilityReport version-1 wire object. */
export interface InteroperabilityReport {
  /** Stable report identity. Unique among reports. */
  "id": string
  /** Source format. Must be non-empty. */
  "sourceFormat": string
  /** Target format. Must be non-empty. */
  "targetFormat": string
  /** Conversion status. Lossy requires declared losses. */
  "status": "exact" | "lossy"
  /** Declared losses. Non-empty when status is lossy. */
  "losses"?: Array<string>
  /** Preserved original artifact IDs. Supports faithful round trips. */
  "preservedArtifacts"?: Array<string>

}

/** CorpusDocument version-1 wire object. */
export interface CorpusDocument {
  /** Format discriminator. Exactly lineage.corpus. */
  "format": "lineage.corpus"
  /** Wire version. Exactly numeric version one. */
  "formatVersion": 1
  /** Stable corpus identity. Application ownership is external. */
  "corpusId": string
  /** Prompt revisions. Identity/revision keys are unique. */
  "prompts": Array<Prompt>
  /** Source revisions. Defaults to empty. */
  "sources"?: Array<Source>
  /** Material revisions. Defaults to empty. */
  "materials"?: Array<Material>
  /** Identity-neutral organization. Defaults to empty for backward compatibility. */
  "collections"?: Array<Collection>
  /** Prompt membership in collections. Memories may belong to multiple collections. */
  "collectionMemberships"?: Array<CollectionMembership>
  /** Asset declarations. Defaults to empty. */
  "assets"?: Array<Asset>
  /** Typed relationships. Defaults to empty. */
  "relationships"?: Array<Relationship>
  /** Review history. Append-oriented. */
  "repetitions"?: Array<Repetition>
  /** Correction history. Append-oriented. */
  "repetitionCorrections"?: Array<RepetitionCorrection>
  /** Origin records. Defaults to empty. */
  "provenance"?: Array<Provenance>
  /** Capability declarations. Defaults to empty. */
  "extensions"?: Array<Extension>
  /** Forward migration history. Defaults to empty. */
  "migrations"?: Array<Migration>
  /** Conversion reports. Defaults to empty. */
  "interoperability"?: Array<InteroperabilityReport>

}

/** ArchiveEntry version-1 wire object. */
export interface ArchiveEntry {
  /** Safe relative archive path. No absolute paths or traversal. */
  "path": string
  /** Exact byte count. Computed from actual bytes. */
  "byteSize": number
  /** Lowercase SHA-256 digest. Computed from actual bytes. */
  "sha256": string
  /** Entry media type. Must be non-empty. */
  "mediaType": string
  /** Entry role. Determines closure requirements. */
  "role": "corpus" | "asset" | "preserved-original"
  /** Dependency requirement. Required entries must be present. */
  "required": boolean

}

/** Manifest version-1 wire object. */
export interface Manifest {
  /** Manifest discriminator. Exactly lineage.manifest. */
  "format": "lineage.manifest"
  /** Manifest version. Exactly numeric version one. */
  "formatVersion": 1
  /** Enclosed corpus identity. Must equal corpus document identity. */
  "corpusId": string
  /** Corpus entry path. Safe relative path, normally corpus.json. */
  "corpus": string
  /** Canonical corpus digest. Host-computed SHA-256. */
  "corpusSha256": string
  /** Archive creation timestamp. RFC 3339 date-time. */
  "createdAt": string
  /** Archive modification timestamp. RFC 3339 date-time. */
  "modifiedAt": string
  /** Required presentation profiles. All must be supported. */
  "requiredProfiles"?: Array<string>
  /** Required archive extensions. All must be supported. */
  "requiredExtensions"?: Array<string>
  /** Optional archive extensions. Fallbacks preserve portability. */
  "optionalExtensions"?: Array<string>
  /** Integrity table. Paths are unique and every required dependency is present. */
  "entries": Array<ArchiveEntry>

}
