# Provenance validation

Validation accepts imports and derivations directly. Corrections are accepted
only when their target differs from the correcting record's identity.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Provenance where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (yes; no)
open import Relation.Nullary.Negation using (¬_)

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

data Valid {i s y o t}
  {RecordId : Set i} {Subject : Set s} {System : Set y}
  {OriginId : Set o} {Timestamp : Set t}
  (raw : I.RawEntry RecordId Subject System OriginId Timestamp) :
  Set (i ⊔ s ⊔ y ⊔ o ⊔ t) where
  imported-valid : I.event raw ≡ S.imported → Valid raw
  derived-valid : I.event raw ≡ S.derived → Valid raw
  corrected-valid : ∀ {target} → I.event raw ≡ S.corrected target →
    ¬ (I.id raw ≡ target) → Valid raw

valid? : DecidableEquality RecordId →
  (raw : I.RawEntry RecordId Subject System OriginId Timestamp) → Maybe (Valid raw)
valid? equality raw with I.event raw in event-equality
... | S.imported = just (imported-valid event-equality)
... | S.derived = just (derived-valid event-equality)
... | S.corrected target with equality (I.id raw) target
...   | yes _ = nothing
...   | no distinct = just (corrected-valid event-equality distinct)

correction-proof :
  (raw : I.RawEntry RecordId Subject System OriginId Timestamp) →
  Valid raw → ∀ {target} → I.event raw ≡ S.corrected target →
  ¬ (I.id raw ≡ target)
correction-proof raw (imported-valid imported-equality) correction-equality
  with imported-equality | correction-equality
... | refl | ()
correction-proof raw (derived-valid derived-equality) correction-equality
  with derived-equality | correction-equality
... | refl | ()
correction-proof raw (corrected-valid event-equality distinct) correction-equality
  with event-equality | correction-equality
... | refl | refl = distinct

certify : (raw : I.RawEntry RecordId Subject System OriginId Timestamp) →
  Valid raw → I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}
certify raw certificate = I.entry
  (I.id raw) (I.subject raw) (I.system raw) (I.origin-id raw)
  (I.observed-at raw) (I.event raw) (correction-proof raw certificate)

validate : DecidableEquality RecordId →
  I.RawEntry RecordId Subject System OriginId Timestamp →
  Maybe (I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp})
validate equality raw with valid? equality raw
... | just certificate = just (certify raw certificate)
... | nothing = nothing
```
