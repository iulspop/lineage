# Structured content denotation

Denotation is a structural fold from the codec-friendly executable tree into
the canonical semantic tree. It is total and compositional at every nesting
level.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.StructuredContent where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Implementation.StructuredContent as I
import Lineage.Specification.StructuredContent as S

private
  variable
    x a u : Level
    Text : Set x
    AssetId : Set a
    URI : Set u

mutual
  denoteInline : I.Inline Text AssetId URI → S.Inline Text AssetId URI
  denoteInline (I.text-node role value) = S.text role value
  denoteInline (I.emphasis-node emphasis children) =
    S.emphasized emphasis (denoteInlines children)
  denoteInline (I.link-node uri children) = S.link uri (denoteInlines children)
  denoteInline (I.image-node asset description role) = S.image asset description role
  denoteInline (I.audio-node asset description role) = S.audio asset description role
  denoteInline (I.video-node asset description role) = S.video asset description role
  denoteInline (I.placeholder-node role description) = S.placeholder role description

  denoteInlines : List (I.Inline Text AssetId URI) → List (S.Inline Text AssetId URI)
  denoteInlines [] = []
  denoteInlines (node ∷ nodes) = denoteInline node ∷ denoteInlines nodes

mutual
  denoteBlock : I.Block Text AssetId URI → S.Block Text AssetId URI
  denoteBlock (I.paragraph-node children) = S.paragraph (denoteInlines children)
  denoteBlock (I.heading-node level children) = S.heading level (denoteInlines children)
  denoteBlock (I.list-node items) = S.list (denoteItems items)
  denoteBlock (I.quote-node children) = S.quotation (denoteBlocks children)
  denoteBlock (I.code-node value) = S.code value
  denoteBlock (I.mathematics-node value) = S.mathematics value
  denoteBlock (I.table-node rows) = S.table (denoteRows rows)
  denoteBlock (I.media-node media) = S.media (denoteInline media)

  denoteBlocks : List (I.Block Text AssetId URI) → List (S.Block Text AssetId URI)
  denoteBlocks [] = []
  denoteBlocks (node ∷ nodes) = denoteBlock node ∷ denoteBlocks nodes

  denoteItems : List (List (I.Block Text AssetId URI)) →
    List (List (S.Block Text AssetId URI))
  denoteItems [] = []
  denoteItems (item ∷ items) = denoteBlocks item ∷ denoteItems items

  denoteRows : List (List (List (I.Block Text AssetId URI))) →
    List (List (List (S.Block Text AssetId URI)))
  denoteRows [] = []
  denoteRows (row ∷ rows) = denoteItems row ∷ denoteRows rows

denoteDocument : I.Document Text AssetId URI → S.Document Text AssetId URI
denoteDocument = denoteBlocks
```
