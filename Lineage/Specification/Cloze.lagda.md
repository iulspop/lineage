# Native cloze specification

A cloze denotes an independently scheduled target with a stable identity, one or
more answer fragments, optional hints, and explicit challenge and resolution
views. Identity does not depend on marker numbers, list positions, or wording.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.Cloze where

open import Data.List.Base using (List)
open import Data.List.Membership.Propositional using (_∈_; _∉_)
open import Level using (Level; _⊔_)

private
  variable
    i c : Level

NoAnswerLeak : ∀ {c} {Content : Set c} →
  List Content → List Content → Set c
NoAnswerLeak answers challenge =
  ∀ {answer} → answer ∈ answers → answer ∉ challenge

AnswersDisclosed : ∀ {c} {Content : Set c} →
  List Content → List Content → Set c
AnswersDisclosed answers resolution =
  ∀ {answer} → answer ∈ answers → answer ∈ resolution

record Cloze (TargetId : Set i) (Content : Set c) : Set (i ⊔ c) where
  constructor cloze
  field
    target-id : TargetId
    answers : List Content
    hints : List Content
    challenge : List Content
    resolution : List Content
    no-answer-leak : NoAnswerLeak answers challenge
    answers-disclosed : AnswersDisclosed answers resolution

open Cloze public
```

Several answer fragments may belong to one target and therefore one repetition
stream. Separate independently scheduled deletions require separate target and
Prompt identities.
