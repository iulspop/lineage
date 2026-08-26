# Structured content correctness

Denotation preserves composition: concatenating executable content and then
interpreting it has the same meaning as interpreting each part and composing
the semantic results. Media identity, accessible descriptions, and semantic
roles are preserved exactly.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.StructuredContent where

open import Data.List.Base using (List; []; _∷_; _++_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong)
import Lineage.Denotation.StructuredContent as D
import Lineage.Implementation.StructuredContent as I
import Lineage.Specification.StructuredContent as S

private
  variable
    x a u : Level
    Text : Set x
    AssetId : Set a
    URI : Set u

inlines-compose : (left right : List (I.Inline Text AssetId URI)) →
  D.denoteInlines (left ++ right) ≡ D.denoteInlines left ++ D.denoteInlines right
inlines-compose [] right = refl
inlines-compose (node ∷ nodes) right =
  cong (D.denoteInline node ∷_) (inlines-compose nodes right)

blocks-compose : (left right : List (I.Block Text AssetId URI)) →
  D.denoteBlocks (left ++ right) ≡ D.denoteBlocks left ++ D.denoteBlocks right
blocks-compose [] right = refl
blocks-compose (node ∷ nodes) right =
  cong (D.denoteBlock node ∷_) (blocks-compose nodes right)

items-compose : (left right : List (List (I.Block Text AssetId URI))) →
  D.denoteItems (left ++ right) ≡ D.denoteItems left ++ D.denoteItems right
items-compose [] right = refl
items-compose (item ∷ items) right =
  cong (D.denoteBlocks item ∷_) (items-compose items right)

rows-compose :
  (left right : List (List (List (I.Block Text AssetId URI)))) →
  D.denoteRows (left ++ right) ≡ D.denoteRows left ++ D.denoteRows right
rows-compose [] right = refl
rows-compose (row ∷ rows) right =
  cong (D.denoteItems row ∷_) (rows-compose rows right)

image-preserved :
  (asset : AssetId) (description : Text) (role : S.Role) →
  D.denoteInline (I.image-node {URI = URI} asset description role) ≡
    S.image {URI = URI} asset description role
image-preserved asset description role = refl

audio-preserved :
  (asset : AssetId) (description : Text) (role : S.Role) →
  D.denoteInline (I.audio-node {URI = URI} asset description role) ≡
    S.audio {URI = URI} asset description role
audio-preserved asset description role = refl

video-preserved :
  (asset : AssetId) (description : Text) (role : S.Role) →
  D.denoteInline (I.video-node {URI = URI} asset description role) ≡
    S.video {URI = URI} asset description role
video-preserved asset description role = refl
```
