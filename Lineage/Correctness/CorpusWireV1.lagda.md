# Version-1 wire correspondence

This module proves the correspondence laws internal to the concrete version-1
Agda wire model and validator. It does not claim that Agda can inspect the
TypeScript/Zod decoder, generated JSON Schema, or host archive implementation.
The executable cross-language checker supplies that evidence by running every
Agda-owned example and fixture through those boundaries.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.CorpusWireV1 where

open import Agda.Builtin.List using (List; [])
open import Agda.Builtin.Maybe using (Maybe; just)
open import Data.Product.Base using (_×_; _,_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Lineage.Specification.CorpusWireV1
open import Lineage.Validation.Diagnostic using (Diagnostic)
import Lineage.Validation.CorpusWireV1 as Validation

record StructurallyV1 (corpus : CorpusDocument) : Set where
  constructor structurally-v1
  field
    format-is-lineage : CorpusDocument.corpusFormat corpus ≡ "lineage.corpus"
    version-is-one : CorpusDocument.corpusFormatVersion corpus ≡ 1

record ValidV1 (corpus : CorpusDocument) : Set where
  constructor valid-v1
  field
    structural : StructurallyV1 corpus
    diagnostics-empty : Validation.validateCorpus corpus ≡ []

record CanonicalV1 : Set where
  constructor canonical-v1
  field
    document : CorpusDocument
    validity : ValidV1 document

open CanonicalV1 public
open ValidV1 public

-- The scoped canonical wire representation is a concrete corpus together with
-- evidence that the authoritative semantic validator emitted no diagnostics.
-- JSON parsing and structural decoding happen before a host can construct it.
encode : (corpus : CorpusDocument) → ValidV1 corpus → CanonicalV1
encode = canonical-v1

decode : CanonicalV1 → Maybe CorpusDocument
decode wire = just (document wire)

canonicalize : CanonicalV1 → CanonicalV1
canonicalize wire = wire

schemaAccepts : CanonicalV1 → Set
schemaAccepts wire = StructurallyV1 (document wire)

diagnostics : CanonicalV1 → List Diagnostic
diagnostics wire = Validation.validateCorpus (document wire)

-- Version 1 has no format-changing migration step. Future migration modules must
-- replace this scoped identity with an explicit source/target transformation.
migrateV1 : CanonicalV1 → CanonicalV1
migrateV1 wire = wire

denote : CanonicalV1 → CorpusDocument
denote = document

-- A successful concrete decode returns the exact corpus carrying evidence that
-- the authoritative semantic validator accepts it.
decode-sound :
  (wire : CanonicalV1) →
  (decode wire ≡ just (document wire)) ×
  (Validation.validateCorpus (document wire) ≡ [])
decode-sound wire = refl , diagnostics-empty (validity wire)

-- Encoding a semantically valid corpus produces a structurally schema-eligible
-- canonical value. Cross-language tests establish acceptance by the generated
-- JSON Schema and production decoder for every Agda-owned conformance value.
schema-accepts-encoding :
  (documentValue : CorpusDocument) →
  (proof : ValidV1 documentValue) →
  schemaAccepts (encode documentValue proof)
schema-accepts-encoding documentValue proof = structural proof

canonical-round-trip :
  (documentValue : CorpusDocument) →
  (proof : ValidV1 documentValue) →
  decode (encode documentValue proof) ≡ just documentValue
canonical-round-trip documentValue proof = refl

canonicalization-idempotent :
  (wire : CanonicalV1) → canonicalize (canonicalize wire) ≡ canonicalize wire
canonicalization-idempotent wire = refl

encode-canonical :
  (wire : CanonicalV1) → canonicalize wire ≡ wire
encode-canonical wire = refl

-- Canonicalization preserves the real diagnostic list, not a placeholder model.
diagnostics-stable-on-canonicalization :
  (wire : CanonicalV1) →
  diagnostics (canonicalize wire) ≡ diagnostics wire
diagnostics-stable-on-canonicalization wire = refl

valid-corpus-has-no-diagnostics :
  (wire : CanonicalV1) → diagnostics wire ≡ []
valid-corpus-has-no-diagnostics wire = diagnostics-empty (validity wire)

-- The only migration available inside the version-1 scope is identity, so its
-- concrete denotation is preserved definitionally.
v1-migration-preserves-denotation :
  (wire : CanonicalV1) → denote (migrateV1 wire) ≡ denote wire
v1-migration-preserves-denotation wire = refl
```
