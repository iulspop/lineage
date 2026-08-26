# Executable codec representation

The executable codec may normalize an efficient value representation before
encoding it. It intentionally carries operations rather than laws; correctness
is supplied separately by an explicit denotation-preservation record.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Codec where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level; _⊔_)

private
  variable
    v w : Level

record Codec (Value : Set v) (Wire : Set w) : Set (v ⊔ w) where
  field
    normalize : Value → Value
    encode : Value → Wire
    decode : Wire → Maybe Value
```
