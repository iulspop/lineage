# Executable corpus migration history

The executable history is append-oriented and records the exact input and output
format versions of every applied migration together with audit metadata.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Migration where

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
