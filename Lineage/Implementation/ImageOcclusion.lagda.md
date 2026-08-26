# Executable image-occlusion representation

Raw regions mirror decoded fields. Valid regions add evidence that coordinates
are normalized and accessible challenge descriptions do not reveal the answer.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.ImageOcclusion where

open import Data.List.Base using (List)
open import Data.List.Membership.Propositional using (_∉_)
open import Level using (Level; _⊔_)
import Lineage.Specification.ImageOcclusion as S

private
  variable
    r a c t : Level

record RawOcclusion (RegionId : Set r) (AssetId : Set a)
  (Coordinate : Set c) (Text : Set t) : Set (r ⊔ a ⊔ c ⊔ t) where
  constructor raw-occlusion
  field
    region-id : RegionId
    asset-id : AssetId
    geometry : S.Geometry Coordinate
    answer : Text
    challenge-description : List Text
    sibling-policy : S.SiblingPolicy
open RawOcclusion public

record Occlusion (RegionId : Set r) (AssetId : Set a)
  (Coordinate : Set c) (Text : Set t) (InUnit : Coordinate → Set c) :
  Set (r ⊔ a ⊔ c ⊔ t) where
  constructor occlusion
  field
    region-id : RegionId
    asset-id : AssetId
    geometry : S.Geometry Coordinate
    answer : Text
    challenge-description : List Text
    sibling-policy : S.SiblingPolicy
    normalized : S.Normalized InUnit geometry
    description-safe : answer ∉ challenge-description
open Occlusion public
```
