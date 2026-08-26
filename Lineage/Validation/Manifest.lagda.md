# Corpus manifest validation

Structural validity requires a positive format version, ordered timestamps, a
valid migration chain, and agreement between the declared format and migration
result. Compatibility requires support for every required profile and extension;
unknown optional capabilities may be preserved and ignored.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Manifest where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ; zero; suc; _≡ᵇ_)
open import Level using (Level)
import Lineage.Implementation.Manifest as I
import Lineage.Specification.Capability as C
import Lineage.Validation.Migration as M

private
  variable
    c p e t d i : Level
    CorpusId : Set c
    ProfileId : Set p
    ExtensionId : Set e
    Timestamp : Set t
    Digest : Set d
    MigrationId : Set i

positive : ℕ → Bool
positive zero = false
positive (suc version) = true

requirementsSupported :
  (ProfileId → ℕ → Bool) → List (I.Requirement ProfileId) → Bool
requirementsSupported supports [] = true
requirementsSupported supports (requiredCapability ∷ requirements) with
  I.Requirement.necessity requiredCapability
... | C.optional = requirementsSupported supports requirements
... | C.required =
  supports
    (I.Requirement.capability-id requiredCapability)
    (I.Requirement.version requiredCapability) ∧
  requirementsSupported supports requirements

structurallyValid :
  (Timestamp → Timestamp → Bool) →
  I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId → Bool
structurallyValid beforeOrEqual corpusManifest =
  positive (I.Manifest.format-version corpusManifest) ∧
  beforeOrEqual
    (I.Manifest.created-at corpusManifest)
    (I.Manifest.updated-at corpusManifest) ∧
  M.valid (I.Manifest.migrations corpusManifest) ∧
  (M.currentVersion (I.Manifest.migrations corpusManifest) ≡ᵇ
    I.Manifest.format-version corpusManifest)

compatible :
  (ℕ → Bool) → (ProfileId → ℕ → Bool) →
  (ExtensionId → ℕ → Bool) →
  I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId → Bool
compatible supportsFormat supportsProfile supportsExtension corpusManifest =
  supportsFormat (I.Manifest.format-version corpusManifest) ∧
  requirementsSupported supportsProfile (I.Manifest.profiles corpusManifest) ∧
  requirementsSupported supportsExtension (I.Manifest.extensions corpusManifest)
```
