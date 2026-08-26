# Repetition history correctness

The denotation must preserve the append-only history algebra. These equations
justify the newest-first implementation as a correct, asymptotically better
representation of chronological semantic history.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.RepetitionHistory where

open import Data.List.Properties using (unfold-reverse)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Denotation.RepetitionHistory as D
import Lineage.Implementation.RepetitionHistory as I
import Lineage.Specification.RepetitionHistory as S

private
  variable
    e : Level
    Event : Set e
```

## Identity preservation

```agda
empty-homomorphic :
  D.denote (I.empty {Event = Event}) ≡ S.empty
empty-homomorphic = refl
```

## Append preservation

Appending in the implementation prepends to the reverse representation.
`unfold-reverse` proves that interpreting this cons is exactly semantic append.

```agda
append-homomorphic :
  (implementation : I.History Event) → (event : Event) →
  D.denote (I.append implementation event) ≡
    S.append (D.denote implementation) event
append-homomorphic implementation event =
  unfold-reverse event (I.newest-first implementation)
```

By induction, any history built solely from `empty` and `append` denotes the
same chronological event sequence as the semantic construction. Later scheduler
folds can therefore be proved over the simple semantic sequence and transferred
to this representation.
