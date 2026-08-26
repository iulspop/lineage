# Corpus migration correctness

Denotation preserves both chain validity and the final format version reached by
a migration history. These structural laws are prerequisites for later proofs
that each concrete migration also preserves durable corpus meaning.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Migration where

open import Data.Bool.Base using (Bool; true; false; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ; suc; _≡ᵇ_; _≤ᵇ_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong₂)
import Lineage.Denotation.Migration as D
import Lineage.Implementation.Migration as I
import Lineage.Specification.Migration as S
import Lineage.Validation.Migration as V

private
  variable
    i t g : Level
    MigrationId : Set i
    Timestamp : Set t
    Digest : Set g

semanticStepMovesForward : S.Step MigrationId Timestamp Digest → Bool
semanticStepMovesForward migration =
  suc (S.Step.from-version migration) ≤ᵇ S.Step.to-version migration

semanticChainValid :
  ℕ → List (S.Step MigrationId Timestamp Digest) → Bool
semanticChainValid expected [] = true
semanticChainValid expected (migration ∷ migrations) =
  (expected ≡ᵇ S.Step.from-version migration) ∧
  semanticStepMovesForward migration ∧
  semanticChainValid (S.Step.to-version migration) migrations

semanticValid : S.History MigrationId Timestamp Digest → Bool
semanticValid migrationHistory = semanticChainValid
  (S.History.initial-version migrationHistory)
  (S.History.steps migrationHistory)

semanticCurrentVersion : S.History MigrationId Timestamp Digest → ℕ
semanticCurrentVersion migrationHistory = go
  (S.History.initial-version migrationHistory)
  (S.History.steps migrationHistory)
  where
    go : ℕ → List (S.Step MigrationId Timestamp Digest) → ℕ
    go current [] = current
    go current (migration ∷ migrations) =
      go (S.Step.to-version migration) migrations

step-forward-preserved :
  (migration : I.Step MigrationId Timestamp Digest) →
  V.stepMovesForward migration ≡
    semanticStepMovesForward (D.denoteStep migration)
step-forward-preserved migration = refl

chain-validity-preserved :
  (expected : ℕ) →
  (migrations : List (I.Step MigrationId Timestamp Digest)) →
  V.chainValid expected migrations ≡
    semanticChainValid expected (D.denoteSteps migrations)
chain-validity-preserved expected [] = refl
chain-validity-preserved expected (migration ∷ migrations) with
  expected ≡ᵇ I.Step.from-version migration |
  V.stepMovesForward migration
... | false | moves = refl
... | true | false = refl
... | true | true =
  chain-validity-preserved (I.Step.to-version migration) migrations

validation-preserved :
  (migrationHistory : I.History MigrationId Timestamp Digest) →
  V.valid migrationHistory ≡ semanticValid (D.denote migrationHistory)
validation-preserved migrationHistory =
  chain-validity-preserved
    (I.History.initial-version migrationHistory)
    (I.History.steps migrationHistory)

current-version-preserved :
  (migrationHistory : I.History MigrationId Timestamp Digest) →
  V.currentVersion migrationHistory ≡
    semanticCurrentVersion (D.denote migrationHistory)
current-version-preserved (I.history initial migrations) = go initial migrations
  where
    go : (current : ℕ) →
      (remaining : List (I.Step MigrationId Timestamp Digest)) →
      V.currentVersion (I.history current remaining) ≡
        semanticCurrentVersion (S.history current (D.denoteSteps remaining))
    go current [] = refl
    go current (migration ∷ migrations) =
      go (I.Step.to-version migration) migrations
```
