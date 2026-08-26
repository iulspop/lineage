# Executable Prompt revision representation

Decoded host data carries an unrestricted revision number and an already
validated executable review contract. Prompt validation establishes the
one-based revision invariant without assigning identity from content bytes.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.Prompt where

open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level; _⊔_)
import Lineage.Implementation.ReviewContract as Review
import Lineage.Specification.Prompt as S

record PromptRevision {p c r : Level} (V : S.Vocabulary p c r) : Set (p ⊔ c ⊔ r) where
  constructor prompt-revision
  field
    prompt-id : S.PromptId V
    revision-index : ℕ
    status : S.Status
    contract : Review.Contract (S.Content V) (S.Response V)

  revision : ℕ
  revision = suc revision-index

open PromptRevision public

record RawPromptRevision {p c r : Level} (V : S.Vocabulary p c r) : Set (p ⊔ c ⊔ r) where
  constructor raw-prompt-revision
  field
    raw-prompt-id : S.PromptId V
    raw-revision : ℕ
    raw-status : S.Status
    raw-contract : Review.Contract (S.Content V) (S.Response V)

open RawPromptRevision public
```
