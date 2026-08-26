# Historical scheduling denotation

Denotation removes the executable record representation while preserving every
durable scheduler observation. No current scheduling interpretation is applied.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.HistoricalScheduling where

open import Level using (Level)
import Lineage.Implementation.HistoricalScheduling as I
import Lineage.Specification.HistoricalScheduling as S

private
  variable
    r s v i o : Level
    RepetitionId : Set r
    Scheduler : Set s
    Version : Set v
    Interval : Set i
    Output : Set o

denote :
  I.Observation RepetitionId Scheduler Version Interval Output →
  S.Observation RepetitionId Scheduler Version Interval Output
denote historical = S.observation
  (I.Observation.repetition-id historical)
  (I.Observation.scheduler-family historical)
  (I.Observation.scheduler-version historical)
  (I.Observation.interval-before historical)
  (I.Observation.interval-after historical)
  (I.Observation.scheduler-output historical)
```
