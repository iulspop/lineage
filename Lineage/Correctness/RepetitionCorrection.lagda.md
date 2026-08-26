# Repetition correction correctness

Denotation preserves correction validation and every durable field. Consequently
an implementation cannot silently redirect, apply, or discard a correction
while claiming to preserve its Lineage meaning.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.RepetitionCorrection where

open import Data.Bool.Base using (Bool; _∧_)
open import Level using (Level)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.RepetitionCorrection as D
import Lineage.Implementation.RepetitionCorrection as I
import Lineage.Specification.RepetitionCorrection as S
import Lineage.Validation.RepetitionCorrection as V

private
  variable
    ℓ t n p a : Level
    EventId : Set ℓ
    Timestamp : Set t
    Reason : Set n
    Response : Set p
    Assessment : Set a

semanticValid :
  DecidableEquality EventId →
  (EventId → Bool) →
  S.Correction EventId EventId Timestamp Reason Response Assessment → Bool
semanticValid equality repetitionExists value =
  repetitionExists (S.Correction.target-repetition-id value) ∧
  V.isDistinct equality
    (S.Correction.correction-id value)
    (S.Correction.target-repetition-id value)

validation-preserved :
  (equality : DecidableEquality EventId) →
  (repetitionExists : EventId → Bool) →
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  V.valid equality repetitionExists value ≡
    semanticValid equality repetitionExists (D.denote value)
validation-preserved equality repetitionExists value = refl

correction-id-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.correction-id (D.denote value) ≡ I.Correction.correction-id value
correction-id-preserved value = refl

target-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.target-repetition-id (D.denote value) ≡
    I.Correction.target-repetition-id value
target-preserved value = refl

timestamp-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.corrected-at (D.denote value) ≡ I.Correction.corrected-at value
timestamp-preserved value = refl

reason-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.reason (D.denote value) ≡ I.Correction.reason value
reason-preserved value = refl

response-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.corrected-response (D.denote value) ≡
    I.Correction.corrected-response value
response-preserved value = refl

assessment-preserved :
  (value : I.Correction EventId EventId Timestamp Reason Response Assessment) →
  S.Correction.corrected-assessment (D.denote value) ≡
    I.Correction.corrected-assessment value
assessment-preserved value = refl
```
