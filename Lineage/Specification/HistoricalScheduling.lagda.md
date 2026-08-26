# Historical scheduling specification

Historical scheduling records what a scheduler consumed and produced for one
completed review. It is durable evidence about that event, not the learner's
current due state. Scheduler family and version remain open data so old records
stay meaningful when implementations change.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.HistoricalScheduling where

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

Values such as current stability, difficulty, retrievability, and next due time
are deliberately absent. They can be recomputed from durable history under a
selected scheduling interpretation.
