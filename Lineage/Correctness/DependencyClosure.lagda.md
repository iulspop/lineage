# Dependency-closure preservation

Denotation preserves the complete requirement set, local inventory, and the
proof that every required resource is available. Consequently a host cannot
obtain a semantically serveable closure by omitting local dependencies.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.DependencyClosure where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.DependencyClosure as D
import Lineage.Implementation.DependencyClosure as I
import Lineage.Specification.DependencyClosure as S

private
  variable
    d : Level
    Dependency : Set d

requirements-preserved : (executable : I.Closure Dependency) →
  S.required (D.denote executable) ≡ I.requirements executable
requirements-preserved executable = refl

inventory-preserved : (executable : I.Closure Dependency) →
  S.available (D.denote executable) ≡ I.inventory executable
inventory-preserved executable = refl

completeness-preserved : (executable : I.Closure Dependency) →
  S.Complete (S.required (D.denote executable))
    (S.available (D.denote executable))
completeness-preserved executable = S.complete (D.denote executable)
```
