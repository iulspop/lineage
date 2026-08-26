# Version-1 corpus wire model

Version 1 is the canonical JSON boundary used for corpus authoring and import.
It supports basic prompts, stable cloze targets, normalized image occlusion, and
media references. Host applications must obtain media bytes and compute their
size and digest; generated content may only refer to declared assets.

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

data GeometryKind : Set where
  rectangle polygon : GeometryKind

record AssetReference : Set where
  constructor assetReference
  field
    assetId mediaType digest : String
    byteSize : ℕ
    path : String

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

record Prompt : Set where
  constructor prompt
  field
    promptId : String
    revision : ℕ
    kind : PromptKind
    challenge withheld resolution : List String
    responseMode : ResponseMode
    clozeTargets : List ClozeTarget
    sourceAsset : List String
    occlusionRegions : List OcclusionRegion

record CorpusDocument : Set where
  constructor corpusDocument
  field
    corpusId : String
    prompts : List Prompt
    assets : List AssetReference

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
  describeField "kind" required (choice ("basic" ∷ "cloze" ∷ "image-occlusion" ∷ []))
    "Prompt presentation kind."
    "Selects basic, cloze, or image-occlusion requirements." ∷
  describeField "challenge" required (array "string") "Pre-disclosure content."
    "Must not expose any withheld answer." ∷
  describeField "withheld" required (array "string") "Concealed answer material."
    "Must be non-empty and fully represented in the resolution." ∷
  describeField "resolution" required (array "string") "Post-disclosure content."
    "Must disclose every withheld item." ∷
  describeField "response" required (reference "ResponseInteraction")
    "Learner response interaction."
    "Use self-check when no typed response should be captured." ∷
  describeField "clozeTargets" optional (array "ClozeTarget")
    "Stable cloze target definitions."
    "Required for cloze prompts; target IDs do not depend on array position." ∷
  describeField "sourceAsset" optional (scalar text) "Referenced source image asset."
    "Required for image occlusion and must resolve to a declared asset." ∷
  describeField "occlusionRegions" optional (array "OcclusionRegion")
    "Stable normalized occlusion regions."
    "Required for image occlusion; region identity is independent of geometry." ∷ []

assetFields : List Field
assetFields =
  describeField "id" required (scalar text) "Stable asset identity."
    "Referenced by media-bearing Prompt content." ∷
  describeField "mediaType" required (scalar text) "IANA media type."
    "Describes host-obtained bytes." ∷
  describeField "byteSize" required (scalar natural) "Actual byte length."
    "Computed by the host from available media bytes." ∷
  describeField "sha256" required (scalar text) "SHA-256 content digest."
    "Computed by the host; AI output must not invent this value." ∷
  describeField "path" required (scalar text) "Safe archive-relative asset path."
    "Must resolve within the corpus archive and reject traversal." ∷ []

corpusFields : List Field
corpusFields =
  describeField "format" required (literal "lineage.corpus") "Format discriminator."
    "Must be exactly lineage.corpus." ∷
  describeField "formatVersion" required (literal "1") "Wire-format version."
    "Must be exactly version 1." ∷
  describeField "corpusId" required (scalar text) "Stable corpus identity."
    "Identifies the corpus independently of application ownership." ∷
  describeField "prompts" required (array "Prompt") "Prompt revisions."
    "Each Prompt key is the pair of stable identity and positive revision." ∷
  describeField "assets" optional (array "Asset") "Locally available media assets."
    "Required when prompts reference media." ∷ []

v1Rules : List Rule
v1Rules =
  rule "structure.invalid" error "Document does not match the version-1 wire shape."
    "Fields have the wrong type, required fields are absent, or unknown discriminators are used." "corpus" ∷
  rule "format.unsupported-version" error "The format version is unsupported."
    "Only lineage.corpus version 1 is accepted by this decoder." "corpus" ∷
  rule "identity.empty" error "A stable identity is empty."
    "Corpus, Prompt, target, region, and asset identities must be non-empty." "identity" ∷
  rule "identity.duplicate-prompt-revision" error "A Prompt identity and revision are duplicated."
    "Each immutable Prompt revision key must occur once in a corpus." "prompt" ∷
  rule "revision.non-positive" error "A revision is not positive."
    "Version-1 Prompt revisions begin at one." "prompt" ∷
  rule "disclosure.withheld-empty" error "A Prompt has no withheld material."
    "Every active-recall Prompt must identify at least one concealed answer item." "prompt" ∷
  rule "disclosure.answer-leaked" error "Challenge content contains withheld material."
    "No withheld answer may appear in the challenge representation." "prompt" ∷
  rule "disclosure.answer-missing" error "Resolution omits withheld material."
    "Every withheld item must appear in the resolution representation." "prompt" ∷
  rule "response.invalid-self-check" error "Self-check response configuration is invalid."
    "Self-check mode must use capture none." "prompt" ∷
  rule "cloze.targets-required" error "A cloze Prompt has no targets."
    "Cloze Prompts require at least one stable target." "prompt" ∷
  rule "occlusion.source-required" error "An image-occlusion Prompt has no source asset."
    "Image occlusion requires a locally declared source image." "prompt" ∷
  rule "occlusion.regions-required" error "An image-occlusion Prompt has no regions."
    "Image occlusion requires at least one stable region." "prompt" ∷
  rule "asset.unresolved" error "A Prompt references an undeclared asset."
    "Every asset reference must resolve within the corpus dependency closure." "asset" ∷
  rule "asset.integrity-host-required" error "Media integrity was not established by the host."
    "Byte size and SHA-256 digest must come from actual host-obtained bytes." "asset" ∷ []

v1Description : FormatDescription
v1Description = format "lineage.corpus" 1
  "Portable, locally complete version-1 Lineage corpus wire format."
  (object "CorpusDocument" "Top-level corpus document." corpusFields ∷
   object "Prompt" "Independently scheduled immutable Prompt revision." promptFields ∷
   object "ResponseInteraction" "Learner response capture policy." responseFields ∷
   object "Asset" "Content-addressed local media declaration." assetFields ∷ [])
  v1Rules
  (example "basic.json" "Basic text recall Prompt." "valid" ∷
   example "cloze.json" "Stable native cloze targets." "valid" ∷
   example "image-occlusion.json" "Normalized image occlusion with a source asset." "valid" ∷
   example "media.json" "Prompt referencing host-verified media." "valid" ∷ [])
```
