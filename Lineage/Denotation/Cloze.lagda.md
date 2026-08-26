# Cloze denotation

Denotation forgets executable representation choices while retaining target
identity, visible content, and the evidence that the disclosure boundary holds.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.Cloze where

open import Level using (Level)
import Lineage.Implementation.Cloze as I
import Lineage.Specification.Cloze as S

private
  variable
    i c : Level
    TargetId : Set i
    Content : Set c

denote : I.Cloze TargetId Content → S.Cloze TargetId Content
denote value = S.cloze
  (I.target-id value)
  (I.answers value)
  (I.hints value)
  (I.challenge value)
  (I.resolution value)
  (I.no-answer-leak value)
  (I.answers-disclosed value)
```
