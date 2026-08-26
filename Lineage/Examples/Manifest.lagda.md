# Corpus manifest examples

The checked fixtures demonstrate an accepted manifest, optional-capability
forward compatibility, and rejection of zero versions, inconsistent migration
history, and unsupported required capabilities.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Manifest where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using ([]; _∷_)
open import Data.Nat.Base using (ℕ; _≡ᵇ_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Manifest as C
import Lineage.Denotation.Manifest as D
import Lineage.Examples.Migration as ME
import Lineage.Implementation.Manifest as I
import Lineage.Implementation.Migration as M
import Lineage.Specification.Capability as Cap
import Lineage.Validation.Manifest as V

beforeOrEqual : ℕ → ℕ → Bool
beforeOrEqual earlier later = earlier ≡ᵇ later

supportsFormat : ℕ → Bool
supportsFormat version = version ≡ᵇ 4

supportsProfile : ℕ → ℕ → Bool
supportsProfile capability version = (capability ≡ᵇ 10) ∧ (version ≡ᵇ 1)

supportsExtension : ℕ → ℕ → Bool
supportsExtension capability version = (capability ≡ᵇ 20) ∧ (version ≡ᵇ 2)

requiredProfile : I.Requirement ℕ
requiredProfile = I.requirement 10 1 Cap.required

optionalUnknownExtension : I.Requirement ℕ
optionalUnknownExtension = I.requirement 99 8 Cap.optional

requiredUnknownExtension : I.Requirement ℕ
requiredUnknownExtension = I.requirement 99 8 Cap.required

acceptedManifest : I.Manifest ℕ ℕ ℕ ℕ ℕ ℕ
acceptedManifest = I.manifest
  1000 4 500 500
  (requiredProfile ∷ [])
  (optionalUnknownExtension ∷ [])
  12345
  ME.validHistory

zeroVersionManifest : I.Manifest ℕ ℕ ℕ ℕ ℕ ℕ
zeroVersionManifest = I.manifest
  1000 0 500 500 [] [] 12345 (M.history 0 [])

inconsistentManifest : I.Manifest ℕ ℕ ℕ ℕ ℕ ℕ
inconsistentManifest = I.manifest
  1000 3 500 500 [] [] 12345 ME.validHistory

unsupportedManifest : I.Manifest ℕ ℕ ℕ ℕ ℕ ℕ
unsupportedManifest = I.manifest
  1000 4 500 500 [] (requiredUnknownExtension ∷ []) 12345 ME.validHistory

accepted-structure-proof :
  V.structurallyValid beforeOrEqual acceptedManifest ≡ true
accepted-structure-proof = refl

accepted-compatibility-proof :
  V.compatible supportsFormat supportsProfile supportsExtension acceptedManifest ≡ true
accepted-compatibility-proof = refl

zero-version-rejection-proof :
  V.structurallyValid beforeOrEqual zeroVersionManifest ≡ false
zero-version-rejection-proof = refl

migration-result-rejection-proof :
  V.structurallyValid beforeOrEqual inconsistentManifest ≡ false
migration-result-rejection-proof = refl

required-extension-rejection-proof :
  V.compatible supportsFormat supportsProfile supportsExtension unsupportedManifest ≡ false
required-extension-rejection-proof = refl

semantic-compatibility-proof :
  C.semanticCompatible supportsFormat supportsProfile supportsExtension
    (D.denote acceptedManifest) ≡ true
semantic-compatibility-proof = refl
```
