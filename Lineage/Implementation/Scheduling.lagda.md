# Cached scheduling projection

The executable projection stores repetition history in its constant-time
newest-first representation and caches the scheduler fold. Its indexed proof
prevents stale cache values from being constructed.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.Scheduling where

open import Data.List.Properties using (unfold-reverse)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong; sym; trans)

import Lineage.Denotation.RepetitionHistory as HD
import Lineage.Implementation.RepetitionHistory as HI
import Lineage.Specification.Scheduling as S

record Projection {e s : Level} {Event : Set e} (State : Set s)
    (scheduler : S.Scheduler Event State) : Set (e ⊔ s) where
  constructor projection
  field
    history : HI.History Event
    cached-state : State
    cache-correct : cached-state ≡ S.run scheduler (HD.denote history)

open Projection public

empty :
  {e s : Level} {Event : Set e} {State : Set s} →
  (scheduler : S.Scheduler Event State) → Projection State scheduler
empty scheduler = projection HI.empty (S.initial scheduler) refl

append :
  {e s : Level} {Event : Set e} {State : Set s} →
  (scheduler : S.Scheduler Event State) →
  Projection State scheduler → Event → Projection State scheduler
append scheduler prior event = projection
  (HI.append (history prior) event)
  (S.step scheduler (cached-state prior) event)
  proof
  where
  proof :
    S.step scheduler (cached-state prior) event ≡
      S.run scheduler (HD.denote (HI.append (history prior) event))
  proof = trans
    (cong (λ state → S.step scheduler state event) (cache-correct prior))
    (trans
      (sym (S.run-append-one scheduler (HD.denote (history prior)) event))
      (cong (S.run scheduler)
        (sym (unfold-reverse event (HI.newest-first (history prior))))))
```

Appending updates both the reverse history and cached scheduler state in
constant time. The proof is erased by compilation but rules out semantic drift
during development.
