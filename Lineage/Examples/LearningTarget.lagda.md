# Learning-target examples

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.LearningTarget where

open import Data.Nat.Base using (ℕ)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Specification.LearningTarget as S

vocabulary : S.Vocabulary _
vocabulary = record
  { PromptId = ℕ; SourceId = ℕ; MaterialId = ℕ; CollectionId = ℕ
  ; ConceptId = ℕ; SegmentId = ℕ }

quadratic-recall : S.LearningTarget vocabulary
quadratic-recall = S.prompt-target 10 1

chapter-segment : S.LearningTarget vocabulary
chapter-segment = S.reading-target 20 3 4

stable-segment-example : chapter-segment ≡ S.reading-target 20 3 4
stable-segment-example = refl
```
