# Executable structured content

The executable tree mirrors the semantic vocabulary with distinct constructors,
allowing codecs and host DTOs to use a direct algebraic representation without
making that layout the specification.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.StructuredContent where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
import Lineage.Specification.StructuredContent as S

private
  variable x a u : Level

data Inline (Text : Set x) (AssetId : Set a) (URI : Set u) : Set (x ⊔ a ⊔ u) where
  text-node : S.Role → Text → Inline Text AssetId URI
  emphasis-node : S.Emphasis → List (Inline Text AssetId URI) → Inline Text AssetId URI
  link-node : URI → List (Inline Text AssetId URI) → Inline Text AssetId URI
  image-node : AssetId → Text → S.Role → Inline Text AssetId URI
  audio-node : AssetId → Text → S.Role → Inline Text AssetId URI
  video-node : AssetId → Text → S.Role → Inline Text AssetId URI
  placeholder-node : S.Role → Text → Inline Text AssetId URI

data Block (Text : Set x) (AssetId : Set a) (URI : Set u) : Set (x ⊔ a ⊔ u) where
  paragraph-node : List (Inline Text AssetId URI) → Block Text AssetId URI
  heading-node : ℕ → List (Inline Text AssetId URI) → Block Text AssetId URI
  list-node : List (List (Block Text AssetId URI)) → Block Text AssetId URI
  quote-node : List (Block Text AssetId URI) → Block Text AssetId URI
  code-node : Text → Block Text AssetId URI
  mathematics-node : Text → Block Text AssetId URI
  table-node : List (List (List (Block Text AssetId URI))) → Block Text AssetId URI
  media-node : Inline Text AssetId URI → Block Text AssetId URI

Document : Set x → Set a → Set u → Set (x ⊔ a ⊔ u)
Document Text AssetId URI = List (Block Text AssetId URI)
```
