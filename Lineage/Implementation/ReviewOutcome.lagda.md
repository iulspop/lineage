# Executable completed-review outcome

The executable outcome is a compact DTO-shaped value suitable for handing to a
Repetition constructor at the host boundary.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.ReviewOutcome where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_)
import Lineage.Implementation.ReviewSession as Session
import Lineage.Specification.ReviewSession as Stage

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

record Outcome (Attempt : Set a) (Assessment : Set g) : Set (a ⊔ g) where
  constructor review-outcome
  field
    captured-response : Maybe Attempt
    recorded-assessment : Assessment

open Outcome public

finalize :
  Session.Session Content Response Attempt Assessment Stage.complete →
  Outcome Attempt Assessment
finalize (Session.recorded contract attempt assessment) =
  review-outcome attempt assessment
```
