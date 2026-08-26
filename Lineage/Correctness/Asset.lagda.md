# Asset preservation

All durable asset observations commute with denotation, including logical
identity, integrity metadata, local location, and resolved payload.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.Asset where

open import Data.Nat.Base using (ℕ)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Asset as D
import Lineage.Implementation.Asset as I
import Lineage.Specification.Asset as S

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

asset-id-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.asset-id (D.denote value) ≡ I.asset-id value
asset-id-preserved value = refl

media-type-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.media-type (D.denote value) ≡ I.media-type value
media-type-preserved value = refl

digest-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.declared-digest (D.denote value) ≡ I.declared-digest value
digest-preserved value = refl

size-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.declared-size (D.denote value) ≡ I.declared-size value
size-preserved value = refl

location-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.location (D.denote value) ≡ I.location value
location-preserved value = refl

payload-preserved :
  (value : I.Asset AssetId MediaType Digest Location Payload digest size Local) →
  S.payload (D.denote value) ≡ I.payload value
payload-preserved value = refl
```
