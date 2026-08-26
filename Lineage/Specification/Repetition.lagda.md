# Repetition specification

A repetition is a durable factual observation of one review. It identifies the
exact prompt revision served and records the learner interaction independently
of replaceable current scheduling state.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.Repetition where

open import Data.Maybe.Base using (Maybe)
open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level)

record Vocabulary (ℓ : Level) : Set (Level.suc ℓ) where
  field
    RepetitionId PromptId Timestamp Duration Response Assessment Digest : Set ℓ

open Vocabulary public

record Repetition {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor repetition
  field
    repetition-id : Vocabulary.RepetitionId V
    prompt-id : Vocabulary.PromptId V
    revision-index : ℕ
    presentation-digest : Maybe (Vocabulary.Digest V)
    reviewed-at : Vocabulary.Timestamp V
    duration : Maybe (Vocabulary.Duration V)
    response : Vocabulary.Response V
    assessment : Vocabulary.Assessment V

  prompt-revision : ℕ
  prompt-revision = suc revision-index

open Repetition public
```

Revisions are one-based by construction. Scheduler identity, historical
intervals, provenance, and correction events will extend this factual kernel;
current due state, stability, and difficulty do not belong in it.
