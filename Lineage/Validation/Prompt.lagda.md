# Prompt revision validation

Validation rejects revision zero and certifies a raw Prompt snapshot indexed by
its exact decoded value.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.Prompt where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Level using (Level)
import Lineage.Implementation.Prompt as I
import Lineage.Specification.Prompt as S

private
  variable
    p c r : Level
    V : S.Vocabulary p c r

data Positive : ℕ → Set where
  positive : (index : ℕ) → Positive (suc index)

record Valid (raw : I.RawPromptRevision V) : Set where
  constructor valid
  field revision-positive : Positive (I.raw-revision raw)

open Valid public

valid? : (raw : I.RawPromptRevision V) → Maybe (Valid raw)
valid? (I.raw-prompt-revision prompt-id zero status contract) = nothing
valid? (I.raw-prompt-revision prompt-id (suc index) status contract) =
  just (valid (positive index))

revision-index : {raw : I.RawPromptRevision V} → Valid raw → ℕ
revision-index (valid (positive index)) = index

certify : (raw : I.RawPromptRevision V) → Valid raw →
  I.PromptRevision V
certify raw proof = I.prompt-revision
  (I.raw-prompt-id raw)
  (revision-index proof)
  (I.raw-status raw)
  (I.raw-contract raw)

validate : I.RawPromptRevision V → Maybe (I.PromptRevision V)
validate raw with valid? raw
... | nothing = nothing
... | just proof = just (certify raw proof)
```
