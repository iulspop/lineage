# Codec denotation

Codec results denote optional semantic meanings by mapping the implementation
denotation over successful decoded values while preserving rejection.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Codec where

open import Data.Maybe.Base using (Maybe; map)
open import Level using (Level)

private
  variable
    v m : Level
    Value : Set v
    Meaning : Set m

denoteDecoded : (Value → Meaning) → Maybe Value → Maybe Meaning
denoteDecoded = map
```
