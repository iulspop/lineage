# Repetition denotation

A validated executable repetition denotes the corresponding semantic factual
observation. Validation evidence is required because raw revision zero has no
semantic meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.Repetition where

open import Level using (Level)

import Lineage.Implementation.Repetition as I
import Lineage.Specification.Repetition as S
import Lineage.Validation.Repetition as V

private
  variable
    ℓ : Level
    Vocabulary : S.Vocabulary ℓ

denote :
  (raw : I.RawRepetition Vocabulary) →
  V.Valid raw →
  S.Repetition Vocabulary
denote = V.certify
```
