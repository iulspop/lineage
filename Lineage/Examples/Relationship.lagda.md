# Corpus relationship examples

The fixtures show that known endpoints validate independently of relationship
kind interpretation, while a dangling endpoint is rejected. The open numeric
kind `99` stands for an implementation-unknown relationship kind that is still
preserved.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Relationship where

open import Data.Bool.Base using (Bool; true; false)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Relationship as C
import Lineage.Denotation.Relationship as D
import Lineage.Implementation.Relationship as I
import Lineage.Specification.Relationship as S
import Lineage.Validation.Relationship as V

exists : S.ObjectKind → ℕ → Bool
exists S.prompt (suc zero) = true
exists S.source (suc (suc zero)) = true
exists object-kind object-id = false

promptOne : I.Endpoint ℕ
promptOne = I.endpoint S.prompt (suc zero)

sourceTwo : I.Endpoint ℕ
sourceTwo = I.endpoint S.source (suc (suc zero))

missingAsset : I.Endpoint ℕ
missingAsset = I.endpoint S.asset (suc (suc (suc zero)))

unknownKindRelationship : I.Relationship ℕ ℕ ℕ ℕ
unknownKindRelationship = I.relationship
  (suc zero)
  99
  promptOne
  sourceTwo
  zero

danglingRelationship : I.Relationship ℕ ℕ ℕ ℕ
danglingRelationship = I.relationship
  (suc (suc zero))
  7
  promptOne
  missingAsset
  zero

unknown-kind-preserved-proof :
  S.Relationship.kind (D.denote unknownKindRelationship) ≡ 99
unknown-kind-preserved-proof = refl

valid-endpoints-proof : V.valid exists unknownKindRelationship ≡ true
valid-endpoints-proof = refl

dangling-endpoint-rejection-proof : V.valid exists danglingRelationship ≡ false
dangling-endpoint-rejection-proof = refl

semantic-validation-proof :
  C.semanticValid exists (D.denote unknownKindRelationship) ≡ true
semantic-validation-proof = refl
```
