# Corpus relationship denotation

Denotation preserves relationship and endpoint identities exactly. Consequently,
adding, removing, or reorganizing relationships never changes the meaning of the
objects they connect.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Relationship where

open import Level using (Level)
import Lineage.Implementation.Relationship as I
import Lineage.Specification.Relationship as S

private
  variable
    r o k t : Level
    RelationshipId : Set r
    ObjectId : Set o
    Kind : Set k
    Timestamp : Set t

denoteEndpoint : I.Endpoint ObjectId → S.Endpoint ObjectId
denoteEndpoint target = S.endpoint
  (I.Endpoint.object-kind target)
  (I.Endpoint.object-id target)

denote : I.Relationship RelationshipId ObjectId Kind Timestamp →
  S.Relationship RelationshipId ObjectId Kind Timestamp
denote related = S.relationship
  (I.Relationship.relationship-id related)
  (I.Relationship.kind related)
  (denoteEndpoint (I.Relationship.from related))
  (denoteEndpoint (I.Relationship.to related))
  (I.Relationship.created-at related)
```
