# Executable corpus relationships

The executable representation retains stable relationship identity, open kind
identifiers, typed endpoints, and creation time without changing the identities
of the objects being connected.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Relationship where

open import Level using (Level; _⊔_)
import Lineage.Specification.Relationship as S

private
  variable r o k t : Level

record Endpoint (ObjectId : Set o) : Set o where
  constructor endpoint
  field
    object-kind : S.ObjectKind
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
