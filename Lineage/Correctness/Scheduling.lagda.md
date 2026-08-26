# Scheduling projection correctness

The executable cache agrees with semantic denotation, and constant-time append
commutes with the scheduler transition.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.Scheduling where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong; trans)

import Lineage.Correctness.RepetitionHistory as HC
import Lineage.Denotation.RepetitionHistory as HD
import Lineage.Denotation.Scheduling as D
import Lineage.Implementation.Scheduling as I
import Lineage.Specification.Scheduling as S

private
  variable
    e s : Level
    Event : Set e
    State : Set s

cache-denotes :
  (scheduler : S.Scheduler Event State) →
  (projection : I.Projection State scheduler) →
  I.cached-state projection ≡ D.denote scheduler projection
cache-denotes scheduler executable = I.cache-correct executable

empty-homomorphic :
  (scheduler : S.Scheduler Event State) →
  D.denote scheduler (I.empty scheduler) ≡ S.initial scheduler
empty-homomorphic scheduler = refl

append-homomorphic :
  (scheduler : S.Scheduler Event State) →
  (projection : I.Projection State scheduler) → (event : Event) →
  D.denote scheduler (I.append scheduler projection event) ≡
    S.step scheduler (D.denote scheduler projection) event
append-homomorphic scheduler executable event = trans
  (cong (S.run scheduler)
    (HC.append-homomorphic (I.history executable) event))
  (S.run-append-one scheduler
    (HD.denote (I.history executable)) event)
```
