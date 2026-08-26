# Image-occlusion validation

Validation is parameterized by decidable coordinate normalization and text
identity, allowing physical codecs to choose a precise numeric representation.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.ImageOcclusion where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∈_; _∉_)
import Data.List.Membership.DecPropositional
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Product using (_,_; proj₁; proj₂)
open import Data.Unit.Base using (tt)
open import Level using (Level; lift; _⊔_)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Nullary.Decidable using (Dec; yes; no)

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

all? : (P : Coordinate → Set c) → ((x : Coordinate) → Dec (P x)) →
  (xs : List Coordinate) → Dec (S.All P xs)
all? P decide [] = yes (lift tt)
all? P decide (x ∷ xs) with decide x | all? P decide xs
... | yes px | yes pxs = yes (px , pxs)
... | no npx | _ = no λ proof → npx (proj₁ proof)
... | yes _ | no npxs = no λ proof → npxs (proj₂ proof)

point? : ((x : Coordinate) → Dec (InUnit x)) →
  (point : S.Point Coordinate) → Dec (S.NormalizedPoint InUnit point)
point? decide value with decide (S.x value) | decide (S.y value)
... | yes px | yes py = yes (px , py)
... | no npx | _ = no λ proof → npx (proj₁ proof)
... | yes _ | no npy = no λ proof → npy (proj₂ proof)

points? : ((x : Coordinate) → Dec (InUnit x)) →
  (points : List (S.Point Coordinate)) →
  Dec (S.All (S.NormalizedPoint InUnit) points)
points? decide [] = yes (lift tt)
points? decide (p ∷ ps) with point? decide p | points? decide ps
... | yes pp | yes pps = yes (pp , pps)
... | no npp | _ = no λ proof → npp (proj₁ proof)
... | yes _ | no npps = no λ proof → npps (proj₂ proof)

normalized? : ((x : Coordinate) → Dec (InUnit x)) →
  (geometry : S.Geometry Coordinate) → Dec (S.Normalized InUnit geometry)
normalized? decide (S.rectangle from to) with point? decide from | point? decide to
... | yes pf | yes pt = yes (pf , pt)
... | no npf | _ = no λ proof → npf (proj₁ proof)
... | yes _ | no npt = no λ proof → npt (proj₂ proof)
normalized? decide (S.polygon points) = points? decide points

member? : DecidableEquality Text →
  (text : Text) → (texts : List Text) → Dec (text ∈ texts)
member? _≟_ text texts = membership._∈?_ text texts
  where
    module membership = Data.List.Membership.DecPropositional _≟_

safe? : DecidableEquality Text → (answer : Text) →
  (description : List Text) → Dec (answer ∉ description)
safe? _≟_ answer description with member? _≟_ answer description
... | yes leaked = no λ safe → safe leaked
... | no safe = yes safe

record Valid {r a c t} {RegionId : Set r} {AssetId : Set a}
  {Coordinate : Set c} {Text : Set t} {InUnit : Coordinate → Set c}
  (raw : I.RawOcclusion RegionId AssetId Coordinate Text) :
  Set (r ⊔ a ⊔ c ⊔ t) where
  constructor valid
  field
    normalized : S.Normalized InUnit (I.geometry raw)
    description-safe : I.answer raw ∉ I.challenge-description raw
open Valid public

valid? : ((x : Coordinate) → Dec (InUnit x)) → DecidableEquality Text →
  (raw : I.RawOcclusion RegionId AssetId Coordinate Text) →
  Dec (Valid {InUnit = InUnit} raw)
valid? coordinate? text-equality raw with normalized? coordinate? (I.geometry raw)
... | no malformed = no λ certificate → malformed (normalized certificate)
... | yes geometry-valid with safe? text-equality (I.answer raw) (I.challenge-description raw)
...   | no leaked = no λ certificate → leaked (description-safe certificate)
...   | yes safe = yes (valid geometry-valid safe)

certify : (raw : I.RawOcclusion RegionId AssetId Coordinate Text) →
  Valid {InUnit = InUnit} raw →
  I.Occlusion RegionId AssetId Coordinate Text InUnit
certify raw certificate = I.occlusion
  (I.region-id raw) (I.asset-id raw) (I.geometry raw) (I.answer raw)
  (I.challenge-description raw) (I.sibling-policy raw)
  (normalized certificate) (description-safe certificate)

validate : ((x : Coordinate) → Dec (InUnit x)) → DecidableEquality Text →
  I.RawOcclusion RegionId AssetId Coordinate Text →
  Maybe (I.Occlusion RegionId AssetId Coordinate Text InUnit)
validate coordinate? text-equality raw with valid? coordinate? text-equality raw
... | yes certificate = just (certify raw certificate)
... | no _ = nothing
```
