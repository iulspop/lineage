# Corpus relationship correctness

Endpoint resolution and every durable relationship field are preserved by
denotation. Relationship organization is therefore observationally separate
from the identities and contents of connected corpus objects.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Relationship where

open import Data.Bool.Base using (Bool; _∧_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong₂)
import Lineage.Denotation.Relationship as D
import Lineage.Implementation.Relationship as I
import Lineage.Specification.Relationship as S
import Lineage.Validation.Relationship as V

private
  variable
    r o k t : Level
    RelationshipId : Set r
    ObjectId : Set o
    Kind : Set k
    Timestamp : Set t

semanticEndpointExists :
  (S.ObjectKind → ObjectId → Bool) → S.Endpoint ObjectId → Bool
semanticEndpointExists exists target = exists
  (S.Endpoint.object-kind target)
  (S.Endpoint.object-id target)

semanticValid :
  (S.ObjectKind → ObjectId → Bool) →
  S.Relationship RelationshipId ObjectId Kind Timestamp → Bool
semanticValid exists related =
  semanticEndpointExists exists (S.Relationship.from related) ∧
  semanticEndpointExists exists (S.Relationship.to related)

endpoint-resolution-preserved :
  (exists : S.ObjectKind → ObjectId → Bool) →
  (target : I.Endpoint ObjectId) →
  V.endpointExists exists target ≡
    semanticEndpointExists exists (D.denoteEndpoint target)
endpoint-resolution-preserved exists target = refl

validation-preserved :
  (exists : S.ObjectKind → ObjectId → Bool) →
  (related : I.Relationship RelationshipId ObjectId Kind Timestamp) →
  V.valid exists related ≡ semanticValid exists (D.denote related)
validation-preserved exists related =
  cong₂ _∧_
    (endpoint-resolution-preserved exists (I.Relationship.from related))
    (endpoint-resolution-preserved exists (I.Relationship.to related))

relationship-id-preserved :
  (related : I.Relationship RelationshipId ObjectId Kind Timestamp) →
  S.Relationship.relationship-id (D.denote related) ≡
    I.Relationship.relationship-id related
relationship-id-preserved related = refl

kind-preserved :
  (related : I.Relationship RelationshipId ObjectId Kind Timestamp) →
  S.Relationship.kind (D.denote related) ≡ I.Relationship.kind related
kind-preserved related = refl

from-identity-preserved :
  (related : I.Relationship RelationshipId ObjectId Kind Timestamp) →
  S.Endpoint.object-id (S.Relationship.from (D.denote related)) ≡
    I.Endpoint.object-id (I.Relationship.from related)
from-identity-preserved related = refl

to-identity-preserved :
  (related : I.Relationship RelationshipId ObjectId Kind Timestamp) →
  S.Endpoint.object-id (S.Relationship.to (D.denote related)) ≡
    I.Endpoint.object-id (I.Relationship.to related)
to-identity-preserved related = refl
```
