# Asset denotation

Denotation preserves the verified local payload and forgets only the mechanics
by which its validation certificate was obtained.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.Asset where

open import Data.Nat.Base using (ℕ)
open import Level using (Level)
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

denote : I.Asset AssetId MediaType Digest Location Payload digest size Local →
  S.Asset AssetId MediaType Digest Location Payload digest size Local
denote value = S.asset
  (I.asset-id value) (I.media-type value) (I.declared-size value)
  (I.declared-digest value) (I.location value) (I.payload value)
  (I.size-valid value) (I.digest-valid value) (I.locally-available value)
```
