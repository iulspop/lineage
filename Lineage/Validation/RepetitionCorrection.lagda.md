# Repetition correction validation

A correction is valid only when its target Repetition exists and its own stable
identity is not being used as the target identity. The latter rule prevents a
correction from ambiguously correcting itself when identity domains coincide.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.RepetitionCorrection where

open import Data.Bool.Base using (Bool; false; _∧_)
open import Level using (Level)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Nullary.Decidable using (yes; no)
import Lineage.Implementation.RepetitionCorrection as I

private
  variable
    ℓ t n p a : Level
    EventId : Set ℓ
    Timestamp : Set t
    Reason : Set n
    Response : Set p
    Assessment : Set a

isDistinct : DecidableEquality EventId → EventId → EventId → Bool
isDistinct equality left right with equality left right
... | yes _ = false
... | no _ = Data.Bool.Base.true

valid :
  DecidableEquality EventId →
  (EventId → Bool) →
  I.Correction EventId EventId Timestamp Reason Response Assessment → Bool
valid equality repetitionExists value =
  repetitionExists (I.Correction.target-repetition-id value) ∧
  isDistinct equality
    (I.Correction.correction-id value)
    (I.Correction.target-repetition-id value)
```
