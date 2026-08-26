# Codec boundary validation

Decoding is the validation boundary for untrusted wire values. Failure remains
explicit as `nothing`; successful decoding produces an executable value that can
then be interpreted through the codec denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Codec where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level)
import Lineage.Implementation.Codec as I

private
  variable
    v w : Level
    Value : Set v
    Wire : Set w

validate : I.Codec Value Wire → Wire → Maybe Value
validate codec = I.Codec.decode codec
```
