# Canonical codec semantics

A canonical codec gives durable meanings an inspectable wire representation. Its
laws state that encoding followed by decoding yields the canonical meaning,
canonicalization is idempotent, and encoding does not distinguish a value from
its canonical form.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Codec where

open import Data.Maybe.Base using (Maybe; just)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)

private
  variable
    m w : Level

record Codec (Meaning : Set m) (Wire : Set w) : Set (m ⊔ w) where
  field
    canonicalize : Meaning → Meaning
    encode : Meaning → Wire
    decode : Wire → Maybe Meaning
    canonicalize-idempotent :
      (meaning : Meaning) →
      canonicalize (canonicalize meaning) ≡ canonicalize meaning
    encode-canonical :
      (meaning : Meaning) →
      encode (canonicalize meaning) ≡ encode meaning
    decode-encode :
      (meaning : Meaning) →
      decode (encode meaning) ≡ just (canonicalize meaning)
```
