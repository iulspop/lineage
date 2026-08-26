# Cloze preservation

Every primitive cloze observation commutes with denotation. In particular,
target identity survives changes to marker numbering and representation because
it is a first-class value rather than a derived position.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.Cloze where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Cloze as D
import Lineage.Implementation.Cloze as I
import Lineage.Specification.Cloze as S

private
  variable
    i c : Level
    TargetId : Set i
    Content : Set c

target-id-preserved : (value : I.Cloze TargetId Content) →
  S.target-id (D.denote value) ≡ I.target-id value
target-id-preserved value = refl

answers-preserved : (value : I.Cloze TargetId Content) →
  S.answers (D.denote value) ≡ I.answers value
answers-preserved value = refl

hints-preserved : (value : I.Cloze TargetId Content) →
  S.hints (D.denote value) ≡ I.hints value
hints-preserved value = refl

challenge-preserved : (value : I.Cloze TargetId Content) →
  S.challenge (D.denote value) ≡ I.challenge value
challenge-preserved value = refl

resolution-preserved : (value : I.Cloze TargetId Content) →
  S.resolution (D.denote value) ≡ I.resolution value
resolution-preserved value = refl
```
