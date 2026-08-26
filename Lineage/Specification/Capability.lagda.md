# Presentation capability semantics

A Prompt names one versioned presentation profile and may use versioned
extensions. Required extensions must be understood by a renderer. Optional
extensions may be unsupported only when canonical fallback content is present.
Unknown declarations remain ordinary data and can therefore be preserved.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Capability where

open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)

private
  variable p e f : Level

data Requirement : Set where
  required optional : Requirement

record Profile (ProfileId : Set p) : Set p where
  constructor presentation-profile
  field
    profile-id : ProfileId
    version : ℕ

record ExtensionUse (ExtensionId : Set e) (Fallback : Set f) : Set (e ⊔ f) where
  constructor extension-use
  field
    extension-id : ExtensionId
    version : ℕ
    requirement : Requirement
    fallback : Maybe Fallback

record Declaration (ProfileId : Set p) (ExtensionId : Set e)
  (Fallback : Set f) : Set (p ⊔ e ⊔ f) where
  constructor declaration
  field
    profile : Profile ProfileId
    extensions : List (ExtensionUse ExtensionId Fallback)
```
