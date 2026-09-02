# Executable learning targets

The initial executable representation is intentionally isomorphic to the
semantic target algebra. Future indexes may change lookup performance without
changing denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.LearningTarget where

open import Data.Nat.Base using (ℕ)
open import Level using (Level)
import Lineage.Specification.LearningTarget as S

data LearningTarget {ℓ : Level} (V : S.Vocabulary ℓ) : Set ℓ where
  prompt-target : S.PromptId V → ℕ → LearningTarget V
  source-target : S.SourceId V → ℕ → LearningTarget V
  material-target : S.MaterialId V → ℕ → LearningTarget V
  reading-target : S.SourceId V → ℕ → S.SegmentId V → LearningTarget V
  material-reading-target : S.MaterialId V → ℕ → S.SegmentId V → LearningTarget V
  collection-target : S.CollectionId V → LearningTarget V
  concept-target : S.ConceptId V → LearningTarget V
```
