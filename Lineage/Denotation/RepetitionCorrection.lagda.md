# Repetition correction denotation

Denotation preserves the correction as a separate historical fact. It does not
apply the correction destructively or erase the target Repetition.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.RepetitionCorrection where

open import Level using (Level)
import Lineage.Implementation.RepetitionCorrection as I
import Lineage.Specification.RepetitionCorrection as S

private
  variable
    c r t n p a : Level
    CorrectionId : Set c
    RepetitionId : Set r
    Timestamp : Set t
    Reason : Set n
    Response : Set p
    Assessment : Set a

denote :
  I.Correction CorrectionId RepetitionId Timestamp Reason Response Assessment →
  S.Correction CorrectionId RepetitionId Timestamp Reason Response Assessment
denote value = S.correction
  (I.Correction.correction-id value)
  (I.Correction.target-repetition-id value)
  (I.Correction.corrected-at value)
  (I.Correction.reason value)
  (I.Correction.corrected-response value)
  (I.Correction.corrected-assessment value)
```
