# Provenance preservation

Every durable provenance observation commutes with denotation. In particular,
a correction remains an explicit event targeting a distinct earlier identity.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Provenance where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Provenance as D
import Lineage.Implementation.Provenance as I
import Lineage.Specification.Provenance as S

private
  variable
    i s y o t : Level
    RecordId : Set i
    Subject : Set s
    System : Set y
    OriginId : Set o
    Timestamp : Set t

id-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.id (S.fact (D.denote value)) ≡ I.id value
id-preserved value = refl

subject-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.subject (S.fact (D.denote value)) ≡ I.subject value
subject-preserved value = refl

system-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.system (S.fact (D.denote value)) ≡ I.system value
system-preserved value = refl

origin-id-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.origin-id (S.fact (D.denote value)) ≡ I.origin-id value
origin-id-preserved value = refl

timestamp-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.observed-at (S.fact (D.denote value)) ≡ I.observed-at value
timestamp-preserved value = refl

event-preserved :
  (value : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}) →
  S.event (D.denote value) ≡ I.event value
event-preserved value = refl
```
