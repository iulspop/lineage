# Format-description algebra

The format description is a machine-readable source for host schemas, AI authoring
specifications, generated types, examples, and diagnostic documentation. It
intentionally describes the versioned wire boundary rather than the richer
semantic model.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.FormatDescription where

open import Data.List.Base using (List)
open import Data.Nat.Base using (ℕ)
open import Data.String.Base using (String)

data Requirement : Set where
  required optional : Requirement

data Scalar : Set where
  text natural boolean : Scalar

data Shape : Set where
  scalar : Scalar → Shape
  literal : String → Shape
  array : String → Shape
  reference : String → Shape
  choice : List String → Shape

record Field : Set where
  constructor describeField
  field
    name : String
    requirement : Requirement
    shape : Shape
    summary : String
    explanation : String

open Field public

record ObjectDescription : Set where
  constructor object
  field
    name : String
    summary : String
    fields : List Field

open ObjectDescription public

data Severity : Set where
  error warning information : Severity

record Rule : Set where
  constructor rule
  field
    code : String
    severity : Severity
    summary : String
    explanation : String
    appliesTo : String

open Rule public

record ExampleDescription : Set where
  constructor example
  field
    fileName : String
    summary : String
    kind : String

open ExampleDescription public

record FormatDescription : Set where
  constructor format
  field
    formatName : String
    version : ℕ
    summary : String
    objects : List ObjectDescription
    rules : List Rule
    examples : List ExampleDescription

open FormatDescription public
```
