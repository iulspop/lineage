# Stable validation diagnostics

Diagnostics are durable host-facing vocabulary. Codes are stable identifiers;
messages may improve without changing repair behavior. Paths use JSON Pointer so
a host or AI repair loop can localize changes without rewriting unrelated data.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Diagnostic where

open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe)
open import Data.String.Base using (String)
open import Lineage.Specification.FormatDescription using (Severity)

record Diagnostic : Set where
  constructor diagnostic
  field
    code : String
    severity : Severity
    path : String
    message : String
    relatedPath : Maybe String

open Diagnostic public

record ValidationResult (A : Set) : Set where
  constructor validationResult
  field
    value : Maybe A
    diagnostics : List Diagnostic

open ValidationResult public
```
