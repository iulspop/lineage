# Version-1 corpus wire model

Version 1 is the canonical JSON boundary used for corpus authoring, durable
exchange, and `.lineage` archives. The wire model deliberately includes the
facts required to preserve meaning across applications: stable identities and
revisions, Prompt review contracts, reusable materials and sources, assets,
relationships, append-oriented repetition and correction history, provenance,
migrations, extension declarations, interoperability reports, and archive
integrity. Derived scheduler state and application ownership are not corpus
meaning.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.CorpusWireV1 where

open import Agda.Builtin.Float using (Float)
open import Data.Bool.Base using (Bool)
open import Data.List.Base using (List; []; _∷_)
open import Data.Maybe.Base using (Maybe)
open import Data.Nat.Base using (ℕ)
open import Data.String.Base using (String)
open import Lineage.Specification.FormatDescription

data PromptKind : Set where
  basic cloze imageOcclusion : PromptKind

data Lifecycle : Set where
  active suspended retired : Lifecycle

data RequirementLevel : Set where
  requiredCapability optionalCapability : RequirementLevel

data RelationshipKind : Set where
  prerequisite related derivedFrom sibling duplicateOf : RelationshipKind

data RepetitionRating : Set where
  again hard good easy : RepetitionRating

data ProvenanceKind : Set where
  authored imported cited derived corrected : ProvenanceKind

data ConversionStatus : Set where
  exact lossy : ConversionStatus

data ArchiveEntryRole : Set where
  corpus asset preserved-original : ArchiveEntryRole

data ResponseInteraction : Set where
  textResponse selfCheckResponse : ResponseInteraction

record EntityReference : Set where
  constructor entityReference
  field
    referenceId : String
    referenceRevision : Maybe ℕ

record ExtensionSet : Set where
  constructor extensionSet
  field
    requiredExtensions optionalExtensions : List String

record NormalizedPoint : Set where
  constructor normalizedPoint
  field
    x y : Float

record RectangleGeometry : Set where
  constructor rectangleGeometry
  field
    x y width height : Float

record PolygonGeometry : Set where
  constructor polygonGeometry
  field
    points : List NormalizedPoint

data OcclusionGeometry : Set where
  rectangleGeometryValue : RectangleGeometry → OcclusionGeometry
  polygonGeometryValue : PolygonGeometry → OcclusionGeometry

record AssetReference : Set where
  constructor assetReference
  field
    assetId mediaType sha256 : String
    byteSize : ℕ
    path : String
    accessibleDescription : Maybe String

record ClozeTarget : Set where
  constructor clozeTarget
  field
    targetId answer : String
    hints : Maybe (List String)

record OcclusionRegion : Set where
  constructor occlusionRegion
  field
    regionId label : String
    geometry : OcclusionGeometry
    accessibleDescription : String

record SourceRevision : Set where
  constructor sourceRevision
  field
    sourceId : String
    revision : ℕ
    title content : String
    assetIds provenanceIds : List String

record MaterialRevision : Set where
  constructor materialRevision
  field
    materialId : String
    revision : ℕ
    content : List String
    sourceIds assetIds provenanceIds : List String

record Prompt : Set where
  constructor prompt
  field
    promptId : String
    revision : ℕ
    lifecycle : Lifecycle
    kind : PromptKind
    challenge withheld resolution : List String
    response : ResponseInteraction
    materialIds sourceIds assetIds : List String
    clozeTargets : Maybe (List ClozeTarget)
    sourceAsset : Maybe String
    occlusionRegions : Maybe (List OcclusionRegion)
    presentationProfile : String
    extensions : ExtensionSet
    provenanceIds : List String

record SchedulerObservation : Set where
  constructor schedulerObservation
  field
    family version : String
    parameterDigest : Maybe String
    previousIntervalMinutes nextIntervalMinutes : Maybe ℕ
    dueAt : Maybe String

record Repetition : Set where
  constructor repetition
  field
    repetitionId promptId : String
    promptRevision : ℕ
    snapshotDigest presentationDigest : Maybe String
    reviewedAt : String
    durationMilliseconds : Maybe ℕ
    capturedResponse : Maybe String
    rating : RepetitionRating
    scheduler : Maybe SchedulerObservation
    provenanceIds : List String

record RepetitionCorrection : Set where
  constructor repetitionCorrection
  field
    correctionId targetRepetitionId : String
    correctedAt : String
    reason : String
    replacementRating : Maybe RepetitionRating
    replacementResponse : Maybe String
    provenanceIds : List String

record Relationship : Set where
  constructor relationship
  field
    relationshipId : String
    kind : RelationshipKind
    source target : EntityReference

record ProvenanceRecord : Set where
  constructor provenanceRecord
  field
    provenanceId : String
    kind : ProvenanceKind
    recordedAt : String
    agent citation license note : Maybe String
    sourceProvenanceIds : List String

record ExtensionDeclaration : Set where
  constructor extensionDeclaration
  field
    extensionId version : String
    requirement : RequirementLevel
    fallback : Maybe String

record MigrationRecord : Set where
  constructor migrationRecord
  field
    migrationId : String
    fromVersion toVersion : ℕ
    appliedAt : String
    tool toolVersion : String

record InteroperabilityReport : Set where
  constructor interoperabilityReport
  field
    reportId sourceFormat targetFormat : String
    status : ConversionStatus
    losses : List String
    preservedArtifactIds : List String

record ArchiveEntry : Set where
  constructor archiveEntry
  field
    path : String
    byteSize : ℕ
    sha256 mediaType : String
    role : ArchiveEntryRole
    entryRequired : Bool

record Manifest : Set where
  constructor manifest
  field
    manifestFormat : String
    manifestVersion : ℕ
    corpusId : String
    corpusPath corpusSha256 : String
    createdAt modifiedAt : String
    requiredProfiles : List String
    requiredExtensions optionalExtensions : List String
    archiveEntries : List ArchiveEntry

record CorpusDocument : Set where
  constructor corpusDocument
  field
    corpusFormat : String
    corpusFormatVersion : ℕ
    corpusId : String
    prompts : List Prompt
    sources : List SourceRevision
    materials : List MaterialRevision
    assets : List AssetReference
    relationships : List Relationship
    repetitions : List Repetition
    repetitionCorrections : List RepetitionCorrection
    provenance : List ProvenanceRecord
    extensions : List ExtensionDeclaration
    migrations : List MigrationRecord
    interoperability : List InteroperabilityReport

responseInteractionFields : List Field
responseInteractionFields =
  describeField "mode" required (alternatives (literal "text" ∷ objectRef "SelfCheckResponse" ∷ []))
    "Review response interaction." "Use text capture or explicit self-check/no-capture." ∷ []

selfCheckResponseFields : List Field
selfCheckResponseFields =
  describeField "mode" required (literal "self-check")
    "Self-check discriminator." "Requires capture none." ∷
  describeField "capture" required (literal "none")
    "No response capture." "The learner reveals and rates without typed capture." ∷ []

entityReferenceFields : List Field
entityReferenceFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Referenced stable identity." "Must resolve in the referenced namespace." ∷
  describeField "revision" optional (scalar natural)
    "Optional exact revision." "When present it must be positive and resolve exactly." ∷ []

clozeTargetFields : List Field
clozeTargetFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable cloze-target identity." "Independent of marker order and wording." ∷
  describeField "answer" required (scalar text)
    "Withheld target answer." "Must be disclosed after reveal." ∷
  describeDefaultedField "hints" optional (array (scalar text)) defaultEmptyArray
    "Optional hints." "Hints must not leak the answer." ∷ []

normalizedPointFields : List Field
normalizedPointFields =
  describeConstrainedField "x" required (scalar normalizedCoordinate) (maximum 1 ∷ []) noDefault
    "Normalized horizontal coordinate." "Inclusive range zero through one." ∷
  describeConstrainedField "y" required (scalar normalizedCoordinate) (maximum 1 ∷ []) noDefault
    "Normalized vertical coordinate." "Inclusive range zero through one." ∷ []

rectangleGeometryFields : List Field
rectangleGeometryFields =
  describeField "type" required (literal "rectangle")
    "Geometry discriminator." "Selects normalized rectangle fields." ∷
  describeConstrainedField "x" required (scalar normalizedCoordinate) (maximum 1 ∷ []) noDefault
    "Left coordinate." "Inclusive range zero through one." ∷
  describeConstrainedField "y" required (scalar normalizedCoordinate) (maximum 1 ∷ []) noDefault
    "Top coordinate." "Inclusive range zero through one." ∷
  describeConstrainedField "width" required (scalar normalizedCoordinate) (minimum 1 ∷ maximum 1 ∷ []) noDefault
    "Normalized width." "Greater than zero and at most one." ∷
  describeConstrainedField "height" required (scalar normalizedCoordinate) (minimum 1 ∷ maximum 1 ∷ []) noDefault
    "Normalized height." "Greater than zero and at most one." ∷ []

polygonGeometryFields : List Field
polygonGeometryFields =
  describeField "type" required (literal "polygon")
    "Geometry discriminator." "Selects polygon points." ∷
  describeField "points" required (array (objectRef "NormalizedPoint"))
    "Normalized polygon vertices." "At least three points." ∷ []

occlusionRegionFields : List Field
occlusionRegionFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable region identity." "Geometry changes do not change identity." ∷
  describeField "label" required (scalar text)
    "Human-readable region label." "Must be non-empty." ∷
  describeField "accessibleDescription" required (scalar text)
    "Accessible equivalent." "Must describe the concealed region without leaking its answer." ∷
  describeField "geometry" required (taggedChoice "type" ("RectangleGeometry" ∷ "PolygonGeometry" ∷ []))
    "Normalized geometry." "Rectangle or polygon with coordinates from zero through one." ∷ []

sourceFields : List Field
sourceFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable Source identity." "Pairs with revision." ∷
  describeConstrainedField "revision" required (scalar natural) (minimum 1 ∷ []) noDefault
    "Positive immutable revision." "Starts at one." ∷
  describeField "title" required (scalar text)
    "Source title." "Must be non-empty." ∷
  describeField "content" required (scalar text)
    "Source content." "Portable non-executable text." ∷
  describeDefaultedField "assets" optional (array (reference "Asset")) defaultEmptyArray
    "Referenced assets." "All references resolve locally." ∷
  describeDefaultedField "provenance" optional (array (reference "Provenance")) defaultEmptyArray
    "Origin records." "All references resolve locally." ∷ []

materialFields : List Field
materialFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable Material identity." "Pairs with revision." ∷
  describeConstrainedField "revision" required (scalar natural) (minimum 1 ∷ []) noDefault
    "Positive immutable revision." "Starts at one." ∷
  describeField "content" required (array (scalar text))
    "Structured portable content." "Ordered content blocks." ∷
  describeDefaultedField "sources" optional (array (reference "Source")) defaultEmptyArray
    "Source references." "All references resolve." ∷
  describeDefaultedField "assets" optional (array (reference "Asset")) defaultEmptyArray
    "Asset references." "All references resolve." ∷
  describeDefaultedField "provenance" optional (array (reference "Provenance")) defaultEmptyArray
    "Origin records." "All references resolve." ∷ []

assetFields : List Field
assetFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable asset identity." "Referenced by Prompts, Sources, and Materials." ∷
  describeField "mediaType" required (scalar text)
    "IANA media type." "Must be non-empty." ∷
  describeField "byteSize" required (scalar natural)
    "Exact byte count." "Computed by the host from actual bytes." ∷
  describeConstrainedField "sha256" required (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Lowercase SHA-256 digest." "Exactly 64 hexadecimal characters, host-computed." ∷
  describeField "path" required (scalar text)
    "Safe archive-relative path." "Must begin assets/ and cannot traverse." ∷
  describeField "accessibleDescription" optional (scalar text)
    "Accessible media equivalent." "Required when media conveys review meaning." ∷ []

extensionSetFields : List Field
extensionSetFields =
  describeField "required" optional (array (reference "Extension"))
    "Required extensions." "Renderer support is mandatory." ∷
  describeField "optional" optional (array (reference "Extension"))
    "Optional extensions." "Portable fallback is mandatory." ∷ []

promptFields : List Field
promptFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable Prompt identity." "One independently scheduled recall stream." ∷
  describeConstrainedField "revision" required (scalar natural) (minimum 1 ∷ []) noDefault
    "Positive immutable revision." "Repetitions bind to this exact revision." ∷
  describeField "status" optional (enumeration ("active" ∷ "suspended" ∷ "retired" ∷ []))
    "Lifecycle status." "Defaults to active." ∷
  describeField "kind" optional (enumeration ("basic" ∷ "cloze" ∷ "image-occlusion" ∷ []))
    "Prompt kind." "Defaults to basic." ∷
  describeField "challenge" required (array (scalar text))
    "Pre-disclosure content." "Must not reveal withheld material." ∷
  describeField "withheld" required (array (scalar text))
    "Concealed answer material." "Non-empty and fully disclosed by resolution." ∷
  describeField "resolution" required (array (scalar text))
    "Post-disclosure content." "Contains every withheld item." ∷
  describeField "response" required (alternatives (literal "text" ∷ objectRef "SelfCheckResponse" ∷ []))
    "Response policy." "Typed capture or self-check/no-capture." ∷
  describeDefaultedField "materials" optional (array (reference "Material")) defaultEmptyArray
    "Material references." "All resolve locally." ∷
  describeDefaultedField "sources" optional (array (reference "Source")) defaultEmptyArray
    "Source references." "All resolve locally." ∷
  describeDefaultedField "assets" optional (array (reference "Asset")) defaultEmptyArray
    "Asset references." "All resolve to archive bytes when exporting." ∷
  describeField "clozeTargets" optional (array (objectRef "ClozeTarget"))
    "Stable cloze targets." "Required for cloze Prompts." ∷
  describeField "sourceAsset" optional (reference "Asset")
    "Occlusion source image." "Required for image occlusion." ∷
  describeField "occlusionRegions" optional (array (objectRef "OcclusionRegion"))
    "Stable occlusion regions." "Required and non-empty for image occlusion." ∷
  describeField "presentationProfile" optional (scalar text)
    "Presentation contract version." "Defaults to lineage.review/1." ∷
  describeField "extensions" optional (objectRef "ExtensionSet")
    "Prompt extension requirements." "Required and optional capabilities are explicit." ∷
  describeDefaultedField "provenance" optional (array (reference "Provenance")) defaultEmptyArray
    "Origin records." "All references resolve." ∷ []

relationshipFields : List Field
relationshipFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable relationship identity." "Unique among relationships." ∷
  describeField "kind" required (enumeration ("prerequisite" ∷ "related" ∷ "derived-from" ∷ "sibling" ∷ "duplicate-of" ∷ []))
    "Relationship kind." "Does not merge endpoint identities." ∷
  describeField "source" required (objectRef "EntityReference")
    "Source endpoint." "Must resolve." ∷
  describeField "target" required (objectRef "EntityReference")
    "Target endpoint." "Must resolve." ∷ []

schedulerObservationFields : List Field
schedulerObservationFields =
  describeField "family" required (scalar text)
    "Scheduler family." "For example fsrs." ∷
  describeField "version" required (scalar text)
    "Scheduler/model version." "Must be explicit." ∷
  describeConstrainedField "parameterDigest" optional (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Parameter-set SHA-256." "Fingerprints exact parameters." ∷
  describeField "previousIntervalMinutes" optional (scalar natural)
    "Previous interval." "Historical observation." ∷
  describeField "nextIntervalMinutes" optional (scalar natural)
    "Resulting interval." "Historical observation." ∷
  describeConstrainedField "dueAt" optional (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Resulting due timestamp." "Derived state captured for audit." ∷ []

repetitionFields : List Field
repetitionFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable event identity." "Append-only and unique." ∷
  describeField "promptId" required (reference "Prompt")
    "Served Prompt identity." "Must resolve with promptRevision." ∷
  describeConstrainedField "promptRevision" required (scalar natural) (minimum 1 ∷ []) noDefault
    "Served Prompt revision." "Positive and exact." ∷
  describeConstrainedField "snapshotDigest" optional (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Served corpus snapshot digest." "SHA-256 when present." ∷
  describeConstrainedField "presentationDigest" optional (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Served presentation digest." "SHA-256 when present." ∷
  describeConstrainedField "reviewedAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Review timestamp." "RFC 3339 date-time." ∷
  describeField "durationMilliseconds" optional (scalar natural)
    "Review duration." "Non-negative." ∷
  describeField "capturedResponse" optional (scalar text)
    "Captured learner response." "Absent for self-check/no-capture." ∷
  describeField "assessment" required (enumeration ("again" ∷ "hard" ∷ "good" ∷ "easy" ∷ []))
    "Learner assessment." "One of four scheduler-neutral ratings." ∷
  describeField "scheduler" optional (objectRef "SchedulerObservation")
    "Historical scheduler observation." "Replaceable current state is not corpus meaning." ∷
  describeDefaultedField "provenance" optional (array (reference "Provenance")) defaultEmptyArray
    "Origin records." "All references resolve." ∷ []

repetitionCorrectionFields : List Field
repetitionCorrectionFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable correction identity." "Distinct from target." ∷
  describeField "targetRepetitionId" required (reference "Repetition")
    "Corrected event." "Must resolve and cannot self-target." ∷
  describeConstrainedField "correctedAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Correction timestamp." "RFC 3339 date-time." ∷
  describeField "reason" required (scalar text)
    "Correction reason." "Must be non-empty." ∷
  describeField "replacementAssessment" optional (enumeration ("again" ∷ "hard" ∷ "good" ∷ "easy" ∷ []))
    "Replacement assessment." "Original event remains unchanged." ∷
  describeField "replacementResponse" optional (scalar text)
    "Replacement response." "Original event remains unchanged." ∷
  describeDefaultedField "provenance" optional (array (reference "Provenance")) defaultEmptyArray
    "Origin records." "All references resolve." ∷ []

provenanceFields : List Field
provenanceFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable provenance identity." "Unique among provenance records." ∷
  describeField "kind" required (enumeration ("authored" ∷ "imported" ∷ "cited" ∷ "derived" ∷ "corrected" ∷ []))
    "Origin kind." "Does not imply truth or trust." ∷
  describeConstrainedField "recordedAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Record timestamp." "RFC 3339 date-time." ∷
  describeField "agent" optional (scalar text)
    "Human or software agent." "Optional attribution." ∷
  describeField "citation" optional (scalar text)
    "Citation." "Portable source citation." ∷
  describeField "license" optional (scalar text)
    "License expression." "Optional rights information." ∷
  describeField "note" optional (scalar text)
    "Origin note." "Optional explanatory text." ∷
  describeDefaultedField "sources" optional (array (reference "Provenance")) defaultEmptyArray
    "Prior provenance records." "Forms append-only derivation chains." ∷ []

extensionFields : List Field
extensionFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable extension identity." "Names a capability." ∷
  describeField "version" required (scalar text)
    "Extension version." "Must be non-empty." ∷
  describeField "requirement" required (enumeration ("required" ∷ "optional" ∷ []))
    "Requirement level." "Required extensions need support." ∷
  describeField "fallback" optional (scalar text)
    "Portable fallback." "Required for optional extensions." ∷ []

migrationFields : List Field
migrationFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable migration identity." "Unique among migrations." ∷
  describeField "fromVersion" required (scalar natural)
    "Source version." "Non-negative." ∷
  describeField "toVersion" required (scalar natural)
    "Target version." "Positive and greater than source." ∷
  describeConstrainedField "appliedAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Application timestamp." "RFC 3339 date-time." ∷
  describeField "tool" required (scalar text)
    "Migration tool." "Must be non-empty." ∷
  describeField "toolVersion" required (scalar text)
    "Tool version." "Must be non-empty." ∷ []

interoperabilityReportFields : List Field
interoperabilityReportFields =
  describeConstrainedField "id" required (scalar text) (nonEmpty ∷ []) noDefault
    "Stable report identity." "Unique among reports." ∷
  describeField "sourceFormat" required (scalar text)
    "Source format." "Must be non-empty." ∷
  describeField "targetFormat" required (scalar text)
    "Target format." "Must be non-empty." ∷
  describeField "status" required (enumeration ("exact" ∷ "lossy" ∷ []))
    "Conversion status." "Lossy requires declared losses." ∷
  describeDefaultedField "losses" optional (array (scalar text)) defaultEmptyArray
    "Declared losses." "Non-empty when status is lossy." ∷
  describeDefaultedField "preservedArtifacts" optional (array (scalar text)) defaultEmptyArray
    "Preserved original artifact IDs." "Supports faithful round trips." ∷ []

corpusDocumentFields : List Field
corpusDocumentFields =
  describeField "format" required (literal "lineage.corpus")
    "Format discriminator." "Exactly lineage.corpus." ∷
  describeConstrainedField "formatVersion" required (literal "1") (minimum 1 ∷ []) noDefault
    "Wire version." "Exactly numeric version one." ∷
  describeField "corpusId" required (scalar text)
    "Stable corpus identity." "Application ownership is external." ∷
  describeField "prompts" required (array (objectRef "Prompt"))
    "Prompt revisions." "Identity/revision keys are unique." ∷
  describeDefaultedField "sources" optional (array (objectRef "Source")) defaultEmptyArray
    "Source revisions." "Defaults to empty." ∷
  describeDefaultedField "materials" optional (array (objectRef "Material")) defaultEmptyArray
    "Material revisions." "Defaults to empty." ∷
  describeDefaultedField "assets" optional (array (objectRef "Asset")) defaultEmptyArray
    "Asset declarations." "Defaults to empty." ∷
  describeDefaultedField "relationships" optional (array (objectRef "Relationship")) defaultEmptyArray
    "Typed relationships." "Defaults to empty." ∷
  describeDefaultedField "repetitions" optional (array (objectRef "Repetition")) defaultEmptyArray
    "Review history." "Append-oriented." ∷
  describeDefaultedField "repetitionCorrections" optional (array (objectRef "RepetitionCorrection")) defaultEmptyArray
    "Correction history." "Append-oriented." ∷
  describeDefaultedField "provenance" optional (array (objectRef "Provenance")) defaultEmptyArray
    "Origin records." "Defaults to empty." ∷
  describeDefaultedField "extensions" optional (array (objectRef "Extension")) defaultEmptyArray
    "Capability declarations." "Defaults to empty." ∷
  describeDefaultedField "migrations" optional (array (objectRef "Migration")) defaultEmptyArray
    "Forward migration history." "Defaults to empty." ∷
  describeDefaultedField "interoperability" optional (array (objectRef "InteroperabilityReport")) defaultEmptyArray
    "Conversion reports." "Defaults to empty." ∷ []

archiveEntryFields : List Field
archiveEntryFields =
  describeField "path" required (scalar text)
    "Safe relative archive path." "No absolute paths or traversal." ∷
  describeField "byteSize" required (scalar natural)
    "Exact byte count." "Computed from actual bytes." ∷
  describeConstrainedField "sha256" required (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Lowercase SHA-256 digest." "Computed from actual bytes." ∷
  describeField "mediaType" required (scalar text)
    "Entry media type." "Must be non-empty." ∷
  describeField "role" required (enumeration ("corpus" ∷ "asset" ∷ "preserved-original" ∷ []))
    "Entry role." "Determines closure requirements." ∷
  describeField "required" required (scalar boolean)
    "Dependency requirement." "Required entries must be present." ∷ []

manifestFields : List Field
manifestFields =
  describeField "format" required (literal "lineage.manifest")
    "Manifest discriminator." "Exactly lineage.manifest." ∷
  describeConstrainedField "formatVersion" required (literal "1") (minimum 1 ∷ []) noDefault
    "Manifest version." "Exactly numeric version one." ∷
  describeField "corpusId" required (scalar text)
    "Enclosed corpus identity." "Must equal corpus document identity." ∷
  describeField "corpus" required (scalar text)
    "Corpus entry path." "Safe relative path, normally corpus.json." ∷
  describeConstrainedField "corpusSha256" required (scalar text) (regexPattern "^[a-f0-9]{64}$" ∷ []) noDefault
    "Canonical corpus digest." "Host-computed SHA-256." ∷
  describeConstrainedField "createdAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Archive creation timestamp." "RFC 3339 date-time." ∷
  describeConstrainedField "modifiedAt" required (scalar timestamp) (semanticFormat "date-time" ∷ []) noDefault
    "Archive modification timestamp." "RFC 3339 date-time." ∷
  describeDefaultedField "requiredProfiles" optional (array (scalar text)) defaultEmptyArray
    "Required presentation profiles." "All must be supported." ∷
  describeDefaultedField "requiredExtensions" optional (array (scalar text)) defaultEmptyArray
    "Required archive extensions." "All must be supported." ∷
  describeDefaultedField "optionalExtensions" optional (array (scalar text)) defaultEmptyArray
    "Optional archive extensions." "Fallbacks preserve portability." ∷
  describeField "entries" required (array (objectRef "ArchiveEntry"))
    "Integrity table." "Paths are unique and every required dependency is present." ∷ []

v1Rules : List Rule
v1Rules =
  rule "structure.invalid" error "Document does not match the version-1 wire shape." "Required fields, tags, or value constraints are invalid." "corpus" ∷
  rule "format.unsupported-version" error "The format version is unsupported." "Only version 1 is accepted." "corpus" ∷
  rule "identity.empty" error "A stable identity is empty." "All durable entity identities are non-empty." "identity" ∷
  rule "identity.duplicate" error "A stable entity identity is duplicated." "Identity/revision keys and event identities are unique in their namespaces." "identity" ∷
  rule "identity.duplicate-prompt-revision" error "A Prompt identity and revision are duplicated." "Each immutable Prompt revision key occurs once." "prompt" ∷
  rule "revision.non-positive" error "A revision is not positive." "Version-1 revisions begin at one." "revision" ∷
  rule "reference.unresolved" error "A referenced entity is absent." "All references resolve inside the local dependency closure." "reference" ∷
  rule "disclosure.withheld-empty" error "A Prompt has no withheld material." "Every active-recall Prompt conceals at least one answer." "prompt" ∷
  rule "disclosure.answer-leaked" error "Challenge content contains withheld material." "No withheld answer may appear in challenge or accessible fallback content." "prompt" ∷
  rule "disclosure.answer-missing" error "Resolution omits withheld material." "Every withheld item appears in the resolution." "prompt" ∷
  rule "response.invalid-self-check" error "Self-check response configuration is invalid." "Self-check mode uses capture none." "prompt" ∷
  rule "cloze.targets-required" error "A cloze Prompt has no targets." "Cloze Prompts require stable targets." "prompt" ∷
  rule "occlusion.source-required" error "Image occlusion has no source asset." "Image occlusion requires a declared image asset." "prompt" ∷
  rule "occlusion.regions-required" error "Image occlusion has no regions." "At least one stable normalized region is required." "prompt" ∷
  rule "asset.unresolved" error "A Prompt references an undeclared asset." "Asset references resolve in the corpus." "asset" ∷
  rule "asset.integrity-host-required" error "Media integrity is not host-established." "AI must not invent bytes, sizes, or digests." "asset" ∷
  rule "asset.path-unsafe" error "An asset path is unsafe." "Paths are relative, normalized, unique, and cannot traverse." "asset" ∷
  rule "history.prompt-unresolved" error "A repetition references an absent Prompt revision." "History resolves to exact served Prompt revisions." "repetition" ∷
  rule "history.correction-invalid" error "A correction target is missing or self-referential." "Corrections are distinct append-only events." "correction" ∷
  rule "migration.chain-invalid" error "Migration history is not forward and contiguous." "Each step starts at the preceding version and advances." "migration" ∷
  rule "extension.required-unsupported" error "A required extension is unsupported." "Required capabilities must be understood by the renderer." "extension" ∷
  rule "extension.optional-fallback-missing" error "An optional extension lacks a fallback." "Portable fallback content keeps the Prompt reviewable." "extension" ∷
  rule "interoperability.loss-unreported" error "A lossy conversion has no loss report." "Losses must be explicit and inspectable." "interoperability" ∷
  rule "manifest.corpus-mismatch" error "Manifest and corpus identities differ." "The archive manifest names the enclosed corpus." "manifest" ∷
  rule "archive.entry-missing" error "A declared archive entry is missing." "All manifest entries must have actual bytes." "archive" ∷
  rule "archive.digest-mismatch" error "Archive entry digest does not match bytes." "Hosts compute and verify SHA-256 over actual bytes." "archive" ∷
  rule "archive.duplicate-path" error "Archive paths are duplicated." "Each normalized entry path occurs once." "archive" ∷ []

basicJSON : String
basicJSON = "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"example-basic\",\"prompts\":[{\"id\":\"capital-of-france\",\"revision\":1,\"kind\":\"basic\",\"challenge\":[\"What is the capital of France?\"],\"withheld\":[\"Paris\"],\"resolution\":[\"What is the capital of France?\",\"Paris\"],\"response\":{\"mode\":\"self-check\",\"capture\":\"none\"}}]}"

clozeJSON : String
clozeJSON = "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"example-cloze\",\"prompts\":[{\"id\":\"france-capital-cloze\",\"revision\":1,\"kind\":\"cloze\",\"challenge\":[\"The capital of France is […].\"],\"withheld\":[\"Paris\"],\"resolution\":[\"The capital of France is Paris.\",\"Paris\"],\"response\":\"text\",\"clozeTargets\":[{\"id\":\"france-capital\",\"answer\":\"Paris\",\"hints\":[\"European capital\"]}]}]}"

imageOcclusionJSON : String
imageOcclusionJSON = "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"example-image-occlusion\",\"assets\":[{\"id\":\"heart-diagram\",\"mediaType\":\"image/png\",\"byteSize\":\"HOST_COMPUTED_BYTE_SIZE_REQUIRED\",\"sha256\":\"HOST_COMPUTED_SHA256_REQUIRED\",\"path\":\"assets/heart-diagram.png\",\"accessibleDescription\":\"Host-provided diagram.\"}],\"prompts\":[{\"id\":\"heart-left-ventricle\",\"revision\":1,\"kind\":\"image-occlusion\",\"challenge\":[\"Name the covered chamber.\"],\"withheld\":[\"Left ventricle\"],\"resolution\":[\"Left ventricle\"],\"response\":{\"mode\":\"self-check\",\"capture\":\"none\"},\"assets\":[\"heart-diagram\"],\"sourceAsset\":\"heart-diagram\",\"occlusionRegions\":[{\"id\":\"left-ventricle\",\"label\":\"Left ventricle\",\"accessibleDescription\":\"Lower-right chamber in anatomical orientation.\",\"geometry\":{\"type\":\"rectangle\",\"x\":0.58,\"y\":0.56,\"width\":0.2,\"height\":0.24}}]}]}"

mediaJSON : String
mediaJSON = "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"example-media\",\"assets\":[{\"id\":\"heart-diagram\",\"mediaType\":\"image/png\",\"byteSize\":\"HOST_COMPUTED_BYTE_SIZE_REQUIRED\",\"sha256\":\"HOST_COMPUTED_SHA256_REQUIRED\",\"path\":\"assets/heart-diagram.png\",\"accessibleDescription\":\"Host-provided diagram.\"}],\"prompts\":[{\"id\":\"heart-media\",\"revision\":1,\"kind\":\"basic\",\"challenge\":[\"Identify the organ in the image.\"],\"withheld\":[\"heart\"],\"resolution\":[\"Heart diagram\",\"heart\"],\"response\":\"text\",\"assets\":[\"heart-diagram\"]}]}"

historyJSON : String
historyJSON = "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"example-history\",\"prompts\":[{\"id\":\"capital-of-france\",\"revision\":1,\"kind\":\"basic\",\"challenge\":[\"What is the capital of France?\"],\"withheld\":[\"Paris\"],\"resolution\":[\"Paris\"],\"response\":\"text\"}],\"repetitions\":[{\"id\":\"review-1\",\"promptId\":\"capital-of-france\",\"promptRevision\":1,\"reviewedAt\":\"2026-08-26T12:00:00Z\",\"assessment\":\"good\"}]}"

v1Description : FormatDescription
v1Description = format "lineage.corpus" 1
  "Portable, locally complete version-1 Lineage corpus and archive format."
  ("CorpusDocument" ∷ "Manifest" ∷ [])
  (object "ResponseInteraction" "ResponseInteraction version-1 wire object." responseInteractionFields ∷
   object "SelfCheckResponse" "SelfCheckResponse version-1 wire object." selfCheckResponseFields ∷
   object "EntityReference" "EntityReference version-1 wire object." entityReferenceFields ∷
   object "ClozeTarget" "ClozeTarget version-1 wire object." clozeTargetFields ∷
   object "NormalizedPoint" "NormalizedPoint version-1 wire object." normalizedPointFields ∷
   object "RectangleGeometry" "RectangleGeometry version-1 wire object." rectangleGeometryFields ∷
   object "PolygonGeometry" "PolygonGeometry version-1 wire object." polygonGeometryFields ∷
   object "OcclusionRegion" "OcclusionRegion version-1 wire object." occlusionRegionFields ∷
   object "Source" "Source version-1 wire object." sourceFields ∷
   object "Material" "Material version-1 wire object." materialFields ∷
   object "Asset" "Asset version-1 wire object." assetFields ∷
   object "ExtensionSet" "ExtensionSet version-1 wire object." extensionSetFields ∷
   object "Prompt" "Prompt version-1 wire object." promptFields ∷
   object "Relationship" "Relationship version-1 wire object." relationshipFields ∷
   object "SchedulerObservation" "SchedulerObservation version-1 wire object." schedulerObservationFields ∷
   object "Repetition" "Repetition version-1 wire object." repetitionFields ∷
   object "RepetitionCorrection" "RepetitionCorrection version-1 wire object." repetitionCorrectionFields ∷
   object "Provenance" "Provenance version-1 wire object." provenanceFields ∷
   object "Extension" "Extension version-1 wire object." extensionFields ∷
   object "Migration" "Migration version-1 wire object." migrationFields ∷
   object "InteroperabilityReport" "InteroperabilityReport version-1 wire object." interoperabilityReportFields ∷
   object "CorpusDocument" "CorpusDocument version-1 wire object." corpusDocumentFields ∷
   object "ArchiveEntry" "ArchiveEntry version-1 wire object." archiveEntryFields ∷
   object "Manifest" "Manifest version-1 wire object." manifestFields ∷ [])
  v1Rules
  (example "basic.json" "Basic self-check Prompt." "valid" basicJSON ∷
   example "cloze.json" "Stable cloze targets." "valid" clozeJSON ∷
   example "image-occlusion.json" "Normalized stable regions." "host-media-required" imageOcclusionJSON ∷
   example "media.json" "Host-verified media reference." "host-media-required" mediaJSON ∷ [])
  (fixture "basic.json" "Canonical minimal valid corpus." basicJSON valid ∷
   fixture "history.json" "Valid append-oriented review history." historyJSON valid ∷
   fixture "disclosure-leak.json" "Challenge leaks withheld material." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-leak\",\"prompts\":[{\"id\":\"p\",\"revision\":1,\"challenge\":[\"Paris\"],\"withheld\":[\"Paris\"],\"resolution\":[\"Paris\"],\"response\":\"text\"}]}" (invalid "disclosure.answer-leaked" "/prompts/0/challenge/0") ∷
   fixture "non-positive-revision.json" "Prompt revision is zero." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-revision\",\"prompts\":[{\"id\":\"p\",\"revision\":0,\"challenge\":[\"Question\"],\"withheld\":[\"Answer\"],\"resolution\":[\"Answer\"],\"response\":\"text\"}]}" (invalid "revision.non-positive" "/prompts/0/revision") ∷
   fixture "unresolved-asset.json" "Prompt references an absent asset." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-asset\",\"prompts\":[{\"id\":\"p\",\"revision\":1,\"challenge\":[\"Question\"],\"withheld\":[\"Answer\"],\"resolution\":[\"Answer\"],\"response\":\"text\",\"assets\":[\"missing\"]}]}" (invalid "asset.unresolved" "/prompts/0/assets/0") ∷
   fixture "unresolved-history.json" "History references an absent Prompt." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-history\",\"prompts\":[],\"repetitions\":[{\"id\":\"review-1\",\"promptId\":\"missing\",\"promptRevision\":1,\"reviewedAt\":\"2026-08-26T12:00:00Z\",\"assessment\":\"good\"}]}" (invalid "history.prompt-unresolved" "/repetitions/0/promptId") ∷
   fixture "invalid-correction.json" "Correction references an absent repetition." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-correction\",\"prompts\":[],\"repetitionCorrections\":[{\"id\":\"correction-1\",\"targetRepetitionId\":\"missing\",\"correctedAt\":\"2026-08-26T12:00:00Z\",\"reason\":\"Incorrect rating\"}]}" (invalid "history.correction-invalid" "/repetitionCorrections/0/targetRepetitionId") ∷
   fixture "migration-gap.json" "Migration chain is not contiguous." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-migration\",\"prompts\":[],\"migrations\":[{\"id\":\"m1\",\"fromVersion\":1,\"toVersion\":2,\"appliedAt\":\"2026-08-26T12:00:00Z\",\"tool\":\"lineage\",\"toolVersion\":\"1\"},{\"id\":\"m2\",\"fromVersion\":3,\"toVersion\":4,\"appliedAt\":\"2026-08-26T12:01:00Z\",\"tool\":\"lineage\",\"toolVersion\":\"1\"}]}" (invalid "migration.chain-invalid" "/migrations/1/fromVersion") ∷
   fixture "loss-unreported.json" "Lossy conversion omits its loss report." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-loss\",\"prompts\":[],\"interoperability\":[{\"id\":\"anki-export\",\"sourceFormat\":\"lineage.corpus/1\",\"targetFormat\":\"anki.apkg\",\"status\":\"lossy\",\"losses\":[]}]}" (invalid "interoperability.loss-unreported" "/interoperability/0/losses") ∷
   fixture "embedded-disclosure-leak.json" "Challenge embeds a case-varied withheld answer." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-embedded-leak\",\"prompts\":[{\"id\":\"p\",\"revision\":1,\"challenge\":[\"The answer is PARIS.\"],\"withheld\":[\"Paris\"],\"resolution\":[\"The answer is Paris.\"],\"response\":\"text\"}]}" (invalid "disclosure.answer-leaked" "/prompts/0/challenge/0") ∷
   fixture "duplicate-asset.json" "Asset identity is duplicated." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-duplicate-asset\",\"prompts\":[],\"assets\":[{\"id\":\"asset-1\",\"mediaType\":\"image/png\",\"byteSize\":1,\"sha256\":\"0000000000000000000000000000000000000000000000000000000000000000\",\"path\":\"assets/one.png\"},{\"id\":\"asset-1\",\"mediaType\":\"image/png\",\"byteSize\":1,\"sha256\":\"1111111111111111111111111111111111111111111111111111111111111111\",\"path\":\"assets/two.png\"}]}" (invalid "identity.duplicate" "/assets/1") ∷
   fixture "unresolved-relationship.json" "Relationship endpoint does not resolve." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-relationship\",\"prompts\":[{\"id\":\"p\",\"revision\":1,\"challenge\":[\"Question\"],\"withheld\":[\"Answer\"],\"resolution\":[\"Answer\"],\"response\":\"text\"}],\"relationships\":[{\"id\":\"r\",\"kind\":\"related\",\"source\":{\"id\":\"p\",\"revision\":1},\"target\":{\"id\":\"missing\",\"revision\":1}}]}" (invalid "reference.unresolved" "/relationships/0/target") ∷
   fixture "unresolved-provenance.json" "Provenance record references absent provenance." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"invalid-provenance\",\"prompts\":[],\"provenance\":[{\"id\":\"provenance-1\",\"kind\":\"authored\",\"recordedAt\":\"2026-08-26T12:00:00Z\",\"sources\":[\"missing\"]}]}" (invalid "reference.unresolved" "/provenance/0/sources/0") ∷
   fixture "empty-corpus-identity.json" "Corpus identity is empty." "{\"format\":\"lineage.corpus\",\"formatVersion\":1,\"corpusId\":\"\",\"prompts\":[]}" (invalid "identity.empty" "/corpusId") ∷ [])
```
