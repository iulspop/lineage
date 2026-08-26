# Image-occlusion denotation

Denotation forgets validation mechanics while retaining stable identities,
normalized geometry, sibling policy, and phase-appropriate descriptions.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.ImageOcclusion where

open import Level using (Level)
import Lineage.Implementation.ImageOcclusion as I
import Lineage.Specification.ImageOcclusion as S

private
  variable
    r a c t : Level
    RegionId : Set r
    AssetId : Set a
    Coordinate : Set c
    Text : Set t
    InUnit : Coordinate → Set c

denote : I.Occlusion RegionId AssetId Coordinate Text InUnit →
  S.Occlusion RegionId AssetId Coordinate Text InUnit
denote value = S.occlusion
  (I.region-id value) (I.asset-id value) (I.geometry value)
  (I.answer value) (I.challenge-description value) (I.sibling-policy value)
  (I.normalized value) (I.description-safe value)
```
