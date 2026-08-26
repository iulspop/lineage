# Relationship endpoint validation

A relationship is locally meaningful only when both typed endpoint identities
resolve in the corpus. Kind interpretation is deliberately not required:
unknown kinds are valid preservable data.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Relationship where

open import Data.Bool.Base using (Bool; _∧_)
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

endpointExists :
  (S.ObjectKind → ObjectId → Bool) → I.Endpoint ObjectId → Bool
endpointExists exists target = exists
  (I.Endpoint.object-kind target)
  (I.Endpoint.object-id target)

valid :
  (S.ObjectKind → ObjectId → Bool) →
  I.Relationship RelationshipId ObjectId Kind Timestamp → Bool
valid exists related =
  endpointExists exists (I.Relationship.from related) ∧
  endpointExists exists (I.Relationship.to related)
```
