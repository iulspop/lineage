# Learning-planner correctness

Planner execution denotes the same extensional function, and every returned
plan exposes eligibility and budget witnesses.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Planning where

open import Data.Bool.Base using (true)
open import Data.Nat.Base using (ℕ; _≤_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Planning as D
import Lineage.Implementation.Planning as I
import Lineage.Specification.Planning as S

execute-homomorphic : {ℓ i : Level} {V : S.Vocabulary ℓ} {Input : Set i} →
  (executable-planner : I.Planner V Input) → (input : Input) → (budget : ℕ) →
  D.denote executable-planner input budget ≡ I.execute executable-planner input budget
execute-homomorphic executable-planner input budget = refl

deterministic : {ℓ i : Level} {V : S.Vocabulary ℓ} {Input : Set i} →
  (executable-planner : I.Planner V Input) → (input : Input) → (budget : ℕ) →
  I.execute executable-planner input budget ≡ I.execute executable-planner input budget
deterministic executable-planner input budget = refl

selected-membership-eligible : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (item : S.Selected V) → S.eligible (S.chosen item) ≡ true
selected-membership-eligible = S.eligibility-proof

budget-sound : {ℓ : Level} {V : S.Vocabulary ℓ} {budget : ℕ} →
  (result : S.SessionPlan V budget) →
  S.minutes (S.activities result) ≤ budget
budget-sound = S.budget-proof
```
