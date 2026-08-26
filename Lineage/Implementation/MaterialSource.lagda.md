# Executable Material and Source representation

Decoded revisions retain explicit natural-number revisions until validation.
Validated values store predecessor indices, making revision zero
unrepresentable in the executable core.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.MaterialSource where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level; _⊔_)
import Lineage.Specification.MaterialSource as S

private
  variable m s p c v : Level

record RawMaterialRevision {m s p c v : Level} (V : S.Vocabulary m s p c v) : Set (m ⊔ p ⊔ c ⊔ v) where
  constructor raw-material-revision
  field
    material-id : S.MaterialId V
    revision : ℕ
    scope : S.Scope (S.PromptId V)
    content : S.Content V
    provenance : List (S.ProvenanceId V)

record MaterialRevision {m s p c v : Level} (V : S.Vocabulary m s p c v) : Set (m ⊔ p ⊔ c ⊔ v) where
  constructor material-revision
  field
    material-id : S.MaterialId V
    revision-index : ℕ
    scope : S.Scope (S.PromptId V)
    content : S.Content V
    provenance : List (S.ProvenanceId V)

  revision : ℕ
  revision = suc revision-index

record RawSourceRevision {m s p c v : Level} (V : S.Vocabulary m s p c v) : Set (s ⊔ c ⊔ v) where
  constructor raw-source-revision
  field
    source-id : S.SourceId V
    revision : ℕ
    kind : S.SourceKind
    content : S.Content V
    provenance : List (S.ProvenanceId V)

record SourceRevision {m s p c v : Level} (V : S.Vocabulary m s p c v) : Set (s ⊔ c ⊔ v) where
  constructor source-revision
  field
    source-id : S.SourceId V
    revision-index : ℕ
    kind : S.SourceKind
    content : S.Content V
    provenance : List (S.ProvenanceId V)

  revision : ℕ
  revision = suc revision-index
```
