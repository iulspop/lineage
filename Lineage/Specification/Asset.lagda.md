# Durable asset specification

An Asset has stable logical identity while its payload is locally available and
verified against declared byte length and digest. Logical identity is not
identified with the content digest, so corrected bytes can be represented by a
new revision without silently changing references.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.Asset where

open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)

private
  variable
    i m d l p : Level

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
