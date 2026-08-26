# Corpus manifest correctness

Manifest denotation preserves structural validity and host compatibility.
Consequently, denotation cannot hide a malformed migration chain, change the
current format version, or erase an unsupported required capability.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Manifest where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ; zero; suc; _≡ᵇ_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Migration as MC
import Lineage.Denotation.Manifest as D
import Lineage.Implementation.Manifest as I
import Lineage.Specification.Capability as C
import Lineage.Specification.Manifest as S
import Lineage.Validation.Manifest as V

private
  variable
    c p e t d i : Level
    CorpusId : Set c
    ProfileId : Set p
    ExtensionId : Set e
    Timestamp : Set t
    Digest : Set d
    MigrationId : Set i

semanticPositive : ℕ → Bool
semanticPositive zero = false
semanticPositive (suc version) = true

semanticRequirementsSupported :
  (ProfileId → ℕ → Bool) → List (S.Requirement ProfileId) → Bool
semanticRequirementsSupported supports [] = true
semanticRequirementsSupported supports (requiredCapability ∷ requirements) with
  S.Requirement.necessity requiredCapability
... | C.optional = semanticRequirementsSupported supports requirements
... | C.required =
  supports
    (S.Requirement.capability-id requiredCapability)
    (S.Requirement.version requiredCapability) ∧
  semanticRequirementsSupported supports requirements

semanticStructurallyValid :
  (Timestamp → Timestamp → Bool) →
  S.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId → Bool
semanticStructurallyValid beforeOrEqual corpusManifest =
  semanticPositive (S.Manifest.format-version corpusManifest) ∧
  beforeOrEqual
    (S.Manifest.created-at corpusManifest)
    (S.Manifest.updated-at corpusManifest) ∧
  MC.semanticValid (S.Manifest.migrations corpusManifest) ∧
  (MC.semanticCurrentVersion (S.Manifest.migrations corpusManifest) ≡ᵇ
    S.Manifest.format-version corpusManifest)

semanticCompatible :
  (ℕ → Bool) → (ProfileId → ℕ → Bool) →
  (ExtensionId → ℕ → Bool) →
  S.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId → Bool
semanticCompatible supportsFormat supportsProfile supportsExtension corpusManifest =
  supportsFormat (S.Manifest.format-version corpusManifest) ∧
  semanticRequirementsSupported supportsProfile
    (S.Manifest.profiles corpusManifest) ∧
  semanticRequirementsSupported supportsExtension
    (S.Manifest.extensions corpusManifest)

positive-preserved : (version : ℕ) →
  V.positive version ≡ semanticPositive version
positive-preserved zero = refl
positive-preserved (suc version) = refl

requirements-support-preserved :
  (supports : ProfileId → ℕ → Bool) →
  (requirements : List (I.Requirement ProfileId)) →
  V.requirementsSupported supports requirements ≡
    semanticRequirementsSupported supports (D.denoteRequirements requirements)
requirements-support-preserved supports [] = refl
requirements-support-preserved supports (requiredCapability ∷ requirements) with
  I.Requirement.necessity requiredCapability
... | C.optional = requirements-support-preserved supports requirements
... | C.required with
  supports
    (I.Requirement.capability-id requiredCapability)
    (I.Requirement.version requiredCapability)
...   | false = refl
...   | true = requirements-support-preserved supports requirements

structural-validity-preserved :
  (beforeOrEqual : Timestamp → Timestamp → Bool) →
  (corpusManifest :
    I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId) →
  V.structurallyValid beforeOrEqual corpusManifest ≡
    semanticStructurallyValid beforeOrEqual (D.denote corpusManifest)
structural-validity-preserved beforeOrEqual corpusManifest
  rewrite positive-preserved (I.Manifest.format-version corpusManifest)
        | MC.validation-preserved (I.Manifest.migrations corpusManifest)
        | MC.current-version-preserved (I.Manifest.migrations corpusManifest) = refl

compatibility-preserved :
  (supportsFormat : ℕ → Bool) →
  (supportsProfile : ProfileId → ℕ → Bool) →
  (supportsExtension : ExtensionId → ℕ → Bool) →
  (corpusManifest :
    I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId) →
  V.compatible supportsFormat supportsProfile supportsExtension corpusManifest ≡
    semanticCompatible supportsFormat supportsProfile supportsExtension
      (D.denote corpusManifest)
compatibility-preserved supportsFormat supportsProfile supportsExtension corpusManifest
  rewrite requirements-support-preserved supportsProfile
            (I.Manifest.profiles corpusManifest)
        | requirements-support-preserved supportsExtension
            (I.Manifest.extensions corpusManifest) = refl

corpus-id-preserved :
  (corpusManifest :
    I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId) →
  S.Manifest.corpus-id (D.denote corpusManifest) ≡
    I.Manifest.corpus-id corpusManifest
corpus-id-preserved corpusManifest = refl
```
