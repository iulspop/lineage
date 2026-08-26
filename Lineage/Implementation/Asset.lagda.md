# Executable asset representation

Raw assets contain decoded metadata plus resolved local payload bytes. Validated
assets carry evidence that location, length, and digest agree with that payload.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.Asset where

open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)

private
  variable
    i m d l p : Level

record RawAsset (AssetId : Set i) (MediaType : Set m) (Digest : Set d)
  (Location : Set l) (Payload : Set p) : Set (i ⊔ m ⊔ d ⊔ l ⊔ p) where
  constructor raw-asset
  field
    asset-id : AssetId
    media-type : MediaType
    declared-size : ℕ
    declared-digest : Digest
    location : Location
    payload : Payload
open RawAsset public

record Asset (AssetId : Set i) (MediaType : Set m) (Digest : Set d)
  (Location : Set l) (Payload : Set p)
  (digest : Payload → Digest) (size : Payload → ℕ)
  (Local : Location → Payload → Set) :
  Set (i ⊔ m ⊔ d ⊔ l ⊔ p) where
  constructor asset
  field
    asset-id : AssetId
    media-type : MediaType
    declared-size : ℕ
    declared-digest : Digest
    location : Location
    payload : Payload
    size-valid : declared-size ≡ size payload
    digest-valid : declared-digest ≡ digest payload
    locally-available : Local location payload
open Asset public
```
