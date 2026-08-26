# Cached scheduling example

This scheduler-neutral fixture counts reviews. Two constant-time appends produce
the same state as folding the chronological durable history.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.Scheduling where

open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Correctness.Scheduling as C
import Lineage.Denotation.Scheduling as D
import Lineage.Implementation.Scheduling as I
import Lineage.Specification.Scheduling as S

data Grade : Set where again good : Grade

review-count : S.Scheduler Grade ℕ
review-count = S.make-scheduler zero (λ count grade → suc count)

projection₀ : I.Projection ℕ review-count
projection₀ = I.empty review-count

projection₁ : I.Projection ℕ review-count
projection₁ = I.append review-count projection₀ again

projection₂ : I.Projection ℕ review-count
projection₂ = I.append review-count projection₁ good

cached-after-two : I.cached-state projection₂ ≡ suc (suc zero)
cached-after-two = refl

denoted-after-two : D.denote review-count projection₂ ≡ suc (suc zero)
denoted-after-two = refl

cache-agrees-after-two :
  I.cached-state projection₂ ≡ D.denote review-count projection₂
cache-agrees-after-two = C.cache-denotes review-count projection₂

second-append-preserves-meaning =
  C.append-homomorphic review-count projection₁ good
```
