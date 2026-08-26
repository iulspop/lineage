# Format-description interpretations

This module makes the generated AI-authoring artifacts explicit interpretations of the
shared `FormatDescription`, rather than independent descriptions of Lineage.  The host
renderer is responsible only for textual syntax (Markdown, JSON Schema, and TypeScript).
The selection and ordering of entities, fields, diagnostics, artifacts, and proof
obligations comes from these total Agda functions.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.FormatInterpretation where

open import Agda.Builtin.List using (List; []; _∷_)
open import Agda.Builtin.String using (String)
open import Lineage.Specification.FormatDescription

infixr 5 _++_
_++_ : ∀ {A : Set} → List A → List A → List A
[]       ++ ys = ys
(x ∷ xs) ++ ys = x ∷ (xs ++ ys)

record ArtifactPlan : Set where
  constructor artifact
  field
    path        : String
    audience    : String
    description : String

open ArtifactPlan public

map : ∀ {A B : Set} → (A → B) → List A → List B
map f []       = []
map f (x ∷ xs) = f x ∷ map f xs

objectNames : FormatDescription → List String
objectNames description = map ObjectDescription.name (FormatDescription.objects description)

fieldNames : ObjectDescription → List String
fieldNames description = map Field.name (ObjectDescription.fields description)

ruleCodes : FormatDescription → List String
ruleCodes description = map Rule.code (FormatDescription.rules description)

specificationPlans : List ArtifactPlan
specificationPlans =
  artifact "spec/lineage-ai-brief.md" "generating model" "Compact constraints and candidate protocol."
  ∷ artifact "spec/lineage-ai-authoring.md" "authoring system" "Complete field and validation guidance."
  ∷ artifact "spec/lineage-ai-full.md" "implementer" "Addressable reference for every described entity and obligation."
  ∷ []

schemaPlans : List ArtifactPlan
schemaPlans =
  artifact "schema/lineage-corpus.schema.json" "structural validator" "Corpus document structural schema."
  ∷ artifact "schema/lineage-manifest.schema.json" "archive validator" "Portable archive manifest structural schema."
  ∷ []

hostPlans : List ArtifactPlan
hostPlans =
  artifact "types/lineage-corpus.ts" "TypeScript host" "Types generated from the described wire entities."
  ∷ artifact "format-description.json" "all interpreters" "Machine-readable exported Agda description."
  ∷ []

examplePlans : List ArtifactPlan
examplePlans =
  artifact "examples/basic.json" "author" "Basic self-check corpus."
  ∷ artifact "examples/cloze.json" "author" "Stable cloze target corpus."
  ∷ artifact "examples/image-occlusion.json" "author" "Stable occlusion region corpus."
  ∷ artifact "examples/media.json" "host boundary" "Media corpus requiring host integrity materialization."
  ∷ []

artifactPlans : FormatDescription → List ArtifactPlan
artifactPlans description =
  specificationPlans ++ schemaPlans ++ hostPlans ++ examplePlans

record CorrespondenceObligations : Set where
  constructor obligations
  field
    decoder-soundness                  : String
    schema-accepts-valid-encodings     : String
    canonical-decode-encode-round-trip : String
    canonicalization-idempotence       : String
    migration-preserves-meaning        : String
    diagnostics-stable                 : String
    archive-closure                    : String

v1Obligations : CorrespondenceObligations
v1Obligations = obligations
  "Every successful decode denotes a well-shaped v1 wire value."
  "Every canonical valid encoding is accepted by the generated schema."
  "Decoding a canonical encoding recovers the canonical wire value."
  "Canonicalizing an already canonical value changes nothing."
  "A declared forward migration preserves corpus meaning."
  "Stable diagnostic code and path pairs are regression fixtures."
  "Every required dependency is declared, present, bounded, and digest-correct."
```
