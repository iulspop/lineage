# Interoperability examples

These fixtures model a lossless conversion and an explicitly lossy conversion,
then reject contradictory claims. A future Anki adapter can use the same result
type to report each unsupported or approximated feature without hiding loss.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Interoperability where

open import Data.Bool.Base using (true; false)
open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (ℕ)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Interoperability as D
import Lineage.Implementation.Interoperability as I
import Lineage.Specification.Interoperability as S
import Lineage.Validation.Interoperability as V

exactRaw : I.RawConversion ℕ ℕ
exactRaw = I.raw-conversion 42 [] S.exact

lossyRaw : I.RawConversion ℕ ℕ
lossyRaw = I.raw-conversion 42 (7 ∷ []) S.lossy

falseExactRaw : I.RawConversion ℕ ℕ
falseExactRaw = I.raw-conversion 42 (7 ∷ []) S.exact

emptyLossyRaw : I.RawConversion ℕ ℕ
emptyLossyRaw = I.raw-conversion 42 [] S.lossy

exact-valid : V.valid exactRaw ≡ true
exact-valid = refl

lossy-valid : V.valid lossyRaw ≡ true
lossy-valid = refl

false-exact-rejected : V.validate falseExactRaw ≡ nothing
false-exact-rejected = refl

empty-lossy-rejected : V.validate emptyLossyRaw ≡ nothing
empty-lossy-rejected = refl

exactResult : I.Conversion ℕ ℕ
exactResult = I.conversion 42 [] S.exact refl

exact-denotation-preserves-value :
  S.Conversion.value (D.denote exactResult) ≡ 42
exact-denotation-preserves-value = refl
```
