# Executable dependency-closure representation

The executable representation stores requirements and local inventory
separately. A proof-free raw value is used at decoding boundaries; certification
adds evidence that every requirement can be resolved locally.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.DependencyClosure where

open import Data.List.Base using (List)
open import Level using (Level)
import Lineage.Specification.DependencyClosure as S

private
  variable
    d : Level

record Closure (Dependency : Set d) : Set d where
  constructor closure
  field
    requirements : List Dependency
    inventory : List Dependency
    closure-complete : S.Complete requirements inventory

open Closure public

record RawClosure (Dependency : Set d) : Set d where
  constructor raw-closure
  field
    requirements : List Dependency
    inventory : List Dependency

open RawClosure public
```
