# Executable corpus manifest

The executable manifest retains stable corpus identity, versioned capability
requirements, integrity metadata, and the complete migration history.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Manifest where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
import Lineage.Implementation.Migration as M
import Lineage.Specification.Capability as C

private
  variable c p e t d i : Level

record Requirement (CapabilityId : Set p) : Set p where
  constructor requirement
  field
    capability-id : CapabilityId
    version : ℕ
    necessity : C.Requirement

record Manifest (CorpusId : Set c) (ProfileId : Set p) (ExtensionId : Set e)
  (Timestamp : Set t) (Digest : Set d) (MigrationId : Set i) :
  Set (c ⊔ p ⊔ e ⊔ t ⊔ d ⊔ i) where
  constructor manifest
  field
    corpus-id : CorpusId
    format-version : ℕ
    created-at updated-at : Timestamp
    profiles : List (Requirement ProfileId)
    extensions : List (Requirement ExtensionId)
    integrity-digest : Digest
    migrations : M.History MigrationId Timestamp Digest
```
