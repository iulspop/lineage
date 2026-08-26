# Material and Source examples

These fixtures validate accepted first revisions, reject revision zero, and show
that a later edit sharing stable identity remains a distinct immutable snapshot.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.MaterialSource where

open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (just; nothing)
open import Data.String.Base using (String)
open import Relation.Binary.PropositionalEquality using (_≡_; _≢_; refl)
import Lineage.Denotation.MaterialSource as D
import Lineage.Implementation.MaterialSource as I
import Lineage.Specification.MaterialSource as S
import Lineage.Validation.MaterialSource as V

Vocabulary : S.Vocabulary _ _ _ _ _
Vocabulary = record
  { MaterialId = String
  ; SourceId = String
  ; PromptId = String
  ; Content = String
  ; ProvenanceId = String
  }

raw-material : I.RawMaterialRevision Vocabulary
raw-material = I.raw-material-revision
  "mat-paris" 1 S.corpus-shared "Paris" ("prov-import" ∷ [])

material-v1 : I.MaterialRevision Vocabulary
material-v1 = I.material-revision
  "mat-paris" 0 S.corpus-shared "Paris" ("prov-import" ∷ [])

accepted-material : V.validateMaterial raw-material ≡ just material-v1
accepted-material = refl

zero-material : I.RawMaterialRevision Vocabulary
zero-material =
  I.raw-material-revision "mat-paris" 0 S.corpus-shared "Paris" []

rejected-material-zero : V.validateMaterial zero-material ≡ nothing
rejected-material-zero = refl

raw-source : I.RawSourceRevision Vocabulary
raw-source = I.raw-source-revision
  "src-france" 1 S.document "France reference" ("prov-import" ∷ [])

source-v1 : I.SourceRevision Vocabulary
source-v1 = I.source-revision
  "src-france" 0 S.document "France reference" ("prov-import" ∷ [])

accepted-source : V.validateSource raw-source ≡ just source-v1
accepted-source = refl

zero-source : I.RawSourceRevision Vocabulary
zero-source =
  I.raw-source-revision "src-france" 0 S.document "France reference" []

rejected-source-zero : V.validateSource zero-source ≡ nothing
rejected-source-zero = refl

material-v2 : I.MaterialRevision Vocabulary
material-v2 = I.material-revision
  "mat-paris" 1 S.corpus-shared "Paris, France" ("prov-correction" ∷ [])

old-snapshot-still-denotes-old-content :
  S.MaterialRevision.content (D.denoteMaterial material-v1) ≡ "Paris"
old-snapshot-still-denotes-old-content = refl

new-snapshot-has-next-revision :
  S.MaterialRevision.revision (D.denoteMaterial material-v2) ≡ 2
new-snapshot-has-next-revision = refl
```
