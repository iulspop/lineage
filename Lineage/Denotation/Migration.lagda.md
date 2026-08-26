# Corpus migration denotation

Denotation preserves the complete ordered migration audit trail while forgetting
its executable record layout.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Migration where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Implementation.Migration as I
import Lineage.Specification.Migration as S

private
  variable
    i t g : Level
    MigrationId : Set i
    Timestamp : Set t
    Digest : Set g

denoteStep : I.Step MigrationId Timestamp Digest →
  S.Step MigrationId Timestamp Digest
denoteStep migration = S.step
  (I.Step.migration-id migration)
  (I.Step.from-version migration)
  (I.Step.to-version migration)
  (I.Step.applied-at migration)
  (I.Step.result-digest migration)

denoteSteps : List (I.Step MigrationId Timestamp Digest) →
  List (S.Step MigrationId Timestamp Digest)
denoteSteps [] = []
denoteSteps (migration ∷ migrations) =
  denoteStep migration ∷ denoteSteps migrations

denote : I.History MigrationId Timestamp Digest →
  S.History MigrationId Timestamp Digest
denote migrationHistory = S.history
  (I.History.initial-version migrationHistory)
  (denoteSteps (I.History.steps migrationHistory))
```
