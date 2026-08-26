# Prompt dependency-closure specification

A serveable Prompt revision denotes a finite set of required durable resources
and a locally available set that contains every requirement. Resource kinds and
identifiers are semantic parameters: sources, materials, assets, regions,
presentation profiles, and required extensions can share this algebra without
being collapsed into one wire representation.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.DependencyClosure where

open import Data.List.Base using (List)
open import Data.List.Membership.Propositional using (_∈_)
open import Level using (Level)

private
  variable
    d : Level
    Dependency : Set d

Complete : ∀ {d} {Dependency : Set d} →
  List Dependency → List Dependency → Set d
Complete required available =
  ∀ {dependency} → dependency ∈ required → dependency ∈ available

record Closure (Dependency : Set d) : Set d where
  constructor closure
  field
    required : List Dependency
    available : List Dependency
    complete : Complete required available

open Closure public
```

Completeness is semantic availability, not merely a path existing in one
application database. A conforming export must carry enough local data for each
available dependency to be interpreted without a mandatory network service.
