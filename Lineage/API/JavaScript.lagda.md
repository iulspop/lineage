# JavaScript API boundary

The JavaScript backend compiles this module and its public pure API. It contains
no browser, storage, networking, clock, or randomness effects; TypeScript hosts
supply those capabilities and treat all incoming values as untrusted DTOs.

The proof-oriented pure validator currently compiles through standard-library
`Dec` machinery that is not executable under Agda 2.8's JavaScript backend. The
two specialized entry points below therefore have explicit JavaScript code
generation while retaining the pure Agda definitions as their meanings. This
FFI boundary is smoke-tested with corresponding accepted and rejected cases.

```agda
module Lineage.API.JavaScript where

open import Data.Bool.Base using (Bool)
open import Data.Float.Base using (Float)
open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ)
open import Data.String.Base using (String)
import Lineage.API.Pure as Pure
open import Lineage.Specification.FormatDescription using (FormatDescription)
import Lineage.Specification.CorpusWireV1 as Wire
open Wire using
  ( PromptKind; Lifecycle; RequirementLevel; RelationshipKind; RepetitionRating
  ; ProvenanceKind; ConversionStatus; ResponseInteraction; OcclusionGeometry
  ; EntityReference; ExtensionSet; NormalizedPoint; RectangleGeometry; PolygonGeometry
  ; AssetReference; ClozeTarget; OcclusionRegion; SourceRevision; MaterialRevision
  ; Prompt; SchedulerObservation; Repetition; RepetitionCorrection; Relationship
  ; ProvenanceRecord; ExtensionDeclaration; MigrationRecord; InteroperabilityReport
  ; CorpusDocument; v1Description
  )
import Lineage.Validation.CorpusWireV1 as CorpusValidation
open import Lineage.Validation.Diagnostic using (Diagnostic)

open Pure using
  ( RawReviewContract
  ; ReviewContract
  ; ChallengeSession
  ; ResolutionSession
  ; CompletedSession
  )

rawReviewContract :
  List String → List String → String → List String → RawReviewContract
rawReviewContract = Pure.rawReviewContract

isValidReviewContract : RawReviewContract → Bool
isValidReviewContract = Pure.isValidReviewContract

validateReviewContract : RawReviewContract → Maybe ReviewContract
validateReviewContract = Pure.validateReviewContract

beginReview : ReviewContract → ChallengeSession
beginReview = Pure.beginReview

submitResponse : String → ChallengeSession → ResolutionSession
submitResponse = Pure.submitResponse

revealResolution : ChallengeSession → ResolutionSession
revealResolution = Pure.revealResolution

recordAssessment : String → ResolutionSession → CompletedSession
recordAssessment = Pure.recordAssessment

presentChallenge : ChallengeSession → List String
presentChallenge = Pure.presentChallenge

presentResolution : ResolutionSession → List String
presentResolution = Pure.presentResolution

presentCompleted : CompletedSession → List String
presentCompleted = Pure.presentCompleted

capturedResolutionAttempt : ResolutionSession → Maybe String
capturedResolutionAttempt = Pure.capturedResolutionAttempt

capturedCompletedAttempt : CompletedSession → Maybe String
capturedCompletedAttempt = Pure.capturedCompletedAttempt

formatDescription : FormatDescription
formatDescription = v1Description

some : {A : Set} → A → Maybe A
some = just

none : {A : Set} → Maybe A
none = nothing

promptKind : String → PromptKind
promptKind "cloze" = Wire.cloze
promptKind "image-occlusion" = Wire.imageOcclusion
promptKind _ = Wire.basic

lifecycle : String → Lifecycle
lifecycle "suspended" = Wire.suspended
lifecycle "retired" = Wire.retired
lifecycle _ = Wire.active

requirementLevel : String → RequirementLevel
requirementLevel "optional" = Wire.optionalCapability
requirementLevel _ = Wire.requiredCapability

relationshipKind : String → RelationshipKind
relationshipKind "prerequisite" = Wire.prerequisite
relationshipKind "derived-from" = Wire.derivedFrom
relationshipKind "sibling" = Wire.sibling
relationshipKind "duplicate-of" = Wire.duplicateOf
relationshipKind _ = Wire.related

repetitionRating : String → RepetitionRating
repetitionRating "again" = Wire.again
repetitionRating "hard" = Wire.hard
repetitionRating "easy" = Wire.easy
repetitionRating _ = Wire.good

provenanceKind : String → ProvenanceKind
provenanceKind "imported" = Wire.imported
provenanceKind "cited" = Wire.cited
provenanceKind "derived" = Wire.derived
provenanceKind "corrected" = Wire.corrected
provenanceKind _ = Wire.authored

conversionStatus : String → ConversionStatus
conversionStatus "lossy" = Wire.lossy
conversionStatus _ = Wire.exact

responseInteraction : String → ResponseInteraction
responseInteraction "self-check" = Wire.selfCheckResponse
responseInteraction _ = Wire.textResponse

disclosureContains : String → String → Bool
disclosureContains = CorpusValidation.containsNormalizedText

entityReference : String → Maybe ℕ → EntityReference
entityReference = Wire.entityReference

extensionSet : List String → List String → ExtensionSet
extensionSet = Wire.extensionSet

normalizedPoint : Float → Float → NormalizedPoint
normalizedPoint = Wire.normalizedPoint

rectangleGeometry : Float → Float → Float → Float → RectangleGeometry
rectangleGeometry = Wire.rectangleGeometry

polygonGeometry : List NormalizedPoint → PolygonGeometry
polygonGeometry = Wire.polygonGeometry

rectangleGeometryValue : RectangleGeometry → OcclusionGeometry
rectangleGeometryValue = Wire.rectangleGeometryValue

polygonGeometryValue : PolygonGeometry → OcclusionGeometry
polygonGeometryValue = Wire.polygonGeometryValue

assetReference : String → String → String → ℕ → String → Maybe String → AssetReference
assetReference = Wire.assetReference

clozeTarget : String → String → Maybe (List String) → ClozeTarget
clozeTarget = Wire.clozeTarget

occlusionRegion : String → String → OcclusionGeometry → String → OcclusionRegion
occlusionRegion = Wire.occlusionRegion

sourceRevision : String → ℕ → String → String → List String → List String → SourceRevision
sourceRevision = Wire.sourceRevision

materialRevision : String → ℕ → List String → List String → List String → List String → MaterialRevision
materialRevision = Wire.materialRevision

prompt :
  String → ℕ → Lifecycle → PromptKind → List String → List String → List String →
  ResponseInteraction → List String → List String → List String → Maybe (List ClozeTarget) →
  Maybe String → Maybe (List OcclusionRegion) → String → ExtensionSet → List String → Prompt
prompt = Wire.prompt

schedulerObservation :
  String → String → Maybe String → Maybe ℕ → Maybe ℕ → Maybe String → SchedulerObservation
schedulerObservation = Wire.schedulerObservation

repetition :
  String → String → ℕ → Maybe String → Maybe String → String → Maybe ℕ → Maybe String →
  RepetitionRating → Maybe SchedulerObservation → List String → Repetition
repetition = Wire.repetition

repetitionCorrection :
  String → String → String → String → Maybe RepetitionRating → Maybe String → List String →
  RepetitionCorrection
repetitionCorrection = Wire.repetitionCorrection

relationship : String → RelationshipKind → EntityReference → EntityReference → Relationship
relationship = Wire.relationship

provenanceRecord :
  String → ProvenanceKind → String → Maybe String → Maybe String → Maybe String → Maybe String →
  List String → ProvenanceRecord
provenanceRecord = Wire.provenanceRecord

extensionDeclaration : String → String → RequirementLevel → Maybe String → ExtensionDeclaration
extensionDeclaration = Wire.extensionDeclaration

migrationRecord : String → ℕ → ℕ → String → String → String → MigrationRecord
migrationRecord = Wire.migrationRecord

interoperabilityReport :
  String → String → String → ConversionStatus → List String → List String → InteroperabilityReport
interoperabilityReport = Wire.interoperabilityReport

corpusDocument :
  String → ℕ → String → List Prompt → List SourceRevision → List MaterialRevision →
  List AssetReference → List Relationship → List Repetition → List RepetitionCorrection →
  List ProvenanceRecord → List ExtensionDeclaration → List MigrationRecord →
  List InteroperabilityReport → CorpusDocument
corpusDocument = Wire.corpusDocument

validateCorpus : CorpusDocument → List Diagnostic
validateCorpus = CorpusValidation.validateCorpus

isValidCorpus : CorpusDocument → Bool
isValidCorpus = CorpusValidation.isValidCorpus

{-# COMPILE JS isValidReviewContract = raw => raw.record({ record: (challenge, resolution, response, withheld) => withheld.every(item => !challenge.includes(item) && resolution.includes(item)) }) #-}

{-# COMPILE JS validateReviewContract = raw => raw.record({ record: (challenge, resolution, response, withheld) => { const valid = withheld.every(item => !challenge.includes(item) && resolution.includes(item)); if (!valid) return visitor => visitor.nothing(); const contract = { record: visitor => visitor.record(challenge, resolution, response, withheld, null, null) }; return visitor => visitor.just(contract); } }) #-}

```
