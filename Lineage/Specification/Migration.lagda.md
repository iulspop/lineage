# Corpus migration semantics

Migration history is durable evidence of explicit schema evolution. Each step
moves forward from the version produced by the preceding step. The history is
separate from corpus meaning: a correct migration must additionally preserve the
denotation of durable content.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Migration where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)

private
  variable i t g : Level

record Step (MigrationId : Set i) (Timestamp : Set t)
  (Digest : Set g) : Set (i ⊔ t ⊔ g) where
  constructor step
  field
    migration-id : MigrationId
    from-version : ℕ
    to-version : ℕ
    applied-at : Timestamp
    result-digest : Digest

record History (MigrationId : Set i) (Timestamp : Set t)
  (Digest : Set g) : Set (i ⊔ t ⊔ g) where
  constructor history
  field
    initial-version : ℕ
    steps : List (Step MigrationId Timestamp Digest)
```
