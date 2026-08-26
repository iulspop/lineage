# Repetition correction specification

A correction is a new durable event that qualifies an earlier Repetition. It
never mutates or replaces the original observation. The correction has its own
stable identity, names a distinct target, records when and why it was made, and
may supply corrected response or assessment facts.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.RepetitionCorrection where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_)

private
  variable c r t n p a : Level

record Correction (CorrectionId : Set c) (RepetitionId : Set r)
  (Timestamp : Set t) (Reason : Set n) (Response : Set p)
  (Assessment : Set a) : Set (c ⊔ r ⊔ t ⊔ n ⊔ p ⊔ a) where
  constructor correction
  field
    correction-id : CorrectionId
    target-repetition-id : RepetitionId
    corrected-at : Timestamp
    reason : Reason
    corrected-response : Maybe Response
    corrected-assessment : Maybe Assessment
```

Corrections compose with history by append. Consumers may project an effective
view, but the original Repetition and every correction remain independently
inspectable and ordered as historical facts.
