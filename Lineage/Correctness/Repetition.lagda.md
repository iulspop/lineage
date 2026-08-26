# Repetition correctness

Denotation preserves every durable factual field. The only representational
change is converting a validated one-based raw revision into a semantic revision
that is positive by construction.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.Repetition where

open import Data.Nat.Base using (suc)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Denotation.Repetition as D
import Lineage.Implementation.Repetition as I
import Lineage.Specification.Repetition as S
import Lineage.Validation.Repetition as V

private
  variable
    ℓ : Level
    Vocabulary : S.Vocabulary ℓ
```

```agda
repetition-id-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.repetition-id (D.denote raw proof) ≡ I.repetition-id raw
repetition-id-preserved raw proof = refl

prompt-id-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.prompt-id (D.denote raw proof) ≡ I.prompt-id raw
prompt-id-preserved raw proof = refl

revision-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.prompt-revision (D.denote raw proof) ≡ I.prompt-revision raw
revision-preserved raw (V.valid (V.positive index)) = refl

presentation-digest-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.presentation-digest (D.denote raw proof) ≡ I.presentation-digest raw
presentation-digest-preserved raw proof = refl

reviewed-at-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.reviewed-at (D.denote raw proof) ≡ I.reviewed-at raw
reviewed-at-preserved raw proof = refl

duration-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.duration (D.denote raw proof) ≡ I.duration raw
duration-preserved raw proof = refl

response-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.response (D.denote raw proof) ≡ I.response raw
response-preserved raw proof = refl

assessment-preserved :
  (raw : I.RawRepetition Vocabulary) → (proof : V.Valid raw) →
  S.assessment (D.denote raw proof) ≡ I.assessment raw
assessment-preserved raw proof = refl
```
