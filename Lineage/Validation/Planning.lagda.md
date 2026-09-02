# Learning-plan validation

Proof-indexed plans are valid by construction. This Boolean projection is for
host diagnostics and confirms that every selected candidate was eligible.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Planning where

open import Data.Bool.Base using (Bool; true; false)
open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Specification.Planning as S

allEligible : {ℓ : Level} {V : S.Vocabulary ℓ} → List (S.Selected V) → Bool
allEligible [] = true
allEligible (item ∷ rest) with S.eligible (S.chosen item)
... | true = allEligible rest
... | false = false

valid : {ℓ : Level} {V : S.Vocabulary ℓ} {budget : _} →
  S.SessionPlan V budget → Bool
valid result = allEligible (S.activities result)
```
