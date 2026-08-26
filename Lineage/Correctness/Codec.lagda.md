# Canonical codec correctness

A codec implementation is correct when normalization, encoding, and decoding
commute with denotation. The primitive equations derive the semantic round-trip
law for every executable value.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Codec where

open import Data.Maybe.Base using (just; map)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; cong; trans)
import Lineage.Implementation.Codec as I
import Lineage.Specification.Codec as S

record Preserves
  {ℓ : Level}
  {Value Meaning Wire : Set ℓ}
  (denote : Value → Meaning)
  (implementation : I.Codec Value Wire)
  (semantics : S.Codec Meaning Wire) : Set ℓ where
  field
    normalize-preserved :
      (value : Value) →
      denote (I.Codec.normalize implementation value) ≡
        S.Codec.canonicalize semantics (denote value)
    encode-preserved :
      (value : Value) →
      I.Codec.encode implementation value ≡
        S.Codec.encode semantics (denote value)
    decode-preserved :
      (wire : Wire) →
      map denote (I.Codec.decode implementation wire) ≡
        S.Codec.decode semantics wire

round-trip-preserved :
  {ℓ : Level} →
  {Value Meaning Wire : Set ℓ} →
  (denote : Value → Meaning) →
  (implementation : I.Codec Value Wire) →
  (semantics : S.Codec Meaning Wire) →
  (preserves : Preserves denote implementation semantics) →
  (value : Value) →
  map denote
      (I.Codec.decode implementation (I.Codec.encode implementation value))
    ≡
  just (S.Codec.canonicalize semantics (denote value))
round-trip-preserved denote implementation semantics preserves value =
  trans
    (Preserves.decode-preserved preserves
      (I.Codec.encode implementation value))
    (trans
      (cong (S.Codec.decode semantics)
        (Preserves.encode-preserved preserves value))
      (S.Codec.decode-encode semantics (denote value)))
```
