# Native image-occlusion example

A femur region uses stable logical and asset identities, a normalized polygon,
and a non-revealing accessible challenge description. Invalid coordinates and
an answer-bearing challenge description are rejected.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.ImageOcclusion where

open import Data.List.Base using ([]; _∷_)
open import Data.List.Membership.Propositional using (_∉_)
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Product using (_,_)
open import Data.Unit.Base using (tt)
open import Level using (lift)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (Dec; yes; no)

import Lineage.Correctness.ImageOcclusion as C
import Lineage.Denotation.ImageOcclusion as D
import Lineage.Implementation.ImageOcclusion as I
import Lineage.Specification.ImageOcclusion as S
import Lineage.Validation.ImageOcclusion as V

data RegionId : Set where femur-region : RegionId
data AssetId : Set where skeleton-image : AssetId
data Coordinate : Set where low middle high outside : Coordinate
data Text : Set where femur concealed-upper-leg : Text

data InUnit : Coordinate → Set where
  low-valid : InUnit low
  middle-valid : InUnit middle
  high-valid : InUnit high

coordinate? : (coordinate : Coordinate) → Dec (InUnit coordinate)
coordinate? low = yes low-valid
coordinate? middle = yes middle-valid
coordinate? high = yes high-valid
coordinate? outside = no λ ()

text-equality : DecidableEquality Text
text-equality femur femur = yes refl
text-equality femur concealed-upper-leg = no λ ()
text-equality concealed-upper-leg femur = no λ ()
text-equality concealed-upper-leg concealed-upper-leg = yes refl

valid-polygon : S.Geometry Coordinate
valid-polygon = S.polygon
  (S.point low low ∷ S.point middle low ∷
   S.point high high ∷ S.point low high ∷ [])

invalid-polygon : S.Geometry Coordinate
invalid-polygon = S.polygon (S.point low outside ∷ [])

valid-raw : I.RawOcclusion RegionId AssetId Coordinate Text
valid-raw = I.raw-occlusion femur-region skeleton-image valid-polygon femur
  (concealed-upper-leg ∷ []) S.conceal-target-only

invalid-coordinate-raw : I.RawOcclusion RegionId AssetId Coordinate Text
invalid-coordinate-raw = I.raw-occlusion femur-region skeleton-image invalid-polygon femur
  (concealed-upper-leg ∷ []) S.conceal-target-only

leaking-description-raw : I.RawOcclusion RegionId AssetId Coordinate Text
leaking-description-raw = I.raw-occlusion femur-region skeleton-image valid-polygon femur
  (femur ∷ []) S.conceal-target-only

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

valid-accepted : IsJust (V.validate coordinate? text-equality valid-raw)
valid-accepted = is-just

invalid-coordinate-rejected :
  V.validate coordinate? text-equality invalid-coordinate-raw ≡ nothing
invalid-coordinate-rejected = refl

leaking-description-rejected :
  V.validate coordinate? text-equality leaking-description-raw ≡ nothing
leaking-description-rejected = refl

geometry-valid : S.Normalized InUnit valid-polygon
geometry-valid = (low-valid , low-valid) ,
  ((middle-valid , low-valid) ,
  ((high-valid , high-valid) ,
  ((low-valid , high-valid) , lift tt)))

description-safe : femur ∉ (concealed-upper-leg ∷ [])
description-safe (here ())
description-safe (there ())

validated : I.Occlusion RegionId AssetId Coordinate Text InUnit
validated = V.certify valid-raw (V.valid geometry-valid description-safe)

meaning : S.Occlusion RegionId AssetId Coordinate Text InUnit
meaning = D.denote validated

region-stable = C.region-id-preserved validated
asset-stable = C.asset-id-preserved validated
geometry-preserved = C.geometry-preserved validated
sibling-policy-preserved = C.sibling-policy-preserved validated
```
