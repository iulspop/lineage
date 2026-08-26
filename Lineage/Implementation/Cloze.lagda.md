# Executable cloze representation

Decoded cloze values are initially untrusted. A validated executable value keeps
the wire-oriented fields while carrying evidence of the disclosure laws.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.Cloze where

open import Data.List.Base using (List)
open import Level using (Level; _⊔_)
import Lineage.Specification.Cloze as S

private
  variable
    i c : Level

record RawCloze (TargetId : Set i) (Content : Set c) : Set (i ⊔ c) where
  constructor raw-cloze
  field
    target-id : TargetId
    answers : List Content
    hints : List Content
    challenge : List Content
    resolution : List Content

open RawCloze public

record Cloze (TargetId : Set i) (Content : Set c) : Set (i ⊔ c) where
  constructor cloze
  field
    target-id : TargetId
    answers : List Content
    hints : List Content
    challenge : List Content
    resolution : List Content
    no-answer-leak : S.NoAnswerLeak answers challenge
    answers-disclosed : S.AnswersDisclosed answers resolution

open Cloze public
```
