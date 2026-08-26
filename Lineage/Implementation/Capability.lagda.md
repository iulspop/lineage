# Executable presentation capabilities

The executable representation keeps profile and extension declarations compact
while preserving unknown identifiers and fallback payloads losslessly.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Capability where

open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
import Lineage.Specification.Capability as S

private
  variable p e f : Level

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
    requirement : S.Requirement
    fallback : Maybe Fallback

record Declaration (ProfileId : Set p) (ExtensionId : Set e)
  (Fallback : Set f) : Set (p ⊔ e ⊔ f) where
  constructor declaration
  field
    profile : Profile ProfileId
    extensions : List (ExtensionUse ExtensionId Fallback)
```
