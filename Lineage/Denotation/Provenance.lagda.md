# Provenance denotation

Denotation forgets executable record layout while preserving the origin fact,
event classification, and auditable correction evidence.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Provenance where

open import Level using (Level)
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

denote : I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp} →
  S.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}
denote value = S.entry
  (S.provenance-record (I.id value) (I.subject value) (I.system value)
    (I.origin-id value) (I.observed-at value))
  (I.event value) (I.correction-is-distinct value)
```
