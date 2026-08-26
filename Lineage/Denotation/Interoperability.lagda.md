# Interoperability denotation

Denotation removes executable representation choices while retaining the
converted value, every explicit loss observation, and the fidelity claim with
its evidence.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Interoperability where

open import Level using (Level)
import Lineage.Implementation.Interoperability as I
import Lineage.Specification.Interoperability as S

private
  variable
    t ℓ : Level
    Target : Set t
    Loss : Set ℓ

denote : I.Conversion Target Loss → S.Conversion Target Loss
denote value = S.conversion
  (I.Conversion.value value)
  (I.Conversion.losses value)
  (I.Conversion.fidelity value)
  (I.Conversion.losses-match value)
```
