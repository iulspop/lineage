# Historical scheduling examples

The fixtures retain the exact scheduler family, version, intervals, and output
that accompanied a known Repetition. An observation attached to a missing
Repetition is rejected even though its open scheduler identifiers are preserved.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.HistoricalScheduling where

open import Data.Bool.Base using (Bool; true; false)
open import Data.Maybe.Base using (just)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.HistoricalScheduling as C
import Lineage.Denotation.HistoricalScheduling as D
import Lineage.Implementation.HistoricalScheduling as I
import Lineage.Specification.HistoricalScheduling as S
import Lineage.Validation.HistoricalScheduling as V

repetitionExists : ℕ → Bool
repetitionExists (suc zero) = true
repetitionExists repetition-id = false

knownObservation : I.Observation ℕ ℕ ℕ ℕ ℕ
knownObservation = I.observation
  (suc zero)
  1
  19
  (just 12)
  (just 29)
  (just 29)

missingObservation : I.Observation ℕ ℕ ℕ ℕ ℕ
missingObservation = I.observation
  (suc (suc zero))
  99
  1
  (just 4)
  (just 8)
  (just 8)

known-validation-proof : V.valid repetitionExists knownObservation ≡ true
known-validation-proof = refl

missing-repetition-rejection-proof :
  V.valid repetitionExists missingObservation ≡ false
missing-repetition-rejection-proof = refl

scheduler-preserved-proof :
  S.Observation.scheduler-family (D.denote knownObservation) ≡ 1
scheduler-preserved-proof = refl

interval-after-preserved-proof :
  S.Observation.interval-after (D.denote knownObservation) ≡ just 29
interval-after-preserved-proof = refl

semantic-validation-proof :
  C.semanticValid repetitionExists (D.denote knownObservation) ≡ true
semantic-validation-proof = refl
```
