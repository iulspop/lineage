# Executable historical scheduling observations

The executable representation retains the scheduler facts recorded at review
time and attaches them to a stable Repetition identity. It makes no scheduler
family mandatory and does not cache current scheduling state.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.HistoricalScheduling where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_)

private
  variable r s v i o : Level

record Observation (RepetitionId : Set r) (Scheduler : Set s)
  (Version : Set v) (Interval : Set i) (Output : Set o) :
  Set (r ⊔ s ⊔ v ⊔ i ⊔ o) where
  constructor observation
  field
    repetition-id : RepetitionId
    scheduler-family : Scheduler
    scheduler-version : Version
    interval-before : Maybe Interval
    interval-after : Maybe Interval
    scheduler-output : Maybe Output
```
