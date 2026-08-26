# Version-1 corpus semantic validation

This module is the authoritative semantic validator for the canonical version-1
corpus model. Structural JSON decoding remains a host concern; after decoding,
the host maps the wire names and optional/defaulted fields into `CorpusDocument`
and delegates all corpus semantic rules to `validateCorpus`.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.CorpusWireV1 where

open import Agda.Builtin.String using (primStringEquality)
open import Data.Bool.Base using (Bool; true; false; if_then_else_)
open import Data.List.Base using (List; []; _∷_; _++_; map; reverse)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Data.String.Base using (String)
import Data.String.Base as String

infixr 5 _<>_
_<>_ : String → String → String
_<>_ = String._++_
open import Lineage.Specification.CorpusWireV1
open import Lineage.Specification.FormatDescription using (error)
open import Lineage.Validation.Diagnostic

private
  variable A : Set

stringEq : String → String → Bool
stringEq = primStringEquality

natEq : ℕ → ℕ → Bool
natEq zero zero = true
natEq zero (suc right) = false
natEq (suc left) zero = false
natEq (suc left) (suc right) = natEq left right

lessThan : ℕ → ℕ → Bool
lessThan zero zero = false
lessThan zero (suc right) = true
lessThan (suc left) zero = false
lessThan (suc left) (suc right) = lessThan left right

digitString : ℕ → String
digitString zero = "0"
digitString (suc zero) = "1"
digitString (suc (suc zero)) = "2"
digitString (suc (suc (suc zero))) = "3"
digitString (suc (suc (suc (suc zero)))) = "4"
digitString (suc (suc (suc (suc (suc zero))))) = "5"
digitString (suc (suc (suc (suc (suc (suc zero)))))) = "6"
digitString (suc (suc (suc (suc (suc (suc (suc zero))))))) = "7"
digitString (suc (suc (suc (suc (suc (suc (suc (suc zero)))))))) = "8"
digitString _ = "9"

incrementDigits : List ℕ → List ℕ
incrementDigits [] = suc zero ∷ []
incrementDigits (suc (suc (suc (suc (suc (suc (suc (suc (suc zero)))))))) ∷ digits) =
  zero ∷ incrementDigits digits
incrementDigits (digit ∷ digits) = suc digit ∷ digits

countDigits : ℕ → List ℕ → List ℕ
countDigits zero digits = digits
countDigits (suc value) digits = countDigits value (incrementDigits digits)

renderDigits : List ℕ → String
renderDigits [] = ""
renderDigits (digit ∷ digits) = digitString digit <> renderDigits digits

showNat : ℕ → String
showNat value = renderDigits (reverse (countDigits value (zero ∷ [])))

not : Bool → Bool
not true = false
not false = true

_&&_ : Bool → Bool → Bool
true && value = value
false && value = false

_||_ : Bool → Bool → Bool
true || value = true
false || value = value

any : (A → Bool) → List A → Bool
any predicate [] = false
any predicate (value ∷ values) = predicate value || any predicate values

containsString : String → List String → Bool
containsString wanted = any (stringEq wanted)

findStringIndex : String → List String → Maybe ℕ
findStringIndex wanted = go zero
  where
  go : ℕ → List String → Maybe ℕ
  go index [] = nothing
  go index (value ∷ values) =
    if stringEq wanted value then just index else go (suc index) values

indexPath : String → ℕ → String
indexPath prefix index = prefix <> "/" <> showNat index

errorAt : String → String → String → Diagnostic
errorAt code path message = diagnostic code error path message nothing

relatedError : String → String → String → String → Diagnostic
relatedError code path message relatedPathValue =
  diagnostic code error path message (just relatedPathValue)

leakedAnswerDiagnostic : String → String → String → List String → List Diagnostic
leakedAnswerDiagnostic base answer relatedPathValue challenge with findStringIndex answer challenge
... | nothing = []
... | just challengeIndex =
  relatedError "disclosure.answer-leaked" (indexPath (base <> "/challenge") challengeIndex)
    "Challenge content contains a withheld answer." relatedPathValue ∷ []

checkReferences : String → String → List String → List String → List Diagnostic
checkReferences code base known = go zero
  where
  go : ℕ → List String → List Diagnostic
  go index [] = []
  go index (value ∷ values) =
    (if containsString value known
      then []
      else errorAt code (indexPath base index)
        ("Referenced entity " <> value <> " is not declared.") ∷ []) ++
    go (suc index) values

duplicateStrings : String → String → List String → List Diagnostic
duplicateStrings code base = go zero []
  where
  go : ℕ → List String → List String → List Diagnostic
  go index seen [] = []
  go index seen (value ∷ values) =
    (if containsString value seen
      then errorAt code (indexPath base index)
        "Stable identities must be unique in their namespace." ∷ []
      else []) ++ go (suc index) (value ∷ seen) values

promptKey : Prompt → String
promptKey value = Prompt.promptId value <> "#" <> showNat (Prompt.revision value)

repetitionPromptKey : Repetition → String
repetitionPromptKey value =
  Repetition.promptId value <> "#" <> showNat (Repetition.promptRevision value)

promptKeys : List Prompt → List String
promptKeys = map promptKey

assetIds : List AssetReference → List String
assetIds = map AssetReference.assetId

sourceIds : List SourceRevision → List String
sourceIds = map SourceRevision.sourceId

materialIds : List MaterialRevision → List String
materialIds = map MaterialRevision.materialId

provenanceIds : List ProvenanceRecord → List String
provenanceIds = map ProvenanceRecord.provenanceId

extensionIds : List ExtensionDeclaration → List String
extensionIds = map ExtensionDeclaration.extensionId

repetitionIds : List Repetition → List String
repetitionIds = map Repetition.repetitionId

kindDiagnostics :
  String → PromptKind → Maybe (List ClozeTarget) → Maybe String →
  Maybe (List OcclusionRegion) → List Diagnostic
kindDiagnostics base basic clozeTargets sourceAsset regions = []
kindDiagnostics base cloze nothing sourceAsset regions =
  errorAt "cloze.targets-required" (base <> "/clozeTargets")
    "Cloze prompts require at least one stable target." ∷ []
kindDiagnostics base cloze (just []) sourceAsset regions =
  errorAt "cloze.targets-required" (base <> "/clozeTargets")
    "Cloze prompts require at least one stable target." ∷ []
kindDiagnostics base cloze (just (_ ∷ _)) sourceAsset regions = []
kindDiagnostics base imageOcclusion clozeTargets nothing nothing =
  errorAt "occlusion.source-required" (base <> "/sourceAsset")
    "Image occlusion requires a source asset." ∷
  errorAt "occlusion.regions-required" (base <> "/occlusionRegions")
    "Image occlusion requires at least one stable region." ∷ []
kindDiagnostics base imageOcclusion clozeTargets nothing (just regions) =
  errorAt "occlusion.source-required" (base <> "/sourceAsset")
    "Image occlusion requires a source asset." ∷ []
kindDiagnostics base imageOcclusion clozeTargets (just source) nothing =
  errorAt "occlusion.regions-required" (base <> "/occlusionRegions")
    "Image occlusion requires at least one stable region." ∷ []
kindDiagnostics base imageOcclusion clozeTargets (just source) (just []) =
  errorAt "occlusion.regions-required" (base <> "/occlusionRegions")
    "Image occlusion requires at least one stable region." ∷ []
kindDiagnostics base imageOcclusion clozeTargets (just source) (just (_ ∷ _)) = []

promptDiagnostics :
  List String → List String → List String → List String → List String →
  ℕ → Prompt → List Diagnostic
promptDiagnostics assets sources materials provenance extensions index value =
  duplicateWithheld ++ disclosure ++ kindChecks ++ references
  where
  base : String
  base = indexPath "/prompts" index

  duplicateWithheld : List Diagnostic
  duplicateWithheld = duplicateStrings "identity.duplicate" (base <> "/withheld") (Prompt.withheld value)

  disclosureFor : ℕ → List String → List Diagnostic
  disclosureFor withheldIndex [] = []
  disclosureFor withheldIndex (answer ∷ answers) =
    leakedAnswerDiagnostic base answer (indexPath (base <> "/withheld") withheldIndex)
      (Prompt.challenge value) ++
    (if containsString answer (Prompt.resolution value)
      then []
      else relatedError "disclosure.answer-missing" (base <> "/resolution")
        "Resolution content omits a withheld answer."
        (indexPath (base <> "/withheld") withheldIndex) ∷ []) ++
    disclosureFor (suc withheldIndex) answers

  disclosure : List Diagnostic
  disclosure = disclosureFor zero (Prompt.withheld value)

  kindChecks : List Diagnostic
  kindChecks = kindDiagnostics base (Prompt.kind value) (Prompt.clozeTargets value)
    (Prompt.sourceAsset value) (Prompt.occlusionRegions value)

  sourceAssetDiagnostics : List Diagnostic
  sourceAssetDiagnostics with Prompt.sourceAsset value
  ... | nothing = []
  ... | just source = if containsString source assets then [] else
      errorAt "asset.unresolved" (base <> "/sourceAsset")
        ("Referenced asset " <> source <> " is not declared.") ∷ []

  references : List Diagnostic
  references =
    checkReferences "asset.unresolved" (base <> "/assets") assets (Prompt.assetIds value) ++
    checkReferences "reference.unresolved" (base <> "/sources") sources (Prompt.sourceIds value) ++
    checkReferences "reference.unresolved" (base <> "/materials") materials (Prompt.materialIds value) ++
    checkReferences "reference.unresolved" (base <> "/provenance") provenance (Prompt.provenanceIds value) ++
    checkReferences "reference.unresolved" (base <> "/extensions/required") extensions
      (ExtensionSet.requiredExtensions (Prompt.extensions value)) ++ sourceAssetDiagnostics

allPromptDiagnostics :
  List String → List String → List String → List String → List String →
  ℕ → List Prompt → List Diagnostic
allPromptDiagnostics assets sources materials provenance extensions index [] = []
allPromptDiagnostics assets sources materials provenance extensions index (value ∷ values) =
  promptDiagnostics assets sources materials provenance extensions index value ++
  allPromptDiagnostics assets sources materials provenance extensions (suc index) values

materialDiagnostics : List String → List String → ℕ → List MaterialRevision → List Diagnostic
materialDiagnostics assets sources index [] = []
materialDiagnostics assets sources index (value ∷ values) =
  checkReferences "reference.unresolved" (indexPath "/materials" index <> "/assets") assets
    (MaterialRevision.assetIds value) ++
  checkReferences "reference.unresolved" (indexPath "/materials" index <> "/sources") sources
    (MaterialRevision.sourceIds value) ++
  materialDiagnostics assets sources (suc index) values

sourceDiagnostics : List String → ℕ → List SourceRevision → List Diagnostic
sourceDiagnostics assets index [] = []
sourceDiagnostics assets index (value ∷ values) =
  checkReferences "reference.unresolved" (indexPath "/sources" index <> "/assets") assets
    (SourceRevision.assetIds value) ++ sourceDiagnostics assets (suc index) values

extensionDiagnostics : ℕ → List ExtensionDeclaration → List Diagnostic
extensionDiagnostics index [] = []
extensionDiagnostics index (value ∷ values) = current ++ extensionDiagnostics (suc index) values
  where
  current : List Diagnostic
  current with ExtensionDeclaration.requirement value | ExtensionDeclaration.fallback value
  ... | optionalCapability | nothing = errorAt "extension.optional-fallback-missing"
      (indexPath "/extensions" index <> "/fallback")
      "Optional extensions require a portable fallback." ∷ []
  ... | optionalCapability | just fallback = []
  ... | requiredCapability | fallback = []

interoperabilityDiagnostics : ℕ → List InteroperabilityReport → List Diagnostic
interoperabilityDiagnostics index [] = []
interoperabilityDiagnostics index (value ∷ values) = current ++ interoperabilityDiagnostics (suc index) values
  where
  current : List Diagnostic
  current with InteroperabilityReport.status value | InteroperabilityReport.losses value
  ... | lossy | [] = errorAt "interoperability.loss-unreported"
      (indexPath "/interoperability" index <> "/losses")
      "Lossy conversions must identify at least one loss." ∷ []
  ... | lossy | (_ ∷ _) = []
  ... | exact | [] = []
  ... | exact | (_ ∷ _) = errorAt "interoperability.loss-unreported"
      (indexPath "/interoperability" index <> "/status")
      "An exact conversion cannot report losses." ∷ []

contiguousMigration : String → Maybe ℕ → MigrationRecord → List Diagnostic
contiguousMigration base nothing value = []
contiguousMigration base (just prior) value =
  if natEq prior (MigrationRecord.fromVersion value)
    then []
    else errorAt "migration.chain-invalid" (base <> "/fromVersion")
      "Migration history must be contiguous." ∷ []

migrationDiagnostics : Maybe ℕ → ℕ → List MigrationRecord → List Diagnostic
migrationDiagnostics previous index [] = []
migrationDiagnostics previous index (value ∷ values) =
  forward ++ contiguousMigration base previous value ++
  migrationDiagnostics (just (MigrationRecord.toVersion value)) (suc index) values
  where
  base : String
  base = indexPath "/migrations" index

  forward : List Diagnostic
  forward = if lessThan (MigrationRecord.fromVersion value) (MigrationRecord.toVersion value)
    then []
    else errorAt "migration.chain-invalid" (base <> "/toVersion")
      "Migrations must advance the format version." ∷ []

repetitionDiagnostics : List String → ℕ → List Repetition → List Diagnostic
repetitionDiagnostics prompts index [] = []
repetitionDiagnostics prompts index (value ∷ values) =
  current ++ repetitionDiagnostics prompts (suc index) values
  where
  current : List Diagnostic
  current = if containsString (repetitionPromptKey value) prompts
    then []
    else relatedError "history.prompt-unresolved"
      (indexPath "/repetitions" index <> "/promptId")
      "Repetition does not resolve to the exact served Prompt revision."
      (indexPath "/repetitions" index <> "/promptRevision") ∷ []

correctionDiagnostics : List String → ℕ → List RepetitionCorrection → List Diagnostic
correctionDiagnostics repetitions index [] = []
correctionDiagnostics repetitions index (value ∷ values) =
  current ++ correctionDiagnostics repetitions (suc index) values
  where
  invalid : Bool
  invalid = stringEq (RepetitionCorrection.correctionId value)
      (RepetitionCorrection.targetRepetitionId value) ||
    not (containsString (RepetitionCorrection.targetRepetitionId value) repetitions)

  current : List Diagnostic
  current = if invalid
    then errorAt "history.correction-invalid"
      (indexPath "/repetitionCorrections" index <> "/targetRepetitionId")
      "Correction targets must resolve to a distinct Repetition." ∷ []
    else []

validateCorpus : CorpusDocument → List Diagnostic
validateCorpus document =
  formatDiagnostics ++ identityDiagnostics ++
  allPromptDiagnostics assets sources materials provenance extensions zero (CorpusDocument.prompts document) ++
  materialDiagnostics assets sources zero (CorpusDocument.materials document) ++
  sourceDiagnostics assets zero (CorpusDocument.sources document) ++
  extensionDiagnostics zero (CorpusDocument.extensions document) ++
  interoperabilityDiagnostics zero (CorpusDocument.interoperability document) ++
  migrationDiagnostics nothing zero (CorpusDocument.migrations document) ++
  repetitionDiagnostics prompts zero (CorpusDocument.repetitions document) ++
  correctionDiagnostics repetitions zero (CorpusDocument.repetitionCorrections document)
  where
  assets = assetIds (CorpusDocument.assets document)
  sources = sourceIds (CorpusDocument.sources document)
  materials = materialIds (CorpusDocument.materials document)
  provenance = provenanceIds (CorpusDocument.provenance document)
  extensions = extensionIds (CorpusDocument.extensions document)
  prompts = promptKeys (CorpusDocument.prompts document)
  repetitions = repetitionIds (CorpusDocument.repetitions document)

  formatDiagnostics : List Diagnostic
  formatDiagnostics =
    (if stringEq (CorpusDocument.corpusFormat document) "lineage.corpus" then [] else
      errorAt "format.unsupported" "/format" "Expected lineage.corpus." ∷ []) ++
    (if natEq (CorpusDocument.corpusFormatVersion document) 1 then [] else
      errorAt "version.unsupported" "/formatVersion" "Expected format version 1." ∷ [])

  identityDiagnostics : List Diagnostic
  identityDiagnostics =
    duplicateStrings "identity.duplicate-prompt-revision" "/prompts" prompts ++
    duplicateStrings "identity.duplicate" "/repetitions" repetitions

isValidCorpus : CorpusDocument → Bool
isValidCorpus document with validateCorpus document
... | [] = true
... | _ ∷ _ = false

```
