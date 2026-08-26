# Corpus manifest semantics

The manifest gives the corpus a stable identity and declares the format and
capabilities needed to interpret it. Its recorded format version must agree with
the terminal version of its explicit migration history.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Manifest where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Level using (Level; _⊔_)
import Lineage.Specification.Capability as C
import Lineage.Specification.Migration as M

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
