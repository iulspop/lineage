# Asset validation

Validation compares declared metadata with the resolved payload and requires a
decidable proof that the payload is available at the declared local location.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.Asset where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (ℕ)
open import Data.Nat.Properties using (_≟_)
open import Level using (Level; _⊔_)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_)
open import Relation.Nullary.Decidable using (Dec; yes; no)

import Lineage.Implementation.Asset as I

private
  variable
    i m d l p : Level
    AssetId : Set i
    MediaType : Set m
    Digest : Set d
    Location : Set l
    Payload : Set p
    digest : Payload → Digest
    size : Payload → ℕ
    Local : Location → Payload → Set

record Valid {i m d l p} {AssetId : Set i} {MediaType : Set m}
  {Digest : Set d} {Location : Set l} {Payload : Set p}
  {digest : Payload → Digest} {size : Payload → ℕ}
  {Local : Location → Payload → Set}
  (raw : I.RawAsset AssetId MediaType Digest Location Payload) :
  Set (i ⊔ m ⊔ d ⊔ l ⊔ p) where
  constructor valid
  field
    size-valid : I.declared-size raw ≡ size (I.payload raw)
    digest-valid : I.declared-digest raw ≡ digest (I.payload raw)
    locally-available : Local (I.location raw) (I.payload raw)
open Valid public

valid? : {digest : Payload → Digest} {size : Payload → ℕ}
  {Local : Location → Payload → Set} → DecidableEquality Digest →
  ((location : Location) → (payload : Payload) → Dec (Local location payload)) →
  (raw : I.RawAsset AssetId MediaType Digest Location Payload) →
  Dec (Valid {digest = digest} {size = size} {Local = Local} raw)
valid? {digest = digest} {size = size} {Local = Local}
  digest-equality local? raw with I.declared-size raw ≟ size (I.payload raw)
... | no wrong-size = no λ certificate → wrong-size (size-valid certificate)
... | yes correct-size with digest-equality (I.declared-digest raw) (digest (I.payload raw))
...   | no wrong-digest = no λ certificate → wrong-digest (digest-valid certificate)
...   | yes correct-digest with local? (I.location raw) (I.payload raw)
...     | no unavailable = no λ certificate → unavailable (locally-available certificate)
...     | yes available = yes (valid correct-size correct-digest available)

certify : {digest : Payload → Digest} {size : Payload → ℕ}
  {Local : Location → Payload → Set} →
  (raw : I.RawAsset AssetId MediaType Digest Location Payload) →
  Valid {digest = digest} {size = size} {Local = Local} raw →
  I.Asset AssetId MediaType Digest Location Payload digest size Local
certify {digest = digest} {size = size} {Local = Local} raw certificate = I.asset
  (I.asset-id raw) (I.media-type raw) (I.declared-size raw)
  (I.declared-digest raw) (I.location raw) (I.payload raw)
  (size-valid certificate) (digest-valid certificate)
  (locally-available certificate)

validate : {digest : Payload → Digest} {size : Payload → ℕ}
  {Local : Location → Payload → Set} → DecidableEquality Digest →
  ((location : Location) → (payload : Payload) → Dec (Local location payload)) →
  I.RawAsset AssetId MediaType Digest Location Payload →
  Maybe (I.Asset AssetId MediaType Digest Location Payload digest size Local)
validate {digest = digest} {size = size} {Local = Local}
  digest-equality local? raw with valid? digest-equality local? raw
... | yes certificate = just (certify raw certificate)
... | no _ = nothing
```
