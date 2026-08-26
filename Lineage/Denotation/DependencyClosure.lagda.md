# Dependency-closure denotation

The denotation forgets executable field names and interprets requirements and
inventory as the simple semantic closure relation.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.DependencyClosure where

open import Level using (Level)
import Lineage.Implementation.DependencyClosure as I
import Lineage.Specification.DependencyClosure as S

private
  variable
    d : Level
    Dependency : Set d

denote : I.Closure Dependency → S.Closure Dependency
denote executable = S.closure
  (I.requirements executable)
  (I.inventory executable)
  (I.closure-complete executable)
```
