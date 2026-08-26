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

open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ)
open import Data.String.Base using (String)
open import Lineage.Specification.FormatDescription

data ResponseMode : Set where
  capturedText selfCheck : ResponseMode

data PromptKind : Set where
  basic cloze imageOcclusion : PromptKind

data Lifecycle : Set where
  active suspended retired : Lifecycle

data GeometryKind : Set where
  rectangle polygon : GeometryKind

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

record AssetReference : Set where
  constructor assetReference
  field
    assetId mediaType digest : String
    byteSize : ℕ
    path accessibleDescription : String

record ClozeTarget : Set where
  constructor clozeTarget
  field
    targetId answer : String
    hints : List String

record OcclusionRegion : Set where
  constructor occlusionRegion
  field
    regionId label geometry : String
    accessibleDescription : String

record SourceRevision : Set where
  constructor sourceRevision
  field
    sourceId : String
    revision : ℕ
    title content : String
    assetIds : List String

record MaterialRevision : Set where
  constructor materialRevision
  field
    materialId : String
    revision : ℕ
    content : List String
    sourceIds assetIds : List String

record Prompt : Set where
  constructor prompt
  field
    promptId : String
    revision : ℕ
    lifecycle : Lifecycle
    kind : PromptKind
    challenge withheld resolution : List String
    responseMode : ResponseMode
    materialIds sourceIds assetIds : List String
    clozeTargets : List ClozeTarget
    sourceAsset : List String
    occlusionRegions : List OcclusionRegion
    presentationProfile : String
    requiredExtensions optionalExtensions : List String
    provenanceIds : List String

record Repetition : Set where
  constructor repetition
  field
    repetitionId promptId : String
    promptRevision : ℕ
    snapshotDigest presentationDigest : String
    reviewedAt durationMilliseconds : ℕ
    capturedResponse : String
    rating : RepetitionRating
    scheduler schedulerVersion parameterDigest : String
    previousIntervalMinutes nextIntervalMinutes : ℕ
    dueAt : ℕ
    provenanceIds : List String

record RepetitionCorrection : Set where
  constructor repetitionCorrection
  field
    correctionId targetRepetitionId : String
    correctedAt : ℕ
    reason replacementRating replacementResponse : String
    provenanceIds : List String

record Relationship : Set where
  constructor relationship
  field
    relationshipId sourceId targetId : String
    kind : RelationshipKind

record ProvenanceRecord : Set where
  constructor provenanceRecord
  field
    provenanceId : String
    kind : ProvenanceKind
    recordedAt : ℕ
    agent citation license note : String
    sourceProvenanceIds : List String

record ExtensionDeclaration : Set where
  constructor extensionDeclaration
  field
    extensionId version : String
    requirement : RequirementLevel
    fallback : String

record MigrationRecord : Set where
  constructor migrationRecord
  field
    migrationId : String
    fromVersion toVersion : ℕ
    appliedAt : ℕ
    tool toolVersion : String

record InteroperabilityReport : Set where
  constructor interoperabilityReport
  field
    reportId sourceFormat targetFormat : String
    status : ConversionStatus
    losses : List String
    preservedArtifactIds : List String

record Manifest : Set where
  constructor manifest
  field
    manifestFormat : String
    manifestVersion : ℕ
    corpusId : String
    corpusPath corpusDigest : String
    createdAt modifiedAt : ℕ
    requiredProfiles : List String
    requiredExtensions optionalExtensions : List String
    archiveEntries : List String

record CorpusDocument : Set where
  constructor corpusDocument
  field
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

responseFields : List Field
responseFields =
  describeField "mode" required (choice ("text" ∷ "self-check" ∷ []))
    "Review response mode."
    "Text captures a learner response; self-check reveals before rating." ∷
  describeField "capture" optional (literal "none")
    "Explicitly disables response capture."
    "Required when mode is self-check and forbidden for text mode." ∷ []

promptFields : List Field
promptFields =
  describeField "id" required (scalar text) "Stable Prompt identity."
    "Identifies one independently scheduled recall stream." ∷
  describeField "revision" required (scalar natural) "Positive immutable revision."
    "Repetitions bind to the exact served Prompt revision." ∷
  describeField "status" optional (choice ("active" ∷ "suspended" ∷ "retired" ∷ []))
    "Prompt lifecycle status." "Only active Prompts enter review queues." ∷
  describeField "kind" required (choice ("basic" ∷ "cloze" ∷ "image-occlusion" ∷ []))
    "Prompt presentation kind." "Selects kind-specific requirements." ∷
  describeField "challenge" required (array "string") "Pre-disclosure content."
    "Must not expose any withheld answer." ∷
  describeField "withheld" required (array "string") "Concealed answer material."
    "Must be non-empty and fully represented in the resolution." ∷
  describeField "resolution" required (array "string") "Post-disclosure content."
    "Must disclose every withheld item." ∷
  describeField "response" required (reference "ResponseInteraction")
    "Learner response interaction." "Use self-check when no typed response is captured." ∷
  describeField "materials" optional (array "reference:Material") "Referenced materials."
    "Every reference must resolve within the corpus." ∷
  describeField "sources" optional (array "reference:Source") "Referenced sources."
    "Sources provide shared authored or imported context." ∷
  describeField "assets" optional (array "reference:Asset") "Referenced assets."
    "Every reference must resolve to verified local bytes for archive export." ∷
  describeField "clozeTargets" optional (array "ClozeTarget") "Stable cloze targets."
    "Required for cloze Prompts; identity is independent of array position." ∷
  describeField "sourceAsset" optional (scalar text) "Image-occlusion source asset."
    "Required for image occlusion and must resolve to a declared image asset." ∷
  describeField "occlusionRegions" optional (array "OcclusionRegion") "Stable regions."
    "Required for image occlusion; normalized geometry does not define identity." ∷ []

corpusFields : List Field
corpusFields =
  describeField "format" required (literal "lineage.corpus") "Format discriminator."
    "Must be exactly lineage.corpus." ∷
  describeField "formatVersion" required (literal "1") "Wire-format version."
    "Must be exactly version 1." ∷
  describeField "corpusId" required (scalar text) "Stable corpus identity."
    "Application ownership is not part of corpus meaning." ∷
  describeField "prompts" required (array "Prompt") "Prompt revisions."
    "Prompt identity plus revision must be unique." ∷
  describeField "sources" optional (array "Source") "Shared source revisions."
    "Sources are not independently scheduled." ∷
  describeField "materials" optional (array "Material") "Reusable material revisions."
    "Materials can be shared by multiple Prompts." ∷
  describeField "assets" optional (array "Asset") "Content-addressed assets."
    "Archive export requires verified local bytes." ∷
  describeField "relationships" optional (array "Relationship") "Typed relationships."
    "Relationships never merge stable identities implicitly." ∷
  describeField "repetitions" optional (array "Repetition") "Append-oriented review history."
    "Events reference exact Prompt revisions and are never overwritten." ∷
  describeField "repetitionCorrections" optional (array "RepetitionCorrection") "Corrections."
    "Corrections are distinct auditable events." ∷
  describeField "provenance" optional (array "Provenance") "Origin records."
    "Provenance describes origin, not truth or trust." ∷
  describeField "extensions" optional (array "Extension") "Capability declarations."
    "Required extensions need renderer support; optional ones need fallbacks." ∷
  describeField "migrations" optional (array "Migration") "Forward migration history."
    "Migration chains are explicit and preserve denotation." ∷
  describeField "interoperability" optional (array "InteroperabilityReport") "Conversions."
    "Every non-exact conversion names its losses." ∷ []

manifestFields : List Field
manifestFields =
  describeField "format" required (literal "lineage.manifest") "Manifest discriminator."
    "Must be exactly lineage.manifest." ∷
  describeField "formatVersion" required (literal "1") "Manifest version."
    "Must be exactly version 1." ∷
  describeField "corpusId" required (scalar text) "Referenced corpus identity."
    "Must equal the corpus document identity." ∷
  describeField "corpus" required (scalar text) "Safe corpus entry path."
    "Normally corpus.json; traversal and absolute paths are forbidden." ∷
  describeField "corpusSha256" required (scalar text) "Corpus entry digest."
    "Computed by the archive host from canonical corpus bytes." ∷
  describeField "entries" required (array "ArchiveEntry") "Archive integrity table."
    "Every required file has a safe unique path, byte size, and SHA-256 digest." ∷ []

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

v1Description : FormatDescription
v1Description = format "lineage.corpus" 1
  "Portable, locally complete version-1 Lineage corpus and archive format."
  (object "CorpusDocument" "Canonical corpus document." corpusFields ∷
   object "Manifest" "Archive manifest and integrity root." manifestFields ∷
   object "Prompt" "Independently scheduled immutable Prompt revision." promptFields ∷
   object "ResponseInteraction" "Learner response policy." responseFields ∷
   object "Source" "Shared immutable source revision." [] ∷
   object "Material" "Reusable immutable material revision." [] ∷
   object "Asset" "Content-addressed local media declaration." [] ∷
   object "Relationship" "Typed identity-neutral relationship." [] ∷
   object "Repetition" "Append-only durable review event." [] ∷
   object "RepetitionCorrection" "Append-only correction event." [] ∷
   object "Provenance" "Auditable origin record." [] ∷
   object "Extension" "Versioned capability declaration." [] ∷
   object "Migration" "Forward migration record." [] ∷
   object "InteroperabilityReport" "Exactness and loss report." [] ∷ [])
  v1Rules
  (example "basic.json" "Basic self-check Prompt." "valid" ∷
   example "cloze.json" "Stable cloze targets." "valid" ∷
   example "image-occlusion.json" "Normalized stable regions." "host-media-required" ∷
   example "media.json" "Host-verified media reference." "host-media-required" ∷ [])
```
