# Presentation capability correctness

The semantic and executable capability interpretations make the same
renderability decision. In particular, denotation cannot turn an unsupported
required extension into a supported declaration or invent a missing fallback.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Capability where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (ℕ)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong₂)
import Lineage.Denotation.Capability as D
import Lineage.Implementation.Capability as I
import Lineage.Specification.Capability as S
import Lineage.Validation.Capability as V

private
  variable
    p e f : Level
    ProfileId : Set p
    ExtensionId : Set e
    Fallback : Set f

semanticExtensionRenderable :
  (ExtensionId → ℕ → Bool) → S.ExtensionUse ExtensionId Fallback → Bool
semanticExtensionRenderable supports extension with
  supports (S.ExtensionUse.extension-id extension)
    (S.ExtensionUse.version extension)
... | true = true
... | false with S.ExtensionUse.requirement extension |
  S.ExtensionUse.fallback extension
...   | S.required | fallback = false
...   | S.optional | nothing = false
...   | S.optional | just fallback = true

semanticExtensionsRenderable :
  (ExtensionId → ℕ → Bool) → List (S.ExtensionUse ExtensionId Fallback) → Bool
semanticExtensionsRenderable supports [] = true
semanticExtensionsRenderable supports (extension ∷ extensions) =
  semanticExtensionRenderable supports extension ∧
  semanticExtensionsRenderable supports extensions

semanticRenderable :
  (ProfileId → ℕ → Bool) → (ExtensionId → ℕ → Bool) →
  S.Declaration ProfileId ExtensionId Fallback → Bool
semanticRenderable supportsProfile supportsExtension declared =
  supportsProfile
    (S.Profile.profile-id (S.Declaration.profile declared))
    (S.Profile.version (S.Declaration.profile declared)) ∧
  semanticExtensionsRenderable supportsExtension
    (S.Declaration.extensions declared)

extension-renderability-preserved :
  (supports : ExtensionId → ℕ → Bool) →
  (extension : I.ExtensionUse ExtensionId Fallback) →
  V.extensionRenderable supports extension ≡
    semanticExtensionRenderable supports (D.denoteExtension extension)
extension-renderability-preserved supports extension with
  supports (I.ExtensionUse.extension-id extension)
    (I.ExtensionUse.version extension)
... | true = refl
... | false with I.ExtensionUse.requirement extension |
  I.ExtensionUse.fallback extension
...   | S.required | fallback = refl
...   | S.optional | nothing = refl
...   | S.optional | just fallback = refl

extensions-renderability-preserved :
  (supports : ExtensionId → ℕ → Bool) →
  (extensions : List (I.ExtensionUse ExtensionId Fallback)) →
  V.extensionsRenderable supports extensions ≡
    semanticExtensionsRenderable supports (D.denoteExtensions extensions)
extensions-renderability-preserved supports [] = refl
extensions-renderability-preserved supports (extension ∷ extensions) =
  cong₂ _∧_
    (extension-renderability-preserved supports extension)
    (extensions-renderability-preserved supports extensions)

renderability-preserved :
  (supportsProfile : ProfileId → ℕ → Bool) →
  (supportsExtension : ExtensionId → ℕ → Bool) →
  (declared : I.Declaration ProfileId ExtensionId Fallback) →
  V.renderable supportsProfile supportsExtension declared ≡
    semanticRenderable supportsProfile supportsExtension (D.denote declared)
renderability-preserved supportsProfile supportsExtension declared =
  cong₂ _∧_ refl
    (extensions-renderability-preserved supportsExtension
      (I.Declaration.extensions declared))
```
