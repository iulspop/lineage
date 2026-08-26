# Prompt specification

A Prompt is the stable identity of one independently scheduled recall stream. A
Prompt revision is an immutable semantic snapshot of that stream's review
contract. Ordinary edits advance the revision while preserving identity;
meaning-changing splits or merges require new identities.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.Prompt where

open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level; _⊔_)
import Lineage.Specification.ReviewContract as Review

private
  variable
    p c r : Level

record Vocabulary (p c r : Level) : Set (Level.suc (p ⊔ c ⊔ r)) where
  field
    PromptId : Set p
    Content : Set c
    Response : Set r

open Vocabulary public

data Status : Set where
  active suspended retired : Status

record PromptRevision {p c r : Level} (V : Vocabulary p c r) : Set (p ⊔ c ⊔ r) where
  constructor prompt-revision
  field
    prompt-id : PromptId V
    revision-index : ℕ
    status : Status
    contract : Review.Contract (Content V) (Response V)

  revision : ℕ
  revision = suc revision-index

open PromptRevision public
```

Revision numbers are one-based by construction. The semantic value is a
snapshot; retaining, delta-encoding, and indexing snapshots are implementation
choices, but repetitions must continue to identify the snapshot actually served.
