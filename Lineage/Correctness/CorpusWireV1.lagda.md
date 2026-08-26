# Version-1 wire correspondence

This module states the executable correspondence boundary for the concrete version-1
corpus format.  Unlike the prose obligation catalogue, these obligations are Agda
propositions.  A host decoder/schema/canonicalizer implementation supplies the primitive
witnesses once; the exported theorems then make the consequences available to every
consumer of that implementation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.CorpusWireV1 where

open import Agda.Builtin.List using (List)
open import Agda.Builtin.Maybe using (Maybe; just)
open import Agda.Builtin.String using (String)
open import Agda.Primitive using (Level; lsuc; _⊔_)
open import Data.Product.Base using (_×_)
open import Relation.Binary.PropositionalEquality using (_≡_; cong)
open import Lineage.Specification.CorpusWireV1 using (CorpusDocument)

record V1Correspondence
  {w m : Level}
  (Wire : Set w)
  (Meaning : Set m) : Set (lsuc (w ⊔ m)) where
  field
    decode : Wire → Maybe CorpusDocument
    encode : CorpusDocument → Wire
    canonicalize : CorpusDocument → CorpusDocument
    valid : CorpusDocument → Set
    schemaAccepts : Wire → Set
    diagnostics : Wire → List (String × String)
    archiveClosed : CorpusDocument → Set
    migrate : CorpusDocument → CorpusDocument
    denote : CorpusDocument → Meaning

    decode-sound-witness :
      (wire : Wire) (corpus : CorpusDocument) →
      decode wire ≡ just corpus → valid corpus

    schema-accepts-witness :
      (corpus : CorpusDocument) →
      valid corpus → schemaAccepts (encode corpus)

    decode-encode-witness :
      (corpus : CorpusDocument) →
      decode (encode corpus) ≡ just (canonicalize corpus)

    canonicalize-idempotent-witness :
      (corpus : CorpusDocument) →
      canonicalize (canonicalize corpus) ≡ canonicalize corpus

    encode-canonical-witness :
      (corpus : CorpusDocument) →
      encode (canonicalize corpus) ≡ encode corpus

    migration-preserves-meaning-witness :
      (corpus : CorpusDocument) → denote (migrate corpus) ≡ denote corpus

    valid-archive-closure-witness :
      (corpus : CorpusDocument) → valid corpus → archiveClosed corpus

open V1Correspondence

-- Successful structural decoding cannot manufacture an invalid corpus.
decode-sound :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (wire : Wire) (corpus : CorpusDocument) →
  decode correspondence wire ≡ just corpus → valid correspondence corpus
decode-sound correspondence = decode-sound-witness correspondence

-- Every valid corpus encoding is accepted by the schema generated from the same description.
schema-accepts-encoding :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  valid correspondence corpus → schemaAccepts correspondence (encode correspondence corpus)
schema-accepts-encoding correspondence = schema-accepts-witness correspondence

-- Canonical encoding followed by decoding recovers exactly the canonical wire meaning.
canonical-round-trip :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  decode correspondence (encode correspondence corpus) ≡
    just (canonicalize correspondence corpus)
canonical-round-trip correspondence = decode-encode-witness correspondence

canonicalization-idempotent :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  canonicalize correspondence (canonicalize correspondence corpus) ≡
    canonicalize correspondence corpus
canonicalization-idempotent correspondence =
  canonicalize-idempotent-witness correspondence

-- Diagnostic code/path pairs are stable across canonical re-encoding.
diagnostics-stable-on-canonicalization :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  diagnostics correspondence (encode correspondence (canonicalize correspondence corpus)) ≡
    diagnostics correspondence (encode correspondence corpus)
diagnostics-stable-on-canonicalization correspondence corpus =
  cong (diagnostics correspondence)
    (encode-canonical-witness correspondence corpus)

migration-preserves-denotation :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  denote correspondence (migrate correspondence corpus) ≡ denote correspondence corpus
migration-preserves-denotation correspondence =
  migration-preserves-meaning-witness correspondence

valid-corpus-has-archive-closure :
  ∀ {w m} {Wire : Set w} {Meaning : Set m} →
  (correspondence : V1Correspondence Wire Meaning) →
  (corpus : CorpusDocument) →
  valid correspondence corpus → archiveClosed correspondence corpus
valid-corpus-has-archive-closure correspondence =
  valid-archive-closure-witness correspondence
```
