# Review contract denotation

The denotation forgets the executable record layout and interprets its two
stored presentations as one phase-indexed semantic observation. It preserves
the response interaction, withheld material, and disclosure evidence.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.ReviewContract where

open import Level using (Level)

import Lineage.Implementation.ReviewContract as I
import Lineage.Specification.ReviewContract as S

private
  variable
    c r : Level
    Content : Set c
    Response : Set r
```

```agda
denote : I.Contract Content Response → S.Contract Content Response
denote contract = record
  { view = λ where
      S.challenge  → I.challenge contract
      S.resolution → I.resolution contract
  ; response = I.response contract
  ; withheld = I.withheld contract
  ; challenge-safe = I.challenge-safe contract
  ; resolution-whole = I.resolution-whole contract
  }
```

This map is the architectural boundary between executable representation and
meaning. Future encodings, indexes, caches, or compiled DTOs may change without
changing review-contract meaning when their denotations remain equal.
