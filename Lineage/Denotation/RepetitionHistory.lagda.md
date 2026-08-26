# Repetition history denotation

Denotation reverses the efficient newest-first representation into the semantic
oldest-first event sequence.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.RepetitionHistory where

open import Data.List.Base using (reverse)
open import Level using (Level)

import Lineage.Implementation.RepetitionHistory as I
import Lineage.Specification.RepetitionHistory as S

private
  variable
    e : Level
    Event : Set e
```

```agda
denote : I.History Event → S.History Event
denote implementation = reverse (I.newest-first implementation)
```

Different future chunking or indexing strategies may replace this representation
provided their denotation yields the same chronological sequence.
