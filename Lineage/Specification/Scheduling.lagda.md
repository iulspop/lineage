# Scheduling specification

Scheduling meaning is a chronological fold over durable repetition facts. A
scheduler supplies an initial derived state and one transition per factual
event. Particular OSR algorithms and parameter sets instantiate this algebra;
they do not redefine repetition history.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.Scheduling where

open import Data.List.Base using (List; []; [_]; _∷_; _++_; foldl)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong)

record Scheduler {e s : Level} (Event : Set e) (State : Set s) : Set (e ⊔ s) where
  constructor make-scheduler
  field
    initial : State
    step : State → Event → State

open Scheduler public

run :
  {e s : Level} {Event : Set e} {State : Set s} →
  Scheduler Event State → List Event → State
run scheduler events = foldl (step scheduler) (initial scheduler) events

fold-from :
  {e s : Level} {Event : Set e} {State : Set s} →
  Scheduler Event State → State → List Event → State
fold-from scheduler state events = foldl (step scheduler) state events

fold-append-one :
  {e s : Level} {Event : Set e} {State : Set s} →
  (scheduler : Scheduler Event State) →
  (state : State) → (events : List Event) → (event : Event) →
  fold-from scheduler state (events ++ [ event ]) ≡
    step scheduler (fold-from scheduler state events) event
fold-append-one scheduler state [] event = refl
fold-append-one scheduler state (first ∷ rest) event =
  fold-append-one scheduler (step scheduler state first) rest event

run-append-one :
  {e s : Level} {Event : Set e} {State : Set s} →
  (scheduler : Scheduler Event State) →
  (events : List Event) → (event : Event) →
  run scheduler (events ++ [ event ]) ≡
    step scheduler (run scheduler events) event
run-append-one scheduler = fold-append-one scheduler (initial scheduler)
```

The fold derives replaceable state from durable facts. Current due time,
stability, difficulty, and retrievability are outputs of scheduler instances,
not fields that determine corpus meaning.
