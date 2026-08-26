# Append-only repetition correction examples

A correction targeting an existing, distinct Repetition is accepted. Missing
and self-targeting corrections are rejected, while corrected fields commute
unchanged through denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.RepetitionCorrection where

open import Data.Bool.Base using (Bool; true; false)
open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Data.Nat.Properties as Nat
import Lineage.Correctness.RepetitionCorrection as C
import Lineage.Denotation.RepetitionCorrection as D
import Lineage.Implementation.RepetitionCorrection as I
import Lineage.Specification.RepetitionCorrection as S
import Lineage.Validation.RepetitionCorrection as V

repetitionExists : ℕ → Bool
repetitionExists (suc zero) = true
repetitionExists repetition-id = false

validCorrection : I.Correction ℕ ℕ ℕ ℕ ℕ ℕ
validCorrection = I.correction
  (suc (suc zero))
  (suc zero)
  100
  7
  nothing
  (just 3)

missingTarget : I.Correction ℕ ℕ ℕ ℕ ℕ ℕ
missingTarget = I.correction
  (suc (suc (suc zero)))
  9
  101
  8
  nothing
  (just 2)

selfTarget : I.Correction ℕ ℕ ℕ ℕ ℕ ℕ
selfTarget = I.correction
  (suc zero)
  (suc zero)
  102
  9
  (just 5)
  nothing

valid-correction-proof :
  V.valid Nat._≟_ repetitionExists validCorrection ≡ true
valid-correction-proof = refl

missing-target-rejection-proof :
  V.valid Nat._≟_ repetitionExists missingTarget ≡ false
missing-target-rejection-proof = refl

self-target-rejection-proof :
  V.valid Nat._≟_ repetitionExists selfTarget ≡ false
self-target-rejection-proof = refl

target-preserved-proof :
  S.Correction.target-repetition-id (D.denote validCorrection) ≡ suc zero
target-preserved-proof = refl

assessment-preserved-proof :
  S.Correction.corrected-assessment (D.denote validCorrection) ≡ just 3
assessment-preserved-proof = refl

semantic-validation-proof :
  C.semanticValid Nat._≟_ repetitionExists (D.denote validCorrection) ≡ true
semantic-validation-proof = refl
```
