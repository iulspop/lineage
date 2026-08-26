# Presentation capability denotation

Denotation preserves profile versions, extension requirements, unknown
identifiers, and canonical fallbacks while removing executable record layout.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Capability where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Implementation.Capability as I
import Lineage.Specification.Capability as S

private
  variable
    p e f : Level
    ProfileId : Set p
    ExtensionId : Set e
    Fallback : Set f

denoteProfile : I.Profile ProfileId → S.Profile ProfileId
denoteProfile profile = S.presentation-profile
  (I.Profile.profile-id profile)
  (I.Profile.version profile)

denoteExtension : I.ExtensionUse ExtensionId Fallback →
  S.ExtensionUse ExtensionId Fallback
denoteExtension extension = S.extension-use
  (I.ExtensionUse.extension-id extension)
  (I.ExtensionUse.version extension)
  (I.ExtensionUse.requirement extension)
  (I.ExtensionUse.fallback extension)

denoteExtensions : List (I.ExtensionUse ExtensionId Fallback) →
  List (S.ExtensionUse ExtensionId Fallback)
denoteExtensions [] = []
denoteExtensions (extension ∷ extensions) =
  denoteExtension extension ∷ denoteExtensions extensions

denote : I.Declaration ProfileId ExtensionId Fallback →
  S.Declaration ProfileId ExtensionId Fallback
denote declared = S.declaration
  (denoteProfile (I.Declaration.profile declared))
  (denoteExtensions (I.Declaration.extensions declared))
```
