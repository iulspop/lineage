# Interoperability correctness

The executable conversion representation has the same observable meaning as
the semantic conversion result. Converted values, loss reports, fidelity, and
the exactness invariant are all preserved by denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Interoperability where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Interoperability as D
import Lineage.Implementation.Interoperability as I
import Lineage.Specification.Interoperability as S

private
  variable
    t ℓ : Level
    Target : Set t
    Loss : Set ℓ

value-preserved :
  (result : I.Conversion Target Loss) →
  S.Conversion.value (D.denote result) ≡ I.Conversion.value result
value-preserved result = refl

losses-preserved :
  (result : I.Conversion Target Loss) →
  S.Conversion.losses (D.denote result) ≡ I.Conversion.losses result
losses-preserved result = refl

fidelity-preserved :
  (result : I.Conversion Target Loss) →
  S.Conversion.fidelity (D.denote result) ≡ I.Conversion.fidelity result
fidelity-preserved result = refl

losses-match-preserved :
  (result : I.Conversion Target Loss) →
  S.Conversion.losses-match (D.denote result) ≡ I.Conversion.losses-match result
losses-match-preserved result = refl
```
