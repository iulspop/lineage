# Material and Source semantics

Materials are reusable content fragments used to assemble review views. Sources
are authored, imported, or captured documents from which Prompts and Materials
may be derived; they are not scheduled merely by existing. Both use stable
identity and immutable, one-based revisions. References name an exact revision,
so later edits cannot reinterpret an old Prompt.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.MaterialSource where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level; _⊔_)

private
  variable m s p c v : Level

record Vocabulary (m s p c v : Level) : Set (Level.suc (m ⊔ s ⊔ p ⊔ c ⊔ v)) where
  field
    MaterialId : Set m
    SourceId : Set s
    PromptId : Set p
    Content : Set c
    ProvenanceId : Set v

open Vocabulary public

data Scope {p : Level} (PromptId : Set p) : Set p where
  prompt-local : PromptId → Scope PromptId
  corpus-shared : Scope PromptId

data SourceKind : Set where
  note document quotation textbook-excerpt anki-note image-source structured-data : SourceKind

record MaterialRevision {m s p c v : Level} (V : Vocabulary m s p c v) : Set (m ⊔ p ⊔ c ⊔ v) where
  constructor material-revision
  field
    material-id : MaterialId V
    revision-index : ℕ
    scope : Scope (PromptId V)
    content : Content V
    provenance : List (ProvenanceId V)

  revision : ℕ
  revision = suc revision-index

record SourceRevision {m s p c v : Level} (V : Vocabulary m s p c v) : Set (s ⊔ c ⊔ v) where
  constructor source-revision
  field
    source-id : SourceId V
    revision-index : ℕ
    kind : SourceKind
    content : Content V
    provenance : List (ProvenanceId V)

  revision : ℕ
  revision = suc revision-index

record MaterialReference {m s p c v : Level} (V : Vocabulary m s p c v) : Set m where
  constructor material-reference
  field
    material-id : MaterialId V
    revision-index : ℕ

  revision : ℕ
  revision = suc revision-index

record SourceReference {m s p c v : Level} (V : Vocabulary m s p c v) : Set s where
  constructor source-reference
  field
    source-id : SourceId V
    revision-index : ℕ

  revision : ℕ
  revision = suc revision-index
```
