# Executable provenance representation

Raw entries cross the storage or host boundary without proof fields. Validated
entries use an executable record distinct from the semantic representation and
carry evidence that corrections are non-reflexive.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Provenance where

open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)
open import Relation.Nullary.Negation using (¬_)
import Lineage.Specification.Provenance as S

private
  variable i s y o t : Level

record RawEntry
  (RecordId : Set i) (Subject : Set s) (System : Set y)
  (OriginId : Set o) (Timestamp : Set t) : Set (i ⊔ s ⊔ y ⊔ o ⊔ t) where
  constructor raw-entry
  field
    id : RecordId
    subject : Subject
    system : System
    origin-id : OriginId
    observed-at : Timestamp
    event : S.Event {RecordId = RecordId}

open RawEntry public

record Entry
  {RecordId : Set i} {Subject : Set s} {System : Set y}
  {OriginId : Set o} {Timestamp : Set t} : Set (i ⊔ s ⊔ y ⊔ o ⊔ t) where
  constructor entry
  field
    id : RecordId
    subject : Subject
    system : System
    origin-id : OriginId
    observed-at : Timestamp
    event : S.Event {RecordId = RecordId}
    correction-is-distinct : ∀ {target} → event ≡ S.corrected target →
      ¬ (id ≡ target)

open Entry public
```
