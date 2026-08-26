# Format-description algebra

The format description is the authoritative, machine-readable description of the
versioned wire boundary. Schema, prose, host types, fixtures, decoder plans, and
stable diagnostics are interpretations of this value rather than independently
maintained descriptions.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.FormatDescription where

open import Data.List.Base using (List; [])
open import Data.Nat.Base using (ℕ)
open import Data.String.Base using (String)

data Requirement : Set where
  required optional : Requirement

data Scalar : Set where
  text natural integer boolean timestamp normalizedCoordinate : Scalar

data Constraint : Set where
  nonEmpty : Constraint
  minimum : ℕ → Constraint
  maximum : ℕ → Constraint
  minItems : ℕ → Constraint
  maxItems : ℕ → Constraint
  uniqueItems : Constraint
  regexPattern : String → Constraint
  semanticFormat : String → Constraint
  requiresWhen : String → String → Constraint
  forbidsWhen : String → String → Constraint
  resolvesTo : String → Constraint

data DefaultValue : Set where
  noDefault : DefaultValue
  defaultLiteral : String → DefaultValue
  defaultEmptyArray : DefaultValue

data Shape : Set where
  scalar : Scalar → Shape
  literal : String → Shape
  array : Shape → Shape
  objectRef : String → Shape
  reference : String → Shape
  enumeration : List String → Shape
  alternatives : List Shape → Shape
  taggedChoice : String → List String → Shape
  nullable : Shape → Shape

choice : List String → Shape
choice = enumeration

record Field : Set where
  constructor fieldDescription
  field
    name : String
    requirement : Requirement
    shape : Shape
    constraints : List Constraint
    defaultValue : DefaultValue
    summary : String
    explanation : String

open Field public

describeField : String → Requirement → Shape → String → String → Field
describeField name requirement shape summary explanation =
  fieldDescription name requirement shape [] noDefault summary explanation

describeDefaultedField : String → Requirement → Shape → DefaultValue → String → String → Field
describeDefaultedField name requirement shape defaultValue summary explanation =
  fieldDescription name requirement shape Data.List.Base.[] defaultValue summary explanation

describeConstrainedField : String → Requirement → Shape → List Constraint → DefaultValue → String → String → Field
describeConstrainedField = fieldDescription

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
    roots : List String
    objects : List ObjectDescription
    rules : List Rule
    examples : List ExampleDescription

open FormatDescription public
```
