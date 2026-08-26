# Presentation capability examples

These checked examples distinguish required support from optional enhancement,
and show that an unsupported optional extension is usable only with canonical
fallback content.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Capability where

open import Data.Bool.Base using (Bool; true; false)
open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Capability as C
import Lineage.Denotation.Capability as D
import Lineage.Implementation.Capability as I
import Lineage.Specification.Capability as S
import Lineage.Validation.Capability as V

supportsProfile : ℕ → ℕ → Bool
supportsProfile zero (suc zero) = true
supportsProfile profile-id version = false

supportsExtension : ℕ → ℕ → Bool
supportsExtension zero (suc zero) = true
supportsExtension extension-id version = false

baseProfile : I.Profile ℕ
baseProfile = I.presentation-profile zero (suc zero)

supportedRequired : I.ExtensionUse ℕ ℕ
supportedRequired = I.extension-use zero (suc zero) S.required nothing

unsupportedRequired : I.ExtensionUse ℕ ℕ
unsupportedRequired = I.extension-use (suc zero) (suc zero) S.required nothing

optionalWithFallback : I.ExtensionUse ℕ ℕ
optionalWithFallback =
  I.extension-use (suc zero) (suc zero) S.optional (just 42)

optionalWithoutFallback : I.ExtensionUse ℕ ℕ
optionalWithoutFallback =
  I.extension-use (suc zero) (suc zero) S.optional nothing

fullySupported : I.Declaration ℕ ℕ ℕ
fullySupported = I.declaration baseProfile (supportedRequired ∷ [])

fallbackRenderable : I.Declaration ℕ ℕ ℕ
fallbackRenderable = I.declaration baseProfile (optionalWithFallback ∷ [])

requiredRejected : I.Declaration ℕ ℕ ℕ
requiredRejected = I.declaration baseProfile (unsupportedRequired ∷ [])

missingFallbackRejected : I.Declaration ℕ ℕ ℕ
missingFallbackRejected =
  I.declaration baseProfile (optionalWithoutFallback ∷ [])

supported-proof :
  V.renderable supportsProfile supportsExtension fullySupported ≡ true
supported-proof = refl

fallback-proof :
  V.renderable supportsProfile supportsExtension fallbackRenderable ≡ true
fallback-proof = refl

required-rejection-proof :
  V.renderable supportsProfile supportsExtension requiredRejected ≡ false
required-rejection-proof = refl

missing-fallback-rejection-proof :
  V.renderable supportsProfile supportsExtension missingFallbackRejected ≡ false
missing-fallback-rejection-proof = refl

fallback-denotation-proof :
  C.semanticRenderable supportsProfile supportsExtension
    (D.denote fallbackRenderable) ≡ true
fallback-denotation-proof = refl
```
