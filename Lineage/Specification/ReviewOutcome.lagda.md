# Completed review outcome specification

A completed session yields exactly the learner-supplied attempt, when any, and
the assessment recorded after disclosure. These are the session facts consumed
by durable Repetition construction; presentation state itself is not persisted
as mutable session state.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.ReviewOutcome where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_)
import Lineage.Specification.ReviewContract as Contract
import Lineage.Specification.ReviewSession as Session

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

record Outcome (Attempt : Set a) (Assessment : Set g) : Set (a ⊔ g) where
  constructor outcome
  field
    response : Maybe Attempt
    assessment : Assessment

open Outcome public

finalize : ∀ {contract : Contract.Contract Content Response} →
  Session.Session contract Attempt Assessment Session.complete →
  Outcome Attempt Assessment
finalize (Session.completed attempt assessment) = outcome attempt assessment
```
