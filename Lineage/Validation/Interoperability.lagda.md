# Interoperability validation

Validation rejects contradictory conversion metadata: `exact` requires an empty
loss report, while `lossy` requires at least one explicit loss observation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Interoperability where

open import Data.Bool.Base using (Bool; true; false)
open import Data.List.Base using (List; []; _∷_)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Unit using (tt)
open import Level using (Level; lift; _⊔_)
open import Relation.Binary.PropositionalEquality using (refl)
open import Lineage.Implementation.Interoperability using (RawConversion; Conversion; conversion)
open import Lineage.Specification.Interoperability using (Fidelity; exact; lossy)

private
  variable
    t ℓ : Level
    Target : Set t
    Loss : Set ℓ

valid : RawConversion Target Loss → Bool
valid raw with RawConversion.fidelity raw | RawConversion.losses raw
... | exact | [] = true
... | exact | loss ∷ losses = false
... | lossy | [] = false
... | lossy | loss ∷ losses = true

validate : RawConversion Target Loss → Maybe (Conversion Target Loss)
validate raw with RawConversion.fidelity raw | RawConversion.losses raw
... | exact | [] = just (conversion (RawConversion.value raw) [] exact refl)
... | exact | loss ∷ losses = nothing
... | lossy | [] = nothing
... | lossy | loss ∷ losses = just (conversion (RawConversion.value raw) (loss ∷ losses) lossy (lift tt))
```
