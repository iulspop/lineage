# Learning planning specification

Planning selects authored, eligible activities under explicit limits. Scores,
mastery estimates, policy identities, time, and seed are inputs or outputs of a
replaceable policy; they are not durable corpus meaning.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Planning where

open import Data.Bool.Base using (Bool; true)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ; zero; _+_; _≤_)
open import Data.List.Relation.Unary.All using (All; []; _∷_)
open import Level using (Level; _⊔_; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Specification.LearningEvidence as E
import Lineage.Specification.LearningTarget as T

record Vocabulary (ℓ : Level) : Set (suc ℓ) where
  field
    ActivityId Rationale PolicyId Score Seed : Set ℓ
    target-vocabulary : T.Vocabulary ℓ

open Vocabulary public

record Activity {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor activity
  field
    activity-id : ActivityId V
    target : T.LearningTarget (target-vocabulary V)
    kind : E.ActivityKind
    estimated-minutes : ℕ

open Activity public

record Candidate {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor candidate
  field
    proposed : Activity V
    eligible : Bool
    score : Score V
    rationales : List (Rationale V)

open Candidate public

record PolicyIdentity {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor policy-identity
  field
    policy-id : PolicyId V
    version : ℕ

open PolicyIdentity public

record Selected {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor selected
  field
    chosen : Candidate V
    eligibility-proof : eligible chosen ≡ true

open Selected public

minutes : {ℓ : Level} {V : Vocabulary ℓ} → List (Selected V) → ℕ
minutes [] = zero
minutes (first ∷ rest) = estimated-minutes (proposed (chosen first)) + minutes rest

record SessionPlan {ℓ : Level} (V : Vocabulary ℓ) (budget : ℕ) : Set ℓ where
  constructor session-plan
  field
    activities : List (Selected V)
    deferred : List (Candidate V)
    policies : List (PolicyIdentity V)
    tie-break-seed : Seed V
    budget-proof : minutes activities ≤ budget

open SessionPlan public

record Planner {ℓ i : Level} (V : Vocabulary ℓ) (Input : Set i) : Set (ℓ ⊔ i) where
  constructor planner
  field
    plan : (input : Input) → (budget : ℕ) → SessionPlan V budget

open Planner public

deterministic : {ℓ i : Level} {V : Vocabulary ℓ} {Input : Set i} →
  (policy : Planner V Input) → (input : Input) → (budget : ℕ) →
  plan policy input budget ≡ plan policy input budget
deterministic policy input budget = refl

selected-eligible : {ℓ : Level} {V : Vocabulary ℓ} →
  (item : Selected V) → eligible (chosen item) ≡ true
selected-eligible = eligibility-proof

plan-budget-sound : {ℓ : Level} {V : Vocabulary ℓ} {budget : ℕ} →
  (result : SessionPlan V budget) → minutes (activities result) ≤ budget
plan-budget-sound = budget-proof
```

Membership and eligibility are carried by `Selected`; budget soundness is
carried by `SessionPlan`. Implementations may optimize selection and ordering,
but cannot construct a plan that violates these semantic obligations.
