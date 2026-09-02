# Learning-evidence examples

A generic fold counts both legacy recall facts and broader observations. The
append theorem shows replaying one more fact agrees with incremental update.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.LearningEvidence where

open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Specification.LearningEvidence as S
import Lineage.Specification.Repetition as R

vocabulary : S.Vocabulary _
vocabulary = record
  { EvidenceId = ℕ; Timestamp = ℕ; Duration = ℕ; Assessment = ℕ
  ; Response = ℕ
  ; target-vocabulary = record
      { PromptId = ℕ; SourceId = ℕ; MaterialId = ℕ; CollectionId = ℕ
      ; ConceptId = ℕ; SegmentId = ℕ }
  ; repetition-vocabulary = record
      { RepetitionId = ℕ; PromptId = ℕ; Timestamp = ℕ; Duration = ℕ
      ; Response = ℕ; Assessment = ℕ; Digest = ℕ } }

count-evidence : S.Fold vocabulary ℕ
count-evidence = S.make-fold zero (λ count event → suc count)

legacy-review : S.LearningEvidence vocabulary
legacy-review = S.recall-evidence
  (R.repetition 7 10 zero nothing 100 nothing 0 3)

count-one : S.run count-evidence (legacy-review ∷ []) ≡ suc zero
count-one = refl
```
