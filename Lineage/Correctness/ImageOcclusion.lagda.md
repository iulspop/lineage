# Image-occlusion preservation

Primitive observations commute with denotation. Region identity and asset
identity therefore remain independent of mask edits, while geometry and
accessibility disclosure retain their validated semantic meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.ImageOcclusion where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.ImageOcclusion as D
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

region-id-preserved : (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.region-id (D.denote value) ≡ I.region-id value
region-id-preserved value = refl

asset-id-preserved : (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.asset-id (D.denote value) ≡ I.asset-id value
asset-id-preserved value = refl

geometry-preserved : (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.geometry (D.denote value) ≡ I.geometry value
geometry-preserved value = refl

answer-preserved : (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.answer (D.denote value) ≡ I.answer value
answer-preserved value = refl

challenge-description-preserved :
  (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.challenge-description (D.denote value) ≡ I.challenge-description value
challenge-description-preserved value = refl

sibling-policy-preserved :
  (value : I.Occlusion RegionId AssetId Coordinate Text InUnit) →
  S.sibling-policy (D.denote value) ≡ I.sibling-policy value
sibling-policy-preserved value = refl
```
