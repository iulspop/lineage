# Executable repetition corrections

The executable representation is an appendable correction record. Validation
is separate so decoded or imported records can be checked before entering the
trusted corpus.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.RepetitionCorrection where

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
