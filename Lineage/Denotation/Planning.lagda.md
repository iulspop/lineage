# Planner denotation

An executable planner denotes the extensional function from explicit input and
budget to a proof-indexed session plan.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Planning where

open import Data.Nat.Base using (ℕ)
open import Level using (Level)
import Lineage.Implementation.Planning as I
import Lineage.Specification.Planning as S

denote : {ℓ i : Level} {V : S.Vocabulary ℓ} {Input : Set i} →
  I.Planner V Input → (input : Input) → (budget : ℕ) → S.SessionPlan V budget
denote executable-planner = I.execute executable-planner
```
