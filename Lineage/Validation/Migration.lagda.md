# Migration-history validation

A valid migration history is a forward-only chain. Every step must consume the
version produced immediately before it and produce a strictly greater version.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Migration where

open import Data.Bool.Base using (Bool; true; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (ℕ; suc; _≡ᵇ_; _≤ᵇ_)
open import Level using (Level)
import Lineage.Implementation.Migration as I

private
  variable
    i t g : Level
    MigrationId : Set i
    Timestamp : Set t
    Digest : Set g

stepMovesForward : I.Step MigrationId Timestamp Digest → Bool
stepMovesForward migration =
  suc (I.Step.from-version migration) ≤ᵇ I.Step.to-version migration

chainValid : ℕ → List (I.Step MigrationId Timestamp Digest) → Bool
chainValid expected [] = true
chainValid expected (migration ∷ migrations) =
  (expected ≡ᵇ I.Step.from-version migration) ∧
  stepMovesForward migration ∧
  chainValid (I.Step.to-version migration) migrations

valid : I.History MigrationId Timestamp Digest → Bool
valid migrationHistory = chainValid
  (I.History.initial-version migrationHistory)
  (I.History.steps migrationHistory)

currentVersion : I.History MigrationId Timestamp Digest → ℕ
currentVersion migrationHistory = go
  (I.History.initial-version migrationHistory)
  (I.History.steps migrationHistory)
  where
    go : ℕ → List (I.Step MigrationId Timestamp Digest) → ℕ
    go current [] = current
    go current (migration ∷ migrations) =
      go (I.Step.to-version migration) migrations
```
