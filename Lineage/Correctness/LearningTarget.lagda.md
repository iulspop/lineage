# Learning-target correctness

Executable target constructors commute with semantic denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.LearningTarget where

open import Data.Nat.Base using (ℕ)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.LearningTarget as D
import Lineage.Implementation.LearningTarget as I
import Lineage.Specification.LearningTarget as S

prompt-homomorphic : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (id : S.PromptId V) → (revision : ℕ) →
  D.denote {V = V} (I.prompt-target id revision) ≡ S.prompt-target id revision
prompt-homomorphic id revision = refl

reading-homomorphic : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (id : S.SourceId V) → (revision : ℕ) → (segment : S.SegmentId V) →
  D.denote {V = V} (I.reading-target id revision segment) ≡
    S.reading-target id revision segment
reading-homomorphic id revision segment = refl
```
