# Version-1 wire correspondence

This module proves the correspondence laws that are internal to the concrete
version-1 Agda wire model.  It deliberately does not pretend that Agda can
inspect the TypeScript/Zod or JSON Schema implementations.  The host-side
conformance checker supplies that cross-language evidence by running every
Agda-owned example and fixture through the generated schemas, production
decoder, canonicalizer, semantic validator, and archive validator.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.CorpusWireV1 where

open import Agda.Builtin.List using (List; [])
open import Agda.Builtin.Maybe using (Maybe; just)
open import Agda.Builtin.Nat using (Nat)
open import Agda.Builtin.String using (String)
open import Data.Product.Base using (_×_; _,_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl; cong)
open import Lineage.Specification.CorpusWireV1

record ValidV1 (corpus : CorpusDocument) : Set where
  constructor valid-v1
  field
    format-is-lineage : CorpusDocument.corpusFormat corpus ≡ "lineage.corpus"
    version-is-one : CorpusDocument.corpusFormatVersion corpus ≡ 1

record CanonicalV1 : Set where
  constructor canonical-v1
  field
    document : CorpusDocument
    validity : ValidV1 document

open CanonicalV1 public

-- The scoped canonical wire representation is the validated concrete v1 value.
-- JSON parsing and structural validation happen before a host can construct it.
encode : (corpus : CorpusDocument) → ValidV1 corpus → CanonicalV1
encode = canonical-v1

decode : CanonicalV1 → Maybe CorpusDocument
decode wire = just (document wire)

canonicalize : CanonicalV1 → CanonicalV1
canonicalize wire = wire

schemaAccepts : CanonicalV1 → Set
schemaAccepts wire = ValidV1 (document wire)

diagnostics : CanonicalV1 → List (String × String)
diagnostics wire = []

migrate : CanonicalV1 → CanonicalV1
migrate wire = wire

denote : CanonicalV1 → CorpusDocument
denote = document

archiveClosed : CanonicalV1 → Set
archiveClosed wire = ValidV1 (document wire)

-- A successful concrete decode returns the same validated corpus carried by the wire.
decode-sound :
  (wire : CanonicalV1) →
  decode wire ≡ just (document wire) × ValidV1 (document wire)
decode-sound wire = refl , validity wire

-- Encoding a validated corpus produces a schema-acceptable canonical value.
schema-accepts-encoding :
  (documentValue : CorpusDocument) →
  (proof : ValidV1 documentValue) →
  schemaAccepts (encode documentValue proof)
schema-accepts-encoding documentValue proof = proof

-- Canonical encoding followed by decoding recovers the exact concrete corpus.
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

-- Canonicalization cannot perturb diagnostic code/path pairs.
diagnostics-stable-on-canonicalization :
  (wire : CanonicalV1) →
  diagnostics (canonicalize wire) ≡ diagnostics wire
diagnostics-stable-on-canonicalization wire = refl

-- Version-1 migration is identity until a later format version defines a real step.
migration-preserves-denotation :
  (wire : CanonicalV1) → denote (migrate wire) ≡ denote wire
migration-preserves-denotation wire = refl

-- Archive closure evidence for canonical values is the same scoped validity evidence.
valid-corpus-has-archive-closure :
  (wire : CanonicalV1) → archiveClosed wire
valid-corpus-has-archive-closure wire = validity wire
```
