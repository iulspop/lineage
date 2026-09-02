# Learning-evidence correctness

Newest-first append denotes chronological append. Existing Repetition values
embed into generalized recall evidence and recover losslessly.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.LearningEvidence where

open import Data.List.Base using ([_]; _++_)
open import Data.List.Properties using (unfold-reverse)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; sym)
import Lineage.Denotation.LearningEvidence as D
import Lineage.Implementation.LearningEvidence as I
import Lineage.Specification.LearningEvidence as S
import Lineage.Specification.Repetition as R

append-homomorphic : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (history : I.History V) → (event : S.LearningEvidence V) →
  D.denote (I.append history event) ≡ D.denote history ++ [ event ]
append-homomorphic evidence-history event =
  unfold-reverse event (I.newest-first evidence-history)

embed-repetition : {ℓ : Level} {V : S.Vocabulary ℓ} →
  R.Repetition (S.repetition-vocabulary V) → S.LearningEvidence V
embed-repetition = S.recall-evidence

recover-repetition : {ℓ : Level} {V : S.Vocabulary ℓ} →
  S.LearningEvidence V → Maybe (R.Repetition (S.repetition-vocabulary V))
recover-repetition (S.recall-evidence review-fact) = just review-fact
recover-repetition (S.observation-evidence learning-observation) = nothing

recall-embedding-lossless : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (review-fact : R.Repetition (S.repetition-vocabulary V)) →
  recover-repetition {V = V} (embed-repetition {V = V} review-fact) ≡ just review-fact
recall-embedding-lossless review-fact = refl
```
