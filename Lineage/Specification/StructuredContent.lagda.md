# Structured content semantics

Canonical presentation is a small typed, non-executable tree. Semantic roles
are explicit and media constructors require a phase-appropriate accessible
description; presentation meaning never depends on color or browser behavior.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.StructuredContent where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)

private
  variable x a u : Level

data Role : Set where
  cue context question answer hint explanation citation warning : Role
  concealed-target expected-response supplied-response : Role

data Emphasis : Set where
  strong stress : Emphasis

data Inline (Text : Set x) (AssetId : Set a) (URI : Set u) : Set (x ⊔ a ⊔ u) where
  text : Role → Text → Inline Text AssetId URI
  emphasized : Emphasis → List (Inline Text AssetId URI) → Inline Text AssetId URI
  link : URI → List (Inline Text AssetId URI) → Inline Text AssetId URI
  image : AssetId → Text → Role → Inline Text AssetId URI
  audio : AssetId → Text → Role → Inline Text AssetId URI
  video : AssetId → Text → Role → Inline Text AssetId URI
  placeholder : Role → Text → Inline Text AssetId URI

data Block (Text : Set x) (AssetId : Set a) (URI : Set u) : Set (x ⊔ a ⊔ u) where
  paragraph : List (Inline Text AssetId URI) → Block Text AssetId URI
  heading : ℕ → List (Inline Text AssetId URI) → Block Text AssetId URI
  list : List (List (Block Text AssetId URI)) → Block Text AssetId URI
  quotation : List (Block Text AssetId URI) → Block Text AssetId URI
  code : Text → Block Text AssetId URI
  mathematics : Text → Block Text AssetId URI
  table : List (List (List (Block Text AssetId URI))) → Block Text AssetId URI
  media : Inline Text AssetId URI → Block Text AssetId URI

Document : Set x → Set a → Set u → Set (x ⊔ a ⊔ u)
Document Text AssetId URI = List (Block Text AssetId URI)
```
