# Version-1 corpus semantic validation

This module is the authoritative semantic validator for the canonical version-1
corpus model. Structural JSON decoding remains a host concern; after decoding,
the host maps the wire names and optional/defaulted fields into `CorpusDocument`
and delegates all corpus semantic rules to `validateCorpus`.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.CorpusWireV1 where

open import Agda.Builtin.Char using (Char)
open import Agda.Builtin.String using (primStringEquality; primStringFromList)
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

record RevisionIdentity : Set where
  constructor revisionIdentity
  field
    stableId : String
    stableRevision : ℕ

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

charEq : Char → Char → Bool
charEq left right = primStringEquality
  (primStringFromList (left ∷ [])) (primStringFromList (right ∷ []))

lowerAscii : Char → Char
lowerAscii 'A' = 'a'
lowerAscii 'B' = 'b'
lowerAscii 'C' = 'c'
lowerAscii 'D' = 'd'
lowerAscii 'E' = 'e'
lowerAscii 'F' = 'f'
lowerAscii 'G' = 'g'
lowerAscii 'H' = 'h'
lowerAscii 'I' = 'i'
lowerAscii 'J' = 'j'
lowerAscii 'K' = 'k'
lowerAscii 'L' = 'l'
lowerAscii 'M' = 'm'
lowerAscii 'N' = 'n'
lowerAscii 'O' = 'o'
lowerAscii 'P' = 'p'
lowerAscii 'Q' = 'q'
lowerAscii 'R' = 'r'
lowerAscii 'S' = 's'
lowerAscii 'T' = 't'
lowerAscii 'U' = 'u'
lowerAscii 'V' = 'v'
lowerAscii 'W' = 'w'
lowerAscii 'X' = 'x'
lowerAscii 'Y' = 'y'
lowerAscii 'Z' = 'z'
lowerAscii value = value

startsWithNormalized : List Char → List Char → Bool
startsWithNormalized [] content = true
startsWithNormalized (wanted ∷ wantedRest) [] = false
startsWithNormalized (wanted ∷ wantedRest) (value ∷ values) =
  charEq (lowerAscii wanted) (lowerAscii value) && startsWithNormalized wantedRest values

containsCharsNormalized : List Char → List Char → Bool
containsCharsNormalized [] content = false
containsCharsNormalized wanted [] = false
containsCharsNormalized wanted content@(_ ∷ values) =
  startsWithNormalized wanted content || containsCharsNormalized wanted values

containsNormalizedText : String → String → Bool
containsNormalizedText wanted content =
  containsCharsNormalized (String.toList wanted) (String.toList content)

findContainingIndex : String → List String → Maybe ℕ
findContainingIndex wanted = go zero
  where
  go : ℕ → List String → Maybe ℕ
  go index [] = nothing
  go index (value ∷ values) =
    if containsNormalizedText wanted value then just index else go (suc index) values

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
leakedAnswerDiagnostic base answer relatedPathValue challenge with findContainingIndex answer challenge
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
    (if stringEq value ""
      then errorAt "identity.empty" (indexPath base index)
        "Referenced identities must be non-empty." ∷ []
      else if containsString value known
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

emptyIdentityDiagnostics : String → String → List String → List Diagnostic
emptyIdentityDiagnostics base fieldName = go zero
  where
  go : ℕ → List String → List Diagnostic
  go index [] = []
  go index (value ∷ values) =
    (if stringEq value ""
      then errorAt "identity.empty" (indexPath base index <> "/" <> fieldName)
        "Stable identities must be non-empty." ∷ []
      else []) ++ go (suc index) values

emptyReferenceDiagnostics : String → List String → List Diagnostic
emptyReferenceDiagnostics base = go zero
  where
  go : ℕ → List String → List Diagnostic
  go index [] = []
  go index (value ∷ values) =
    (if stringEq value ""
      then errorAt "identity.empty" (indexPath base index)
        "Referenced identities must be non-empty." ∷ []
      else []) ++ go (suc index) values

revisionKey : RevisionIdentity → String
revisionKey value = RevisionIdentity.stableId value <> "#" <>
  showNat (RevisionIdentity.stableRevision value)

revisionKeys : List RevisionIdentity → List String
revisionKeys = map revisionKey

revisionDiagnostics : String → ℕ → List RevisionIdentity → List Diagnostic
revisionDiagnostics base index [] = []
revisionDiagnostics base index (value ∷ values) =
  (if natEq (RevisionIdentity.stableRevision value) zero
    then errorAt "revision.non-positive" (indexPath base index <> "/revision")
      "Revisions begin at one." ∷ []
    else []) ++ revisionDiagnostics base (suc index) values

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

promptRevisionIdentities : List Prompt → List RevisionIdentity
promptRevisionIdentities = map (λ value → revisionIdentity (Prompt.promptId value) (Prompt.revision value))

sourceRevisionIdentities : List SourceRevision → List RevisionIdentity
sourceRevisionIdentities = map (λ value → revisionIdentity
  (SourceRevision.sourceId value) (SourceRevision.revision value))

materialRevisionIdentities : List MaterialRevision → List RevisionIdentity
materialRevisionIdentities = map (λ value → revisionIdentity
  (MaterialRevision.materialId value) (MaterialRevision.revision value))

relationshipIds : List Relationship → List String
relationshipIds = map Relationship.relationshipId

correctionIds : List RepetitionCorrection → List String
correctionIds = map RepetitionCorrection.correctionId

migrationIds : List MigrationRecord → List String
migrationIds = map MigrationRecord.migrationId

reportIds : List InteroperabilityReport → List String
reportIds = map InteroperabilityReport.reportId

allEntityIds : CorpusDocument → List String
allEntityIds document =
  map Prompt.promptId (CorpusDocument.prompts document) ++
  sourceIds (CorpusDocument.sources document) ++
  materialIds (CorpusDocument.materials document) ++
  assetIds (CorpusDocument.assets document) ++
  relationshipIds (CorpusDocument.relationships document) ++
  repetitionIds (CorpusDocument.repetitions document) ++
  correctionIds (CorpusDocument.repetitionCorrections document) ++
  provenanceIds (CorpusDocument.provenance document) ++
  extensionIds (CorpusDocument.extensions document) ++
  migrationIds (CorpusDocument.migrations document) ++
  reportIds (CorpusDocument.interoperability document)

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

textLeakDiagnostic : String → String → String → String → List Diagnostic
textLeakDiagnostic answer path relatedPathValue content =
  if containsNormalizedText answer content
    then relatedError "disclosure.answer-leaked" path
      "Accessible challenge content contains a withheld answer." relatedPathValue ∷ []
    else []

maybeTextLeakDiagnostic : String → String → String → Maybe String → List Diagnostic
maybeTextLeakDiagnostic answer path relatedPathValue nothing = []
maybeTextLeakDiagnostic answer path relatedPathValue (just content) =
  textLeakDiagnostic answer path relatedPathValue content

maybeContainsString : String → Maybe String → Bool
maybeContainsString wanted nothing = false
maybeContainsString wanted (just value) = stringEq wanted value

clozeAccessibilityDiagnostics : String → String → String → ℕ → List ClozeTarget → List Diagnostic
clozeAccessibilityDiagnostics answer base relatedPathValue index [] = []
clozeAccessibilityDiagnostics answer base relatedPathValue index (target ∷ targets) =
  current ++ clozeAccessibilityDiagnostics answer base relatedPathValue (suc index) targets
  where
  current : List Diagnostic
  current with ClozeTarget.hints target
  ... | nothing = []
  ... | just hints = hintDiagnostics zero hints
    where
    hintDiagnostics : ℕ → List String → List Diagnostic
    hintDiagnostics hintIndex [] = []
    hintDiagnostics hintIndex (hint ∷ rest) =
      textLeakDiagnostic answer
        (indexPath (indexPath (base <> "/clozeTargets") index <> "/hints") hintIndex)
        relatedPathValue hint ++ hintDiagnostics (suc hintIndex) rest

regionAccessibilityDiagnostics : String → String → String → ℕ → List OcclusionRegion → List Diagnostic
regionAccessibilityDiagnostics answer base relatedPathValue index [] = []
regionAccessibilityDiagnostics answer base relatedPathValue index (region ∷ regions) =
  textLeakDiagnostic answer
    (indexPath (base <> "/occlusionRegions") index <> "/accessibleDescription")
    relatedPathValue (OcclusionRegion.accessibleDescription region) ++
  regionAccessibilityDiagnostics answer base relatedPathValue (suc index) regions

assetAccessibilityDiagnostics :
  String → String → String → List String → Maybe String → ℕ →
  List AssetReference → List Diagnostic
assetAccessibilityDiagnostics answer base relatedPathValue promptAssets sourceAsset index [] = []
assetAccessibilityDiagnostics answer base relatedPathValue promptAssets sourceAsset index (assetValue ∷ assets) =
  current ++ assetAccessibilityDiagnostics answer base relatedPathValue promptAssets sourceAsset (suc index) assets
  where
  referenced : Bool
  referenced = containsString (AssetReference.assetId assetValue) promptAssets ||
    maybeContainsString (AssetReference.assetId assetValue) sourceAsset

  current : List Diagnostic
  current = if referenced
    then maybeTextLeakDiagnostic answer
      (indexPath "/assets" index <> "/accessibleDescription")
      relatedPathValue (AssetReference.accessibleDescription assetValue)
    else []

promptDiagnostics :
  List AssetReference → List String → List String → List String → List String → List String →
  ℕ → Prompt → List Diagnostic
promptDiagnostics assetRecords assets sources materials provenance extensions index value =
  withheldRequired ++ duplicateWithheld ++ nestedIdentityDiagnostics ++
  disclosure ++ kindChecks ++ references
  where
  base : String
  base = indexPath "/prompts" index

  withheldRequired : List Diagnostic
  withheldRequired with Prompt.withheld value
  ... | [] = errorAt "disclosure.withheld-empty" (base <> "/withheld")
      "Every Prompt must conceal at least one answer." ∷ []
  ... | _ ∷ _ = []

  duplicateWithheld : List Diagnostic
  duplicateWithheld = duplicateStrings "identity.duplicate" (base <> "/withheld") (Prompt.withheld value)

  nestedIdentityDiagnostics : List Diagnostic
  nestedIdentityDiagnostics = clozeIdentityDiagnostics ++ regionIdentityDiagnostics
    where
    clozeIdentityDiagnostics : List Diagnostic
    clozeIdentityDiagnostics with Prompt.clozeTargets value
    ... | nothing = []
    ... | just targets =
      emptyIdentityDiagnostics (base <> "/clozeTargets") "id" (map ClozeTarget.targetId targets) ++
      duplicateStrings "identity.duplicate" (base <> "/clozeTargets")
        (map ClozeTarget.targetId targets)

    regionIdentityDiagnostics : List Diagnostic
    regionIdentityDiagnostics with Prompt.occlusionRegions value
    ... | nothing = []
    ... | just regions =
      emptyIdentityDiagnostics (base <> "/occlusionRegions") "id"
        (map OcclusionRegion.regionId regions) ++
      duplicateStrings "identity.duplicate" (base <> "/occlusionRegions")
        (map OcclusionRegion.regionId regions)

  accessibleLeakDiagnostics : String → String → List Diagnostic
  accessibleLeakDiagnostics answer relatedPathValue =
    clozeLeaks ++ regionLeaks ++ assetLeaks
    where
    clozeLeaks : List Diagnostic
    clozeLeaks with Prompt.clozeTargets value
    ... | nothing = []
    ... | just targets = clozeAccessibilityDiagnostics answer base relatedPathValue zero targets

    regionLeaks : List Diagnostic
    regionLeaks with Prompt.occlusionRegions value
    ... | nothing = []
    ... | just regions = regionAccessibilityDiagnostics answer base relatedPathValue zero regions

    assetLeaks : List Diagnostic
    assetLeaks = assetAccessibilityDiagnostics answer base relatedPathValue
      (Prompt.assetIds value) (Prompt.sourceAsset value) zero assetRecords

  disclosureFor : ℕ → List String → List Diagnostic
  disclosureFor withheldIndex [] = []
  disclosureFor withheldIndex (answer ∷ answers) =
    leakedAnswerDiagnostic base answer (indexPath (base <> "/withheld") withheldIndex)
      (Prompt.challenge value) ++
    accessibleLeakDiagnostics answer (indexPath (base <> "/withheld") withheldIndex) ++
    (if any (containsNormalizedText answer) (Prompt.resolution value)
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
  List AssetReference → List String → List String → List String → List String → List String →
  ℕ → List Prompt → List Diagnostic
allPromptDiagnostics assetRecords assets sources materials provenance extensions index [] = []
allPromptDiagnostics assetRecords assets sources materials provenance extensions index (value ∷ values) =
  promptDiagnostics assetRecords assets sources materials provenance extensions index value ++
  allPromptDiagnostics assetRecords assets sources materials provenance extensions (suc index) values

materialDiagnostics :
  List String → List String → List String → ℕ → List MaterialRevision → List Diagnostic
materialDiagnostics assets sources provenance index [] = []
materialDiagnostics assets sources provenance index (value ∷ values) =
  checkReferences "reference.unresolved" (indexPath "/materials" index <> "/assets") assets
    (MaterialRevision.assetIds value) ++
  checkReferences "reference.unresolved" (indexPath "/materials" index <> "/sources") sources
    (MaterialRevision.sourceIds value) ++
  checkReferences "reference.unresolved" (indexPath "/materials" index <> "/provenance") provenance
    (MaterialRevision.provenanceIds value) ++
  materialDiagnostics assets sources provenance (suc index) values

sourceDiagnostics : List String → List String → ℕ → List SourceRevision → List Diagnostic
sourceDiagnostics assets provenance index [] = []
sourceDiagnostics assets provenance index (value ∷ values) =
  checkReferences "reference.unresolved" (indexPath "/sources" index <> "/assets") assets
    (SourceRevision.assetIds value) ++
  checkReferences "reference.unresolved" (indexPath "/sources" index <> "/provenance") provenance
    (SourceRevision.provenanceIds value) ++
  sourceDiagnostics assets provenance (suc index) values

entityReferenceDiagnostics :
  List String → List String → String → EntityReference → List Diagnostic
entityReferenceDiagnostics entityIds revisionEntityKeys base value =
  emptyCheck ++ revisionCheck ++ resolutionCheck
  where
  id : String
  id = EntityReference.referenceId value

  emptyCheck : List Diagnostic
  emptyCheck = if stringEq id ""
    then errorAt "identity.empty" (base <> "/id") "Referenced identities must be non-empty." ∷ []
    else []

  revisionCheck : List Diagnostic
  revisionCheck with EntityReference.referenceRevision value
  ... | nothing = []
  ... | just revision = if natEq revision zero
    then errorAt "revision.non-positive" (base <> "/revision")
      "Referenced revisions begin at one." ∷ []
    else []

  resolves : Bool
  resolves with EntityReference.referenceRevision value
  ... | nothing = containsString id entityIds
  ... | just revision = containsString (id <> "#" <> showNat revision) revisionEntityKeys

  resolutionCheck : List Diagnostic
  resolutionCheck = if resolves then [] else
    errorAt "reference.unresolved" base "Relationship endpoint does not resolve." ∷ []

relationshipDiagnostics :
  List String → List String → ℕ → List Relationship → List Diagnostic
relationshipDiagnostics entityIds revisionEntityKeys index [] = []
relationshipDiagnostics entityIds revisionEntityKeys index (value ∷ values) =
  entityReferenceDiagnostics entityIds revisionEntityKeys (base <> "/source")
    (Relationship.source value) ++
  entityReferenceDiagnostics entityIds revisionEntityKeys (base <> "/target")
    (Relationship.target value) ++
  relationshipDiagnostics entityIds revisionEntityKeys (suc index) values
  where
  base : String
  base = indexPath "/relationships" index

provenanceLinkDiagnostics : List String → ℕ → List ProvenanceRecord → List Diagnostic
provenanceLinkDiagnostics provenance index [] = []
provenanceLinkDiagnostics provenance index (value ∷ values) =
  checkReferences "reference.unresolved"
    (indexPath "/provenance" index <> "/sources") provenance
    (ProvenanceRecord.sourceProvenanceIds value) ++
  provenanceLinkDiagnostics provenance (suc index) values

repetitionProvenanceDiagnostics : List String → ℕ → List Repetition → List Diagnostic
repetitionProvenanceDiagnostics provenance index [] = []
repetitionProvenanceDiagnostics provenance index (value ∷ values) =
  checkReferences "reference.unresolved"
    (indexPath "/repetitions" index <> "/provenance") provenance
    (Repetition.provenanceIds value) ++
  repetitionProvenanceDiagnostics provenance (suc index) values

correctionProvenanceDiagnostics : List String → ℕ → List RepetitionCorrection → List Diagnostic
correctionProvenanceDiagnostics provenance index [] = []
correctionProvenanceDiagnostics provenance index (value ∷ values) =
  checkReferences "reference.unresolved"
    (indexPath "/repetitionCorrections" index <> "/provenance") provenance
    (RepetitionCorrection.provenanceIds value) ++
  correctionProvenanceDiagnostics provenance (suc index) values

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
  current =
    (if stringEq (Repetition.promptId value) ""
      then errorAt "identity.empty" (indexPath "/repetitions" index <> "/promptId")
        "Referenced Prompt identity must be non-empty." ∷ []
      else []) ++
    (if natEq (Repetition.promptRevision value) zero
      then errorAt "revision.non-positive"
        (indexPath "/repetitions" index <> "/promptRevision")
        "Referenced Prompt revisions begin at one." ∷ []
      else []) ++
    (if containsString (repetitionPromptKey value) prompts
      then []
      else relatedError "history.prompt-unresolved"
        (indexPath "/repetitions" index <> "/promptId")
        "Repetition does not resolve to the exact served Prompt revision."
        (indexPath "/repetitions" index <> "/promptRevision") ∷ [])

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
  current =
    (if stringEq (RepetitionCorrection.targetRepetitionId value) ""
      then errorAt "identity.empty"
        (indexPath "/repetitionCorrections" index <> "/targetRepetitionId")
        "Referenced Repetition identity must be non-empty." ∷ []
      else []) ++
    (if invalid
      then errorAt "history.correction-invalid"
        (indexPath "/repetitionCorrections" index <> "/targetRepetitionId")
        "Correction targets must resolve to a distinct Repetition." ∷ []
      else [])

validateCorpus : CorpusDocument → List Diagnostic
validateCorpus document =
  formatDiagnostics ++ identityDiagnostics ++ revisionValidityDiagnostics ++
  allPromptDiagnostics (CorpusDocument.assets document) assets sources materials provenance extensions zero
    (CorpusDocument.prompts document) ++
  materialDiagnostics assets sources provenance zero (CorpusDocument.materials document) ++
  sourceDiagnostics assets provenance zero (CorpusDocument.sources document) ++
  relationshipDiagnostics entityIds revisionEntityKeys zero (CorpusDocument.relationships document) ++
  provenanceLinkDiagnostics provenance zero (CorpusDocument.provenance document) ++
  repetitionProvenanceDiagnostics provenance zero (CorpusDocument.repetitions document) ++
  correctionProvenanceDiagnostics provenance zero (CorpusDocument.repetitionCorrections document) ++
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
  relationships = relationshipIds (CorpusDocument.relationships document)
  corrections = correctionIds (CorpusDocument.repetitionCorrections document)
  migrations = migrationIds (CorpusDocument.migrations document)
  reports = reportIds (CorpusDocument.interoperability document)
  promptRevisions = promptRevisionIdentities (CorpusDocument.prompts document)
  sourceRevisions = sourceRevisionIdentities (CorpusDocument.sources document)
  materialRevisions = materialRevisionIdentities (CorpusDocument.materials document)
  revisionEntityKeys = revisionKeys promptRevisions ++ revisionKeys sourceRevisions ++ revisionKeys materialRevisions
  entityIds = allEntityIds document

  formatDiagnostics : List Diagnostic
  formatDiagnostics =
    (if stringEq (CorpusDocument.corpusFormat document) "lineage.corpus" then [] else
      errorAt "format.unsupported-version" "/format"
        "Expected lineage.corpus format version 1." ∷ []) ++
    (if natEq (CorpusDocument.corpusFormatVersion document) 1 then [] else
      errorAt "format.unsupported-version" "/formatVersion"
        "Expected lineage.corpus format version 1." ∷ [])

  identityDiagnostics : List Diagnostic
  identityDiagnostics =
    (if stringEq (CorpusDocument.corpusId document) ""
      then errorAt "identity.empty" "/corpusId" "Corpus identity must be non-empty." ∷ []
      else []) ++
    emptyIdentityDiagnostics "/prompts" "id" (map Prompt.promptId (CorpusDocument.prompts document)) ++
    emptyIdentityDiagnostics "/sources" "id" sources ++
    emptyIdentityDiagnostics "/materials" "id" materials ++
    emptyIdentityDiagnostics "/assets" "id" assets ++
    emptyIdentityDiagnostics "/relationships" "id" relationships ++
    emptyIdentityDiagnostics "/repetitions" "id" repetitions ++
    emptyIdentityDiagnostics "/repetitionCorrections" "id" corrections ++
    emptyIdentityDiagnostics "/provenance" "id" provenance ++
    emptyIdentityDiagnostics "/extensions" "id" extensions ++
    emptyIdentityDiagnostics "/migrations" "id" migrations ++
    emptyIdentityDiagnostics "/interoperability" "id" reports ++
    duplicateStrings "identity.duplicate-prompt-revision" "/prompts" prompts ++
    duplicateStrings "identity.duplicate" "/sources" (revisionKeys sourceRevisions) ++
    duplicateStrings "identity.duplicate" "/materials" (revisionKeys materialRevisions) ++
    duplicateStrings "identity.duplicate" "/assets" assets ++
    duplicateStrings "identity.duplicate" "/relationships" relationships ++
    duplicateStrings "identity.duplicate" "/repetitions" repetitions ++
    duplicateStrings "identity.duplicate" "/repetitionCorrections" corrections ++
    duplicateStrings "identity.duplicate" "/provenance" provenance ++
    duplicateStrings "identity.duplicate" "/extensions" extensions ++
    duplicateStrings "identity.duplicate" "/migrations" migrations ++
    duplicateStrings "identity.duplicate" "/interoperability" reports

  revisionValidityDiagnostics : List Diagnostic
  revisionValidityDiagnostics =
    revisionDiagnostics "/prompts" zero promptRevisions ++
    revisionDiagnostics "/sources" zero sourceRevisions ++
    revisionDiagnostics "/materials" zero materialRevisions

isValidCorpus : CorpusDocument → Bool
isValidCorpus document with validateCorpus document
... | [] = true
... | _ ∷ _ = false

```
