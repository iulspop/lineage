# Append-oriented provenance examples

Imported and derived facts validate directly. A correction targeting another
record validates, while a self-correction is rejected.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Provenance where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (yes; no)

import Lineage.Correctness.Provenance as C
import Lineage.Denotation.Provenance as D
import Lineage.Implementation.Provenance as I
import Lineage.Specification.Provenance as S
import Lineage.Validation.Provenance as V

data RecordId : Set where first correction : RecordId
data Subject : Set where prompt : Subject
data System : Set where anki lineage : System
data OriginId : Set where card-42 : OriginId
data Timestamp : Set where initial-time correction-time : Timestamp

record-id-equality : DecidableEquality RecordId
record-id-equality first first = yes refl
record-id-equality first correction = no λ ()
record-id-equality correction first = no λ ()
record-id-equality correction correction = yes refl

imported-raw : I.RawEntry RecordId Subject System OriginId Timestamp
imported-raw = I.raw-entry first prompt anki card-42 initial-time S.imported

correction-raw : I.RawEntry RecordId Subject System OriginId Timestamp
correction-raw = I.raw-entry correction prompt lineage card-42 correction-time
  (S.corrected first)

self-correction-raw : I.RawEntry RecordId Subject System OriginId Timestamp
self-correction-raw = I.raw-entry correction prompt lineage card-42 correction-time
  (S.corrected correction)

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

imported-accepted : IsJust (V.validate record-id-equality imported-raw)
imported-accepted = is-just

correction-accepted : IsJust (V.validate record-id-equality correction-raw)
correction-accepted = is-just

self-correction-rejected :
  V.validate record-id-equality self-correction-raw ≡ nothing
self-correction-rejected = refl

validated-correction :
  I.Entry {RecordId = RecordId} {Subject} {System} {OriginId} {Timestamp}
validated-correction = V.certify correction-raw
  (V.corrected-valid refl (λ ()))

meaning = D.denote validated-correction
identity-preserved = C.id-preserved validated-correction
event-preserved = C.event-preserved validated-correction
```
