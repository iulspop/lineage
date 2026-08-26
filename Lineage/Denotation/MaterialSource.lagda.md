# Material and Source denotation

Denotation removes executable representation choices while preserving each
immutable snapshot's stable identity, exact revision, ownership, content, kind,
and provenance.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.MaterialSource where

open import Level using (Level)
import Lineage.Implementation.MaterialSource as I
import Lineage.Specification.MaterialSource as S

private
  variable
    m s p c v : Level
    V : S.Vocabulary m s p c v

denoteMaterial : I.MaterialRevision V → S.MaterialRevision V
denoteMaterial material = S.material-revision
  (I.MaterialRevision.material-id material)
  (I.MaterialRevision.revision-index material)
  (I.MaterialRevision.scope material)
  (I.MaterialRevision.content material)
  (I.MaterialRevision.provenance material)

denoteSource : I.SourceRevision V → S.SourceRevision V
denoteSource source = S.source-revision
  (I.SourceRevision.source-id source)
  (I.SourceRevision.revision-index source)
  (I.SourceRevision.kind source)
  (I.SourceRevision.content source)
  (I.SourceRevision.provenance source)
```
