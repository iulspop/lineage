# Repetition validation

Validation rejects revision zero and produces evidence indexed by the exact raw
value. Certification preserves every factual field while converting the raw
revision to the semantic one-based representation.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.Repetition where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Level using (Level)
import Lineage.Implementation.Repetition as I
import Lineage.Specification.Repetition as S

private
  variable
    ℓ : Level
    V : S.Vocabulary ℓ

data Positive : ℕ → Set where
  positive : (index : ℕ) → Positive (suc index)

record Valid (raw : I.RawRepetition V) : Set where
  constructor valid
  field
    revision-positive : Positive (I.prompt-revision raw)

open Valid public

valid? : (raw : I.RawRepetition V) → Maybe (Valid raw)
valid? (I.raw-repetition repetition-id prompt-id zero digest reviewed-at duration response assessment) =
  nothing
valid? (I.raw-repetition repetition-id prompt-id (suc index) digest reviewed-at duration response assessment) =
  just (valid (positive index))

revision-index : {raw : I.RawRepetition V} → Valid raw → ℕ
revision-index (valid (positive index)) = index

certify : (raw : I.RawRepetition V) → Valid raw → S.Repetition V
certify raw proof = S.repetition
  (I.repetition-id raw)
  (I.prompt-id raw)
  (revision-index proof)
  (I.presentation-digest raw)
  (I.reviewed-at raw)
  (I.duration raw)
  (I.response raw)
  (I.assessment raw)

validate : I.RawRepetition V → Maybe (S.Repetition V)
validate raw with valid? raw
... | nothing = nothing
... | just proof = just (certify raw proof)
```
