# Material and Source validation

The decoding boundary rejects revision zero for both reusable Materials and
shared Sources, preserving historical interpretability of exact references.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.MaterialSource where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Level using (Level)
import Lineage.Implementation.MaterialSource as I
import Lineage.Specification.MaterialSource as S

private
  variable
    m s p c v : Level
    V : S.Vocabulary m s p c v

validateMaterial : I.RawMaterialRevision V → Maybe (I.MaterialRevision V)
validateMaterial (I.raw-material-revision material-id zero scope content provenance) = nothing
validateMaterial (I.raw-material-revision material-id (suc index) scope content provenance) =
  just (I.material-revision material-id index scope content provenance)

validateSource : I.RawSourceRevision V → Maybe (I.SourceRevision V)
validateSource (I.raw-source-revision source-id zero kind content provenance) = nothing
validateSource (I.raw-source-revision source-id (suc index) kind content provenance) =
  just (I.source-revision source-id index kind content provenance)
```
