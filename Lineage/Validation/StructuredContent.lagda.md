# Structured content validation

Untrusted rich-content input is decoded through a deliberately smaller raw
boundary. Portable data is admitted; executable script content is rejected
rather than becoming part of the canonical review contract.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.StructuredContent where

open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
import Lineage.Implementation.StructuredContent as I
import Lineage.Specification.StructuredContent as S

private
  variable x a u : Level

data RawInline (Text : Set x) (AssetId : Set a) (URI : Set u) : Set (x ⊔ a ⊔ u) where
  raw-text : S.Role → Text → RawInline Text AssetId URI
  raw-image : AssetId → Text → S.Role → RawInline Text AssetId URI
  raw-link : URI → Text → RawInline Text AssetId URI
  raw-script : Text → RawInline Text AssetId URI

validateInline :
  {Text : Set x} {AssetId : Set a} {URI : Set u} →
  RawInline Text AssetId URI → Maybe (I.Inline Text AssetId URI)
validateInline (raw-text role value) = just (I.text-node role value)
validateInline (raw-image asset description role) =
  just (I.image-node asset description role)
validateInline (raw-link uri label) =
  just (I.link-node uri (I.text-node S.context label ∷ []))
validateInline (raw-script source) = nothing
```
