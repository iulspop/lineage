# Corpus relationship semantics

Relationships connect independently identified corpus objects without making
organization part of object identity. The relationship kind is open data, so
unknown kinds survive implementations that cannot interpret them.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Relationship where

open import Level using (Level; _⊔_)

private
  variable r o k t : Level

data ObjectKind : Set where
  prompt material source asset provenance : ObjectKind

record Endpoint (ObjectId : Set o) : Set o where
  constructor endpoint
  field
    object-kind : ObjectKind
    object-id : ObjectId

record Relationship (RelationshipId : Set r) (ObjectId : Set o)
  (Kind : Set k) (Timestamp : Set t) : Set (r ⊔ o ⊔ k ⊔ t) where
  constructor relationship
  field
    relationship-id : RelationshipId
    kind : Kind
    from : Endpoint ObjectId
    to : Endpoint ObjectId
    created-at : Timestamp
```
