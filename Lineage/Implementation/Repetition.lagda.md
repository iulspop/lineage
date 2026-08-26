# Executable repetition representation

Decoded host data initially carries an unrestricted numeric prompt revision.
Validation must establish that it denotes the one-based semantic revision.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.Repetition where

open import Data.Maybe.Base using (Maybe)
open import Data.Nat.Base using (ℕ)
open import Level using (Level)

import Lineage.Specification.Repetition as S

open S using (Vocabulary)

record RawRepetition {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor raw-repetition
  field
    repetition-id : S.RepetitionId V
    prompt-id : S.PromptId V
    prompt-revision : ℕ
    presentation-digest : Maybe (S.Digest V)
    reviewed-at : S.Timestamp V
    duration : Maybe (S.Duration V)
    response : S.Response V
    assessment : S.Assessment V

open RawRepetition public
```
