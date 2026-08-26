# Small repetition-history example

This fixture confirms that constant-time executable appends preserve durable
chronological meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.RepetitionHistory where

open import Data.List.Base using ([]; _∷_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Correctness.RepetitionHistory as C
import Lineage.Denotation.RepetitionHistory as D
import Lineage.Implementation.RepetitionHistory as I
import Lineage.Specification.RepetitionHistory as S
```

```agda
data Event : Set where
  first-review second-review : Event

history₀ : I.History Event
history₀ = I.empty

history₁ : I.History Event
history₁ = I.append history₀ first-review

history₂ : I.History Event
history₂ = I.append history₁ second-review
```

The implementation stores `[second-review, first-review]`, while denotation
recovers the required oldest-first sequence.

```agda
chronological :
  D.denote history₂ ≡ first-review ∷ second-review ∷ []
chronological = refl

first-append-preserves-meaning =
  C.append-homomorphic history₀ first-review

second-append-preserves-meaning =
  C.append-homomorphic history₁ second-review
```
