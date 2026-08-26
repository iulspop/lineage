# Historical scheduling validation

A scheduling observation is locally valid only when its Repetition identity
resolves in the durable history. Scheduler families and versions are open data:
validation preserves unknown historical schedulers rather than requiring the
current application to execute them.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.HistoricalScheduling where

open import Data.Bool.Base using (Bool)
open import Level using (Level)
import Lineage.Implementation.HistoricalScheduling as I

private
  variable
    r s v i o : Level
    RepetitionId : Set r
    Scheduler : Set s
    Version : Set v
    Interval : Set i
    Output : Set o

valid :
  (RepetitionId → Bool) →
  I.Observation RepetitionId Scheduler Version Interval Output → Bool
valid repetitionExists historical =
  repetitionExists (I.Observation.repetition-id historical)
```
