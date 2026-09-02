# Learning evidence specification

Learning evidence is append-only factual observation. It records what happened
to an exact target, while learner models and mastery estimates remain derived.
Existing Repetitions embed without loss as recall evidence.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.LearningEvidence where

open import Data.List.Base using (List; []; [_]; _∷_; _++_; foldl)
open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Specification.LearningTarget as T
import Lineage.Specification.Repetition as R

record Vocabulary (ℓ : Level) : Set (suc ℓ) where
  field
    EvidenceId Timestamp Duration Assessment Response : Set ℓ
    target-vocabulary : T.Vocabulary ℓ
    repetition-vocabulary : R.Vocabulary ℓ

open Vocabulary public

data ActivityKind : Set where
  recall practice read lesson : ActivityKind

data ObservationKind : Set where
  presented attempted completed skipped assessed deferred : ObservationKind

record Observation {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor observation
  field
    evidence-id : EvidenceId V
    target : T.LearningTarget (target-vocabulary V)
    activity-kind : ActivityKind
    observation-kind : ObservationKind
    observed-at : Timestamp V
    duration : Maybe (Duration V)
    assessment : Maybe (Assessment V)
    response : Maybe (Response V)

open Observation public

data LearningEvidence {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  recall-evidence : R.Repetition (repetition-vocabulary V) → LearningEvidence V
  observation-evidence : Observation V → LearningEvidence V

record Fold {ℓ s : Level} (V : Vocabulary ℓ) (State : Set s) : Set (ℓ ⊔ s) where
  constructor make-fold
  field
    initial : State
    step : State → LearningEvidence V → State

open Fold public

fold-from : {ℓ s : Level} {V : Vocabulary ℓ} {State : Set s} →
  Fold V State → State → List (LearningEvidence V) → State
fold-from algebra state evidence = foldl (step algebra) state evidence

run : {ℓ s : Level} {V : Vocabulary ℓ} {State : Set s} →
  Fold V State → List (LearningEvidence V) → State
run algebra = fold-from algebra (initial algebra)

fold-append-one : {ℓ s : Level} {V : Vocabulary ℓ} {State : Set s} →
  (algebra : Fold V State) → (state : State) →
  (history : List (LearningEvidence V)) → (event : LearningEvidence V) →
  fold-from algebra state (history ++ [ event ]) ≡
    step algebra (fold-from algebra state history) event
fold-append-one algebra state [] event = refl
fold-append-one algebra state (first ∷ rest) event =
  fold-append-one algebra (step algebra state first) rest event

run-append-one : {ℓ s : Level} {V : Vocabulary ℓ} {State : Set s} →
  (algebra : Fold V State) → (history : List (LearningEvidence V)) →
  (event : LearningEvidence V) →
  run algebra (history ++ [ event ]) ≡ step algebra (run algebra history) event
run-append-one algebra = fold-append-one algebra (initial algebra)
```

Chronological order is an explicit input. Multi-device merging therefore needs
a host-declared ordering/conflict policy rather than hidden wall-clock effects.
