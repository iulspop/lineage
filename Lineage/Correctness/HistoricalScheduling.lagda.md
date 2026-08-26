# Historical scheduling correctness

Denotation preserves attachment to durable Repetition history, validation, and
every scheduler fact recorded at review time. This permits later scheduler
adapters to reinterpret history without rewriting it.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.HistoricalScheduling where

open import Data.Bool.Base using (Bool)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.HistoricalScheduling as D
import Lineage.Implementation.HistoricalScheduling as I
import Lineage.Specification.HistoricalScheduling as S
import Lineage.Validation.HistoricalScheduling as V

private
  variable
    r s v i o : Level
    RepetitionId : Set r
    Scheduler : Set s
    Version : Set v
    Interval : Set i
    Output : Set o

semanticValid :
  (RepetitionId → Bool) →
  S.Observation RepetitionId Scheduler Version Interval Output → Bool
semanticValid repetitionExists historical =
  repetitionExists (S.Observation.repetition-id historical)

validation-preserved :
  (repetitionExists : RepetitionId → Bool) →
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  V.valid repetitionExists historical ≡
    semanticValid repetitionExists (D.denote historical)
validation-preserved repetitionExists historical = refl

repetition-id-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.repetition-id (D.denote historical) ≡
    I.Observation.repetition-id historical
repetition-id-preserved historical = refl

scheduler-family-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.scheduler-family (D.denote historical) ≡
    I.Observation.scheduler-family historical
scheduler-family-preserved historical = refl

scheduler-version-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.scheduler-version (D.denote historical) ≡
    I.Observation.scheduler-version historical
scheduler-version-preserved historical = refl

interval-before-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.interval-before (D.denote historical) ≡
    I.Observation.interval-before historical
interval-before-preserved historical = refl

interval-after-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.interval-after (D.denote historical) ≡
    I.Observation.interval-after historical
interval-after-preserved historical = refl

scheduler-output-preserved :
  (historical : I.Observation RepetitionId Scheduler Version Interval Output) →
  S.Observation.scheduler-output (D.denote historical) ≡
    I.Observation.scheduler-output historical
scheduler-output-preserved historical = refl
```
