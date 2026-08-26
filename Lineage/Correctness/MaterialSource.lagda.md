# Material and Source correctness

The denotation preserves stable identity and the complete immutable revision
snapshot. Consequently an exact revision reference cannot silently acquire the
content or provenance of a later edit.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.MaterialSource where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.MaterialSource as D
import Lineage.Implementation.MaterialSource as I
import Lineage.Specification.MaterialSource as S

private
  variable
    m s p c v : Level
    V : S.Vocabulary m s p c v

material-identity-preserved : (material : I.MaterialRevision V) →
  S.MaterialRevision.material-id (D.denoteMaterial material) ≡
  I.MaterialRevision.material-id material
material-identity-preserved material = refl

material-revision-preserved : (material : I.MaterialRevision V) →
  S.MaterialRevision.revision (D.denoteMaterial material) ≡
  I.MaterialRevision.revision material
material-revision-preserved material = refl

material-snapshot-preserved : (material : I.MaterialRevision V) →
  S.MaterialRevision.content (D.denoteMaterial material) ≡
  I.MaterialRevision.content material
material-snapshot-preserved material = refl

material-provenance-preserved : (material : I.MaterialRevision V) →
  S.MaterialRevision.provenance (D.denoteMaterial material) ≡
  I.MaterialRevision.provenance material
material-provenance-preserved material = refl

source-identity-preserved : (source : I.SourceRevision V) →
  S.SourceRevision.source-id (D.denoteSource source) ≡
  I.SourceRevision.source-id source
source-identity-preserved source = refl

source-revision-preserved : (source : I.SourceRevision V) →
  S.SourceRevision.revision (D.denoteSource source) ≡
  I.SourceRevision.revision source
source-revision-preserved source = refl

source-snapshot-preserved : (source : I.SourceRevision V) →
  S.SourceRevision.content (D.denoteSource source) ≡
  I.SourceRevision.content source
source-snapshot-preserved source = refl

source-kind-preserved : (source : I.SourceRevision V) →
  S.SourceRevision.kind (D.denoteSource source) ≡
  I.SourceRevision.kind source
source-kind-preserved source = refl

source-provenance-preserved : (source : I.SourceRevision V) →
  S.SourceRevision.provenance (D.denoteSource source) ≡
  I.SourceRevision.provenance source
source-provenance-preserved source = refl
```
