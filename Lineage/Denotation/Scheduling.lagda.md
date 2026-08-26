# Scheduling projection denotation

A cached executable projection means the scheduler-neutral fold of its durable
chronological history. The cache is an optimization, not the definition of
meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.Scheduling where

open import Level using (Level)

import Lineage.Denotation.RepetitionHistory as HD
import Lineage.Implementation.Scheduling as I
import Lineage.Specification.Scheduling as S

private
  variable
    e s : Level
    Event : Set e
    State : Set s

denote :
  (scheduler : S.Scheduler Event State) →
  I.Projection State scheduler → State
denote scheduler executable =
  S.run scheduler (HD.denote (I.history executable))
```
