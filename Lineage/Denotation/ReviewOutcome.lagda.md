# Completed-review outcome denotation

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.ReviewOutcome where

open import Level using (Level)
import Lineage.Implementation.ReviewOutcome as I
import Lineage.Specification.ReviewOutcome as S

private
  variable
    a g : Level
    Attempt : Set a
    Assessment : Set g

denote : I.Outcome Attempt Assessment → S.Outcome Attempt Assessment
denote outcome = S.outcome
  (I.captured-response outcome)
  (I.recorded-assessment outcome)
```
