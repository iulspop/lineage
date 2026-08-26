# Provenance semantics

Provenance records origin rather than truth. Records are immutable facts; a
correction names an earlier record instead of replacing it. A correction may
not target itself.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Provenance where

open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)
open import Relation.Nullary.Negation using (¬_)

private
  variable i s y o t : Level

record Record
  {RecordId : Set i} {Subject : Set s} {System : Set y}
  {OriginId : Set o} {Timestamp : Set t} : Set (i ⊔ s ⊔ y ⊔ o ⊔ t) where
  constructor provenance-record
  field
    id : RecordId
    subject : Subject
    system : System
    origin-id : OriginId
    observed-at : Timestamp

open Record public

data Event {RecordId : Set i} : Set i where
  imported : Event
  derived : Event
  corrected : (target : RecordId) → Event

record Entry
  {RecordId : Set i} {Subject : Set s} {System : Set y}
  {OriginId : Set o} {Timestamp : Set t} : Set (i ⊔ s ⊔ y ⊔ o ⊔ t) where
  constructor entry
  field
    fact : Record {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}
    event : Event {RecordId = RecordId}
    correction-is-distinct : ∀ {target} → event ≡ corrected target → ¬ (id fact ≡ target)

open Entry public
```
