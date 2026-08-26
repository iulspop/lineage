# Executable interoperability representation

External decoders and exporters first produce an unchecked conversion result.
Validation certifies that the fidelity label agrees with the explicit loss
report before the result enters the proved core.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Interoperability where

open import Data.List.Base using (List)
open import Level using (Level; _⊔_)
open import Lineage.Specification.Interoperability using (Fidelity; LossesMatch)

private
  variable
    t ℓ : Level

record RawConversion (Target : Set t) (Loss : Set ℓ) : Set (t ⊔ ℓ) where
  constructor raw-conversion
  field
    value : Target
    losses : List Loss
    fidelity : Fidelity

record Conversion (Target : Set t) (Loss : Set ℓ) : Set (t ⊔ ℓ) where
  constructor conversion
  field
    value : Target
    losses : List Loss
    fidelity : Fidelity
    losses-match : LossesMatch fidelity losses
```
