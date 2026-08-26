# Structured content examples

These fixtures demonstrate a portable accessible image, preservation of its
semantic meaning, compositional document construction, and rejection of
arbitrary executable content at the untrusted boundary.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.StructuredContent where

open import Data.List.Base using ([]; _∷_; _++_)
open import Data.Maybe.Base using (just; nothing)
open import Data.String.Base using (String)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.StructuredContent as C
import Lineage.Denotation.StructuredContent as D
import Lineage.Implementation.StructuredContent as I
import Lineage.Specification.StructuredContent as S
import Lineage.Validation.StructuredContent as V

private
  Text AssetId URI : Set
  Text = String
  AssetId = String
  URI = String

accessible-image : I.Inline Text AssetId URI
accessible-image =
  I.image-node "asset-eiffel-tower" "The Eiffel Tower in Paris" S.cue

portable-document : I.Document Text AssetId URI
portable-document =
  I.paragraph-node
    (I.text-node S.question "Which city contains this landmark?" ∷ []) ∷
  I.media-node accessible-image ∷ []

image-meaning-preserved :
  D.denoteInline accessible-image ≡
    S.image "asset-eiffel-tower" "The Eiffel Tower in Paris" S.cue
image-meaning-preserved = refl

question-document : I.Document Text AssetId URI
question-document =
  I.paragraph-node (I.text-node S.question "Question" ∷ []) ∷ []

media-document : I.Document Text AssetId URI
media-document = I.media-node accessible-image ∷ []

composition-preserved :
  D.denoteDocument (question-document ++ media-document) ≡
  D.denoteDocument question-document ++ D.denoteDocument media-document
composition-preserved = C.blocks-compose question-document media-document

accepted-portable-image :
  V.validateInline
    (V.raw-image "asset-eiffel-tower" "The Eiffel Tower in Paris" S.cue) ≡
  just accessible-image
accepted-portable-image = refl

rejected-executable-content :
  V.validateInline {AssetId = AssetId} {URI = URI}
    (V.raw-script "alert('not canonical')") ≡ nothing
rejected-executable-content = refl
```
