# Executable learning plans

The executable planner returns the proof-indexed semantic plan. Ordering and
scoring algorithms remain replaceable pure functions of explicit input.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Planning where

open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
import Lineage.Specification.Planning as S

record Planner {ℓ i : Level} (V : S.Vocabulary ℓ) (Input : Set i) : Set (ℓ ⊔ i) where
  constructor planner
  field
    execute : (input : Input) → (budget : ℕ) → S.SessionPlan V budget

open Planner public
```
