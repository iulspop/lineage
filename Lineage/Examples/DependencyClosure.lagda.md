# Prompt dependency-closure example

This fixture represents a Prompt revision that requires a source, image asset,
image region, and presentation profile. The complete local inventory validates;
omitting the image asset is rejected.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.DependencyClosure where

open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (yes; no)

import Lineage.Correctness.DependencyClosure as C
import Lineage.Denotation.DependencyClosure as D
import Lineage.Implementation.DependencyClosure as I
import Lineage.Specification.DependencyClosure as S
import Lineage.Validation.DependencyClosure as V

data Dependency : Set where
  anatomy-source skeleton-image femur-region review-profile : Dependency

dependency-equality : DecidableEquality Dependency
dependency-equality anatomy-source anatomy-source = yes refl
dependency-equality anatomy-source skeleton-image = no λ ()
dependency-equality anatomy-source femur-region = no λ ()
dependency-equality anatomy-source review-profile = no λ ()
dependency-equality skeleton-image anatomy-source = no λ ()
dependency-equality skeleton-image skeleton-image = yes refl
dependency-equality skeleton-image femur-region = no λ ()
dependency-equality skeleton-image review-profile = no λ ()
dependency-equality femur-region anatomy-source = no λ ()
dependency-equality femur-region skeleton-image = no λ ()
dependency-equality femur-region femur-region = yes refl
dependency-equality femur-region review-profile = no λ ()
dependency-equality review-profile anatomy-source = no λ ()
dependency-equality review-profile skeleton-image = no λ ()
dependency-equality review-profile femur-region = no λ ()
dependency-equality review-profile review-profile = yes refl

required = anatomy-source ∷ skeleton-image ∷ femur-region ∷ review-profile ∷ []

complete-raw : I.RawClosure Dependency
complete-raw = I.raw-closure required required

missing-asset-raw : I.RawClosure Dependency
missing-asset-raw = I.raw-closure required
  (anatomy-source ∷ femur-region ∷ review-profile ∷ [])

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

complete-accepted : IsJust (V.validate dependency-equality complete-raw)
complete-accepted = is-just

missing-asset-rejected :
  V.validate dependency-equality missing-asset-raw ≡ nothing
missing-asset-rejected = refl

complete : I.Closure Dependency
complete = V.certify complete-raw
  (V.valid λ dependency∈required → dependency∈required)

semantic-closure : S.Closure Dependency
semantic-closure = D.denote complete

requirements-agree = C.requirements-preserved complete
inventory-agrees = C.inventory-preserved complete
closure-is-complete = C.completeness-preserved complete
```
