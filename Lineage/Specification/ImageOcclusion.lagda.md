# Native image-occlusion specification

An occlusion region has stable identity independent of its geometry. Geometry is
expressed in normalized image coordinates, while challenge descriptions and
resolution labels preserve the disclosure boundary.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.ImageOcclusion where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∉_)
open import Data.Product using (_×_)
open import Data.Unit.Base using (⊤)
open import Level using (Level; Lift; lift; _⊔_)

private
  variable
    r a c t : Level

record Point (Coordinate : Set c) : Set c where
  constructor point
  field x y : Coordinate
open Point public

data Geometry (Coordinate : Set c) : Set c where
  rectangle : Point Coordinate → Point Coordinate → Geometry Coordinate
  polygon : List (Point Coordinate) → Geometry Coordinate

data SiblingPolicy : Set where
  conceal-target-only conceal-all-siblings highlight-target : SiblingPolicy

All : ∀ {a p} {A : Set a} → (A → Set p) → List A → Set (a ⊔ p)
All {a} {p} P [] = Lift (a ⊔ p) ⊤
All P (x ∷ xs) = P x × All P xs

NormalizedPoint : ∀ {c} {Coordinate : Set c} →
  (Coordinate → Set c) → Point Coordinate → Set c
NormalizedPoint InUnit p = InUnit (x p) × InUnit (y p)

Normalized : ∀ {c} {Coordinate : Set c} →
  (Coordinate → Set c) → Geometry Coordinate → Set c
Normalized InUnit (rectangle from to) =
  NormalizedPoint InUnit from × NormalizedPoint InUnit to
Normalized InUnit (polygon points) = All (NormalizedPoint InUnit) points

record Occlusion (RegionId : Set r) (AssetId : Set a)
  (Coordinate : Set c) (Text : Set t) (InUnit : Coordinate → Set c) :
  Set (r ⊔ a ⊔ c ⊔ t) where
  constructor occlusion
  field
    region-id : RegionId
    asset-id : AssetId
    geometry : Geometry Coordinate
    answer : Text
    challenge-description : List Text
    sibling-policy : SiblingPolicy
    normalized : Normalized InUnit geometry
    description-safe : answer ∉ challenge-description

open Occlusion public
```
