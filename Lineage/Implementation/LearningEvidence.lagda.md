# Executable learning evidence history

Evidence is stored newest-first for constant-time append. Denotation restores
chronological order before any learner-state fold.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.LearningEvidence where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Specification.LearningEvidence as S

record History {ℓ : Level} (V : S.Vocabulary ℓ) : Set ℓ where
  constructor history
  field newest-first : List (S.LearningEvidence V)

open History public

empty : {ℓ : Level} {V : S.Vocabulary ℓ} → History V
empty = history []

append : {ℓ : Level} {V : S.Vocabulary ℓ} →
  History V → S.LearningEvidence V → History V
append prior event = history (event ∷ newest-first prior)
```
