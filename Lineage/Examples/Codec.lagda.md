# Canonical codec examples

The identity natural-number codec is a minimal checked fixture. It demonstrates
canonicalization idempotence, successful validation, and the derived
implementation-to-semantics round trip without depending on a chosen corpus
serialization format.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Codec where

open import Data.Maybe.Base using (just; map)
open import Data.Nat.Base using (ℕ)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Codec as C
import Lineage.Implementation.Codec as I
import Lineage.Specification.Codec as S
import Lineage.Validation.Codec as V

semanticCodec : S.Codec ℕ ℕ
semanticCodec = record
  { canonicalize = λ value → value
  ; encode = λ value → value
  ; decode = just
  ; canonicalize-idempotent = λ value → refl
  ; encode-canonical = λ value → refl
  ; decode-encode = λ value → refl
  }

implementationCodec : I.Codec ℕ ℕ
implementationCodec = record
  { normalize = λ value → value
  ; encode = λ value → value
  ; decode = just
  }

denote : ℕ → ℕ
denote value = value

preserves : C.Preserves denote implementationCodec semanticCodec
preserves = record
  { normalize-preserved = λ value → refl
  ; encode-preserved = λ value → refl
  ; decode-preserved = λ wire → refl
  }

validation-accepts : V.validate implementationCodec 42 ≡ just 42
validation-accepts = refl

round-trip :
  map denote
      (I.Codec.decode implementationCodec
        (I.Codec.encode implementationCodec 42))
    ≡ just 42
round-trip = C.round-trip-preserved
  denote implementationCodec semanticCodec preserves 42
```
