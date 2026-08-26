# Presentation renderability validation

Renderability is decided against host-provided capability predicates. A profile
must be supported. Unsupported required extensions reject the Prompt;
unsupported optional extensions are accepted exactly when a canonical fallback
is available.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Capability where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (ℕ)
open import Level using (Level)
import Lineage.Implementation.Capability as I
import Lineage.Specification.Capability as S

private
  variable
    p e f : Level
    ProfileId : Set p
    ExtensionId : Set e
    Fallback : Set f

extensionRenderable :
  (ExtensionId → ℕ → Bool) → I.ExtensionUse ExtensionId Fallback → Bool
extensionRenderable supports extension with
  supports (I.ExtensionUse.extension-id extension)
    (I.ExtensionUse.version extension)
... | true = true
... | false with I.ExtensionUse.requirement extension |
  I.ExtensionUse.fallback extension
...   | S.required | fallback = false
...   | S.optional | nothing = false
...   | S.optional | just fallback = true

extensionsRenderable :
  (ExtensionId → ℕ → Bool) → List (I.ExtensionUse ExtensionId Fallback) → Bool
extensionsRenderable supports [] = true
extensionsRenderable supports (extension ∷ extensions) =
  extensionRenderable supports extension ∧ extensionsRenderable supports extensions

renderable :
  (ProfileId → ℕ → Bool) → (ExtensionId → ℕ → Bool) →
  I.Declaration ProfileId ExtensionId Fallback → Bool
renderable supportsProfile supportsExtension declared =
  supportsProfile
    (I.Profile.profile-id (I.Declaration.profile declared))
    (I.Profile.version (I.Declaration.profile declared)) ∧
  extensionsRenderable supportsExtension (I.Declaration.extensions declared)
```
