# Durable local asset example

A small image payload is accepted only when its declared size and digest match
the locally resolved payload. Wrong metadata and unavailable locations are
rejected.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.Asset where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ; zero; suc)
open import Data.Unit.Base using (⊤; tt)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (Dec; yes; no)

import Lineage.Correctness.Asset as C
import Lineage.Denotation.Asset as D
import Lineage.Implementation.Asset as I
import Lineage.Specification.Asset as S
import Lineage.Validation.Asset as V

data AssetId : Set where skeleton : AssetId
data MediaType : Set where image-png : MediaType
data Digest : Set where digest-a digest-b : Digest
data Location : Set where local-path remote-only : Location
data Payload : Set where skeleton-bytes : Payload

payload-size : Payload → ℕ
payload-size skeleton-bytes = suc (suc (suc zero))

payload-digest : Payload → Digest
payload-digest skeleton-bytes = digest-a

data Local : Location → Payload → Set where
  found : Local local-path skeleton-bytes

local? : (location : Location) → (payload : Payload) → Dec (Local location payload)
local? local-path skeleton-bytes = yes found
local? remote-only skeleton-bytes = no λ ()

digest-equality : DecidableEquality Digest
digest-equality digest-a digest-a = yes refl
digest-equality digest-a digest-b = no λ ()
digest-equality digest-b digest-a = no λ ()
digest-equality digest-b digest-b = yes refl

valid-raw : I.RawAsset AssetId MediaType Digest Location Payload
valid-raw = I.raw-asset skeleton image-png (suc (suc (suc zero)))
  digest-a local-path skeleton-bytes

wrong-digest-raw : I.RawAsset AssetId MediaType Digest Location Payload
wrong-digest-raw = I.raw-asset skeleton image-png (suc (suc (suc zero)))
  digest-b local-path skeleton-bytes

unavailable-raw : I.RawAsset AssetId MediaType Digest Location Payload
unavailable-raw = I.raw-asset skeleton image-png (suc (suc (suc zero)))
  digest-a remote-only skeleton-bytes

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

valid-accepted : IsJust
  (V.validate {digest = payload-digest} {size = payload-size} {Local = Local}
    digest-equality local? valid-raw)
valid-accepted = is-just

wrong-digest-rejected :
  V.validate {digest = payload-digest} {size = payload-size} {Local = Local}
    digest-equality local? wrong-digest-raw ≡ nothing
wrong-digest-rejected = refl

unavailable-rejected :
  V.validate {digest = payload-digest} {size = payload-size} {Local = Local}
    digest-equality local? unavailable-raw ≡ nothing
unavailable-rejected = refl

validated : I.Asset AssetId MediaType Digest Location Payload
  payload-digest payload-size Local
validated = V.certify valid-raw (V.valid refl refl found)

meaning : S.Asset AssetId MediaType Digest Location Payload
  payload-digest payload-size Local
meaning = D.denote validated

identity-preserved = C.asset-id-preserved validated
digest-preserved = C.digest-preserved validated
size-preserved = C.size-preserved validated
location-preserved = C.location-preserved validated
payload-preserved = C.payload-preserved validated
```
