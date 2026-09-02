# Lineage Implementation Methodology

> How Lineage will use denotational design, literate Agda, dependent types, and proved homomorphisms to connect a simple specification to an efficient executable implementation.

## Status

This document records the intended philosophy and method for implementing Lineage. It is a methodological guide rather than the Lineage format specification itself.

The terminology, module boundaries, and examples are provisional. They should evolve as the semantic design becomes clearer. The central commitments—simple denotations, compositionality, separate semantic and implementation representations, and machine-checked preservation proofs—are intended to remain stable.

This document complements:

* `vision.md`, which describes what Lineage is for;
* `data-structure.md`, which inventories current requirements and logical design ideas;
* the future literate Agda specification, which will define Lineage precisely.

---

# 1. Purpose

Lineage is intended to preserve a person's prompts and repetition history over decades. Its durable corpus must remain meaningful beyond any current application, scheduler, storage engine, or programming language.

That goal requires more than a strongly typed implementation and more than a prose format document. We want a compositional triad:

```text
simple mathematical specification
              │
              │ denotation
              ▼
efficient executable implementation
              │
              │ machine-checked homomorphism proofs
              ▼
       preserved meaning
```

More precisely, Lineage will contain:

1. **A specification** describing the mathematical meaning of Lineage values and operations.
2. **An implementation** designed for validation, persistence, migration, rendering, scheduling, and interoperability.
3. **A denotation** mapping implementation values into the semantic domain.
4. **Correctness proofs** showing that implementation operations preserve their specified meanings.
5. **Compiled interfaces** through which TypeScript and other host languages can execute the proved core without reimplementing its semantics.

The objective is not to prove that one large program “works” after it has been independently designed. The objective is to derive implementation operations from semantic equations so that correctness guides construction from the beginning.

---

# 2. Influences and terminology

This methodology follows the denotational-design approach associated with Conal Elliott:

* seek the simplest precise mathematical meaning first;
* choose meanings that compose;
* give both specification and implementation a shared algebraic vocabulary;
* derive implementation operations by solving homomorphism equations;
* use proofs to expose missing assumptions and design mistakes;
* transfer laws from the simple semantic domain to the efficient representation.

Representative patterns appear in projects such as `felix`, `equation-transfer`, and smaller Agda developments that contrast a simple specification with an optimized representation.

In this document, **denotational design** does not mean merely assigning a function called `meaning` to a pre-existing data structure. It means allowing the desired mathematical meaning and its compositional structure to guide the choice of operations, representations, laws, and implementation algorithms.

## 2.1 Specification

A **specification** is a simple mathematical account of what Lineage values and operations mean.

A specification should favor:

* clarity over storage efficiency;
* mathematical structure over field-by-field description;
* extensional meaning over execution history;
* compositional definitions over global procedures;
* laws that state observable behavior.

The specification is not automatically correct merely because it is written in Agda. It must remain small enough to inspect, explain, criticize, and compare with the product's intended meaning.

## 2.2 Implementation

An **implementation** is an executable representation and its operations. It may use indexing, normalization, chunking, cached summaries, compact encodings, incremental folds, or other structures needed for practical performance.

Implementation types are not the specification. Their accidental details must not define Lineage semantics.

## 2.3 Denotation

A **denotation** maps an implementation value to its mathematical meaning.

Conceptually:

```agda
⟦_⟧ : Implementation → Meaning
```

Two implementation values may differ internally while denoting the same meaning. This distinction is essential for:

* canonicalization;
* migrations;
* alternate physical encodings;
* indexes and caches;
* Anki interoperability;
* future implementation replacement.

## 2.4 Homomorphism

A denotation is **homomorphic** when it preserves the operations shared by the implementation and semantic domains.

For example:

```agda
⟦ empty ⟧                    ≈ semanticEmpty
⟦ insertPrompt p corpus ⟧    ≈ semanticInsert ⟦ p ⟧ ⟦ corpus ⟧
⟦ appendRepetition r corpus ⟧ ≈ semanticAppend ⟦ r ⟧ ⟦ corpus ⟧
```

These are not examples of conventional unit tests. They are universally quantified propositions proved by Agda for all values admitted by the relevant types.

## 2.5 Law transfer

If:

1. the semantic domain satisfies a law;
2. the denotation preserves the operations used by that law; and
3. implementation equivalence is defined appropriately through denotation;

then the corresponding implementation law can be derived rather than reproved from low-level details each time.

This is the role of equation transfer: semantic reasoning happens in the simplest domain, while the result applies to the efficient representation.

---

# 3. Fundamental commitments

## 3.1 Meaning precedes representation

We will not begin by translating the records in `data-structure.md` directly into Agda records.

`data-structure.md` is a requirements and design inventory. It identifies durable concepts such as Prompts, Repetitions, revisions, assets, provenance, and review contracts. It does not yet establish the simplest mathematical meaning of those concepts.

Before committing to wire formats or implementation records, we will ask:

* What does a Prompt mean?
* What observations distinguish two Prompts?
* What does a corpus mean independently of storage order?
* What does repetition history mean?
* What does it mean for a migration to preserve a corpus?
* What is the semantic content of cloze deletion and image occlusion?
* Which scheduler facts are durable observations and which are derived interpretations?

## 3.2 Specification and implementation remain distinct

Both worlds may be written in the same language and repository, but they must remain conceptually and structurally separate.

```text
Semantic representation
├── simple
├── extensional
├── law-oriented
└── not optimized for persistence

Implementation representation
├── executable
├── storage-aware
├── validation-aware
├── performance-conscious
└── allowed to contain redundant derived structure
```

Using Agda for both does not justify collapsing them into one type.

## 3.3 Composition is the default

The meaning of a compound Lineage value should be determined from the meanings of its parts.

A definition that requires examining the entire corpus, replaying an application session, or consulting hidden global state is suspect. Some whole-corpus properties are unavoidable, but primitive meanings and operations should compose wherever possible.

Composition gives Lineage:

* local reasoning;
* reusable proofs;
* incremental algorithms;
* tractable migrations;
* parallel and streaming possibilities;
* clearer extension boundaries.

## 3.4 Proof tractability is a design constraint

If a seemingly simple operation repeatedly produces enormous or brittle proofs, we should question the operation, representation, equality, or semantic domain before adding tactics or proof automation.

Proof difficulty can reveal:

* an omitted algebraic law;
* a representation exposing irrelevant distinctions;
* an operation that is not compositional;
* an equality that is too intensional;
* an implementation invented independently of its specification;
* a semantic domain that is more operational than necessary.

The answer is often to improve the design rather than overpower the proof assistant.

## 3.5 Invalid durable states should be difficult or impossible to construct

Dependent and indexed types should encode stable, high-value invariants where doing so simplifies downstream reasoning.

Candidate examples include:

* a Repetition refers to an existing Prompt identity and served revision;
* a cloze target refers to a valid stable material node;
* an image occlusion refers to an image asset and valid normalized region;
* disclosed content cannot appear in the challenge's accessible representation;
* migration steps connect declared source and destination versions;
* a canonical corpus has no duplicate stable identities;
* required dependency closure is present before a review contract is considered serveable.

Not every validation rule belongs in an index. Boundary decoders still need to explain malformed external input rather than require callers to construct proofs.

## 3.6 Totality is the norm

The pure Lineage core should use total functions. Partial external input is represented explicitly:

```agda
Decode : Bytes → Result DecodeError ValidatedValue
```

Failures should be data, not exceptions hidden inside supposedly pure operations.

## 3.7 Effects remain outside the semantic core

The pure core must not directly depend on:

* the DOM;
* browser storage;
* filesystem APIs;
* HTTP;
* clocks;
* randomness;
* worker lifecycle;
* application routing;
* a particular database;
* a particular AI provider.

Effects are supplied by thin host-language boundaries. Any time-dependent or random decision must receive its inputs explicitly if it affects durable meaning.

---

# 4. The compositional triad

The core unit of development is not a file, record, or feature. It is a semantic operation connected to an executable operation by a proved commuting diagram.

For each operation, we want:

```text
Implementation input ── implementation operation ──▶ Implementation output
        │                                               │
        │ denote                                        │ denote
        ▼                                               ▼
 Semantic input     ───── semantic operation ───────▶ Semantic output
```

The diagram commutes when:

```text
denote (implementationOperation x)
=
semanticOperation (denote x)
```

For binary or indexed operations, all inputs and indices participate in the equation.

## 4.1 Shared algebraic vocabulary

A Lineage subsystem should expose a small set of meaningful primitive operations. For example, a history algebra might include:

```text
empty history
singleton repetition
append histories
observe repetitions for a Prompt
fold historical observations
```

The semantic domain and implementation representation each interpret these operations. The denotation preserves them.

We should avoid APIs that expose implementation mechanics without corresponding semantic meaning, such as “mutate bucket 7” or “rebuild offset table.” Such functions may exist privately, but public core operations should be justified by the algebra.

## 4.2 Deriving operations

Given a desired semantic operation `f` and a denotation `⟦_⟧`, the implementation operation `fᵢ` is chosen to satisfy:

```agda
⟦ fᵢ x ⟧ ≈ f ⟦ x ⟧
```

We then calculate or derive `fᵢ` using the structure of the implementation representation. Performance considerations influence which representation and derivation we choose, but not the meaning of `f`.

## 4.3 Equivalence

Agda's propositional equality is not always the correct notion of semantic equality.

Lineage will likely need several explicit equivalences:

* semantic equality of Prompts;
* equality of ordered repetition histories;
* corpus equality independent of physical record order;
* presentation equivalence under a declared profile;
* migration preservation;
* interoperability equivalence, possibly parameterized by known losses;
* observational equivalence of enhanced and canonical representations.

These equivalences must be named and documented. We must not silently substitute byte equality, record equality, or renderer-specific equality for semantic equality.

---

# 5. Candidate Lineage algebras

The final decomposition must emerge from semantic exploration. The following are starting hypotheses, not predetermined module boundaries.

## 5.1 Review-contract algebra

Possible semantic concerns:

* challenge;
* disclosure boundary;
* response interaction;
* resolution;
* dependency closure;
* accessibility-preserving presentation.

Important laws may include:

* composition does not disclose withheld information before resolution;
* canonical rendering preserves reading order and disclosure boundaries;
* material substitution respects stable references;
* resolving a review exposes the required resolution content;
* a serveable contract has a complete local dependency closure.

## 5.2 Corpus algebra

Possible operations:

* empty corpus;
* add or revise a Prompt;
* add an Asset or Source;
* relate durable entities;
* combine compatible corpus fragments;
* project the dependency closure of a Prompt;
* validate global identity constraints.

Questions to resolve include whether corpus composition is a partial operation, a validated merge, or an algebra over conflict-bearing values.

## 5.3 Repetition-history algebra

Possible operations:

* empty history;
* append a factual repetition;
* filter/project by Prompt identity;
* order by durable event identity and time semantics;
* fold into scheduler observations;
* retain corrections without rewriting history.

The semantic model should preserve what happened while allowing scheduler state to be recomputed.

## 5.4 Migration algebra

A migration should not merely transform bytes. It should have a declared semantic preservation condition.

For a migration from implementation version `A` to `B`:

```agda
migrate : Impl A → Result MigrationError (Impl B)

preserves :
  ∀ x → Successful (migrate x) →
  ⟦ migrated x ⟧B ≈ ⟦ x ⟧A
```

When a migration intentionally changes meaning, that change must be modeled explicitly rather than hidden under a preservation claim.

## 5.5 Codec and canonicalization algebra

Encoding and decoding should satisfy laws appropriate to their domains:

```text
decode (encode validValue) = success validValue
encode (canonicalize value) = canonical bytes
canonicalize (canonicalize value) = canonicalize value
```

If implementation values contain irrelevant distinctions, round trips may preserve denotation rather than intensional record identity. The exact law must be stated deliberately.

## 5.6 Interoperability algebra

Anki import and export require more than parser tests. We need explicit semantic projections and preservation statements.

Examples:

* importing an Anki review history preserves the factual sequence of reviews;
* exporting and reimporting a Lineage-compatible subset preserves its Lineage denotation;
* unsupported Anki behavior produces declared compatibility artifacts or explicit losses;
* preserved original HTML, CSS, JavaScript, fields, and templates remain provenance rather than the sole canonical meaning.

Lossy transformations should return a structured loss report whose semantics are part of the operation.

## 5.7 Scheduling algebra

The durable corpus does not derive its meaning from one scheduler. Scheduling operations consume semantic repetition observations and produce replaceable derived state.

A scheduler adapter should make explicit:

* which historical observations it consumes;
* scheduler parameters and version;
* any normalization performed;
* the derived state it produces;
* what is and is not written back as a durable fact.

The initial implementation should integrate with the Open Spaced Repetition ecosystem while keeping scheduler-specific semantics outside the identity of the corpus.

## 5.8 General learning-planning algebra

Lineage generalizes scheduling without weakening Prompt review semantics. A **learning target** is an exact reference to a Prompt, Source, or Material revision, a stable revision-bound reading segment, a Collection, or an authored concept. A **learning activity** is an ephemeral instruction such as recall, practice, reading, or lesson progression. A **learning observation** is an append-only factual event; mastery, due state, reading position, and session order are derived projections.

The formal boundary is split compositionally:

* `LearningTarget` specifies stable heterogeneous references;
* `LearningEvidence` embeds existing Repetitions losslessly and adds factual non-recall observations;
* `Planning` selects only eligible authored candidates and carries explicit budget proofs, rationales, policy identities, and tie-break input;
* executable evidence histories may be newest-first, but their denotation and folds are chronological;
* deterministic planning means the same explicit corpus, evidence, policy versions, objective, time, budget, and seed denote the same plan.

Prompt recall continues through the proved `ReviewContract` disclosure state machine. Reading and lesson activities never masquerade as reviews, policy scores never become durable corpus truth, and version-one planners do not invent content or prerequisites.

---

# 6. Literate Agda

Lineage will use **literate Agda in Markdown**, normally in files ending with `.lagda.md`.

A literate Agda file is simultaneously:

1. a readable Markdown chapter;
2. a type-checked Agda module;
3. an executable or compilable source file;
4. a machine-checked proof artifact.

This supports Lineage's need for a specification that humans can study and machines can check.

## 6.1 Basic form

Ordinary Markdown explains the design. Agda checks fenced code blocks labeled `agda`.

````markdown
# Repetition histories

A repetition history records factual review observations in durable order.

```agda
module Lineage.Specification.History where

open import Data.List using (List; []; _∷_; _++_)

History : Set
History = List Repetition
```

Appending histories is associative.

```agda
append-associative :
  ∀ xs ys zs → (xs ++ ys) ++ zs ≡ xs ++ (ys ++ zs)
append-associative = List.++-assoc
```
````

The surrounding prose is not ignored documentation added after implementation. It should explain:

* the semantic question;
* why the chosen domain is simple;
* what observations matter;
* definitions and laws;
* alternatives rejected;
* assumptions and limitations;
* the relation to Lineage requirements.

## 6.2 Prose and code have different responsibilities

Normative mathematical claims should be represented as Agda definitions or propositions whenever practical. Prose explains their intention and scope.

For example, prose may say:

> Appending a Repetition must not change the meanings of earlier Repetitions.

The Agda development must then define enough semantics for a precise preservation theorem. The prose alone is not the proof, and the proof alone is not an adequate explanation of why the theorem matters.

## 6.3 Literate files are first-class source

We should not maintain separate, manually synchronized `.md` and `.agda` versions of the same chapter. The `.lagda.md` file is the source.

Generated HTML, PDFs, API declarations, test vectors, or diagrams are derived artifacts.

## 6.4 Module naming

A file such as:

```text
Lineage/Specification/History.lagda.md
```

contains:

```agda
module Lineage.Specification.History where
```

The module hierarchy should communicate mathematical role rather than product-layer ownership.

## 6.5 Executable examples

Examples should be values checked by Agda, not pseudocode that can drift from the implementation.

Where helpful, a chapter may define:

* a minimal basic Prompt;
* a cloze Prompt;
* an image-occlusion Prompt;
* a short repetition history;
* expected semantic observations;
* proofs that examples satisfy required invariants.

## 6.6 Compilation

Agda can compile executable modules through supported backends, particularly JavaScript and Haskell.

The same proved pure core should serve:

* the TypeScript web application through compiled JavaScript;
* command-line, migration, or interoperability tools through JavaScript or Haskell;
* conformance fixtures generated directly from the formal development.

Backend-specific FFI declarations belong in thin outer modules and must not infect semantic definitions.

## 6.7 Documentation generation

Literate chapters should be renderable as a coherent specification manual. The repository should eventually automate:

* Agda type checking;
* HTML generation for literate modules;
* cross-linking definitions where practical;
* compilation of executable API modules;
* generation and checking of conformance examples.

Readable rendered documentation is part of the design quality bar, not merely presentation polish.

---

# 7. Proposed repository organization

A starting structure is:

```text
Lineage/
├── Foundations/
│   ├── Equivalence.lagda.md
│   ├── Algebra.lagda.md
│   └── Result.lagda.md
│
├── Specification/
│   ├── Prompt.lagda.md
│   ├── ReviewContract.lagda.md
│   ├── History.lagda.md
│   ├── Corpus.lagda.md
│   ├── Migration.lagda.md
│   └── Interoperability.lagda.md
│
├── Implementation/
│   ├── Prompt.lagda.md
│   ├── History.lagda.md
│   ├── Corpus.lagda.md
│   ├── Codec.lagda.md
│   ├── Migration.lagda.md
│   └── Anki.lagda.md
│
├── Denotation/
│   ├── Prompt.lagda.md
│   ├── History.lagda.md
│   ├── Corpus.lagda.md
│   └── Interoperability.lagda.md
│
├── Correctness/
│   ├── Prompt.lagda.md
│   ├── History.lagda.md
│   ├── Corpus.lagda.md
│   ├── Codec.lagda.md
│   ├── Migration.lagda.md
│   └── Interoperability.lagda.md
│
├── API/
│   ├── Pure.agda
│   ├── JavaScript.agda
│   └── Haskell.agda
│
└── Examples/
    ├── Basic.lagda.md
    ├── Cloze.lagda.md
    └── ImageOcclusion.lagda.md

web/
├── src/
│   ├── lineage/
│   ├── storage/
│   ├── sync/
│   └── ui/
│
conformance/
├── fixtures/
├── generated/
└── runners/
```

This layout is provisional. In particular, a subsystem-oriented arrangement may prove clearer than four large horizontal layers. The invariant is separation of roles, not preservation of this exact tree.

A subsystem may eventually colocate its specification, representation, denotation, and proofs in one literate chapter if that improves comprehension without collapsing the conceptual distinction.

---

# 8. Agda design principles

## 8.1 Prefer small records of operations and separate records of laws

Following the pattern visible in categorical Agda developments, we should distinguish:

* raw operations;
* equivalence;
* laws;
* homomorphisms;
* preservation proofs;
* lawful instances.

A single enormous record containing all data, operations, laws, implementation details, and proofs is difficult to reuse and reason about.

Conceptually:

```agda
record HistoryOps (H : Set) : Set where
  field
    empty  : H
    append : H → H → H

record IsHistory (H : Set) (_≈_ : H → H → Set)
                 (ops : HistoryOps H) : Set where
  field
    append-assoc : ...
    empty-left   : ...
    empty-right  : ...

record HistoryHomomorphism (A B : Set) ... : Set where
  field
    map          : A → B
    map-empty    : ...
    map-append   : ...
```

The exact records should be introduced only when multiple instances or generic transfer theorems justify them.

## 8.2 Use indexed types selectively

Indexed types are valuable when they express the true domain and remove impossible cases. They are harmful when they encode unstable product policy or force every caller to transport irrelevant proofs.

Use indices for durable structural truths, not temporary UI workflows.

## 8.3 Keep proofs near the definitions they illuminate

Literate Agda permits prose, definitions, examples, and proofs to form one argument. A preservation theorem should normally appear near the operation and denotation it concerns, or be linked clearly from them.

## 8.4 Prefer calculational proofs

Equational-reasoning syntax makes commuting arguments readable:

```agda
preserves-append : ∀ xs ys →
  ⟦ appendᵢ xs ys ⟧ ≈ appendₛ ⟦ xs ⟧ ⟦ ys ⟧
preserves-append xs ys = begin
  ⟦ appendᵢ xs ys ⟧
    ≈⟨ implementation-calculation xs ys ⟩
  appendₛ ⟦ xs ⟧ ⟦ ys ⟧
  ∎
```

The proof should reveal why the implementation works, not merely satisfy the checker through opaque automation.

## 8.5 Normalize at explicit boundaries

Canonicalization should be a named operation with stated laws. We should avoid sprinkling hidden normalization throughout unrelated functions.

Questions to define include:

* Is canonicalization idempotent?
* Does it preserve denotation?
* Is every decoded valid value canonical?
* Does encoding canonicalize?
* Are canonical bytes unique for a semantic value?

## 8.6 Avoid postulates in the trusted core

Unproved postulates weaken the meaning of machine-checked correctness. Any unavoidable assumptions must be isolated, named, documented, and excluded from claims they would invalidate.

Foreign functions and runtime primitives require explicit trust boundaries.

## 8.7 Track termination and productivity honestly

Algorithms should be structurally recursive or use explicit well-founded arguments. Workarounds that disable termination checking are not acceptable in the durable semantic core without a narrowly justified and documented boundary.

## 8.8 Use the standard library deliberately

Dependencies should be explicit and conservative. We should understand which laws and instances come from the Agda standard library and avoid coupling Lineage semantics to accidental library representation choices.

---

# 9. Validation and external data

Lineage must read data that was not constructed through Agda types: files, imported Anki collections, network payloads, browser storage, and future format versions.

Therefore, the implementation needs a layered boundary:

```text
untrusted bytes / JavaScript values
              │
              ▼
         raw decoded syntax
              │ validation
              ▼
      validated implementation value
              │ denotation
              ▼
          semantic meaning
```

## 9.1 Raw syntax

Raw syntax mirrors what the physical encoding can contain, including malformed references, unsupported versions, missing fields, and extension payloads.

## 9.2 Validation

Validation checks local and global invariants and returns precise errors. Successful validation produces a type accepted by the pure core.

## 9.3 Denotation

Only validated values receive the ordinary Lineage denotation. If partial or best-effort interpretation is required for recovery tooling, it should use a different explicit function and result type.

## 9.4 Error semantics

Errors are part of the executable API but normally not part of the durable corpus meaning. Error values should nevertheless be stable and structured enough for TypeScript, command-line tools, and migrations to present useful diagnostics.

---

# 10. The JavaScript and TypeScript boundary

The official web application will be written in TypeScript, but TypeScript must not independently reconstruct Lineage semantics.

## 10.1 Agda owns

The compiled Agda core should own durable decisions such as:

* decoding and validation;
* canonical encoding;
* identity and revision rules;
* Prompt materialization;
* disclosure semantics;
* dependency closure;
* repetition append semantics;
* migrations;
* semantic equality where executable;
* scheduler-history projection;
* Anki conversion and loss reporting;
* conformance observations.

## 10.2 TypeScript owns

TypeScript should own replaceable application concerns such as:

* UI composition;
* DOM rendering;
* browser accessibility integration;
* IndexedDB or other browser persistence plumbing;
* synchronization transport;
* routing;
* styling;
* keyboard and pointer input;
* service-worker orchestration;
* application telemetry;
* invoking scheduler or AI services through explicit boundaries.

## 10.3 Boundary shape

The JavaScript API should be deliberately small. Prefer:

* opaque handles for validated large values;
* plain versioned DTOs for small inputs and observations;
* total decode functions;
* explicit `Result`-like return values;
* deterministic serialized output;
* batched operations where crossing the boundary repeatedly would be expensive;
* generated TypeScript declarations where feasible.

Avoid:

* exposing Agda's internal constructor representation as the public API;
* throwing JavaScript exceptions for expected validation failures;
* requiring TypeScript to maintain invariants already known to Agda;
* duplicating migration or canonicalization logic in TypeScript;
* leaking backend-specific runtime details into the specification.

## 10.4 Trust boundary

Compilation does not prove the JavaScript engine, FFI, browser, or TypeScript application correct. Claims must state the trusted computing base honestly.

The strongest claims apply to the pure Agda definitions and their proofs. Compiled execution additionally trusts:

* Agda itself;
* the selected compiler backend;
* backend runtime support;
* the JavaScript or Haskell runtime;
* serialization and FFI adapters not covered by proofs.

Conformance tests should monitor this boundary even when the source theorem is machine-checked.

---

# 11. Development method

Each semantic capability should proceed through the following loop.

## Step 1: Restate the user-facing requirement

Explain the durable behavior without implementation vocabulary.

Example:

> A Repetition records an observed review event for the exact Prompt revision that was served, and adding it must not rewrite earlier observations.

## Step 2: Identify observable meaning

Ask what a future independent implementation must be able to observe. Remove distinctions that are merely artifacts of today's UI, database, or scheduler.

## Step 3: Explore semantic domains

Write and compare multiple candidate meanings. Evaluate them for:

* simplicity;
* precision;
* compositionality;
* explanatory power;
* proof tractability;
* ability to support required observations;
* compatibility with efficient implementation.

Do not prematurely choose the first record-shaped model.

## Step 4: Define primitive operations and laws

Choose the smallest algebraic vocabulary sufficient to build the desired capability. State laws before optimizing.

## Step 5: Build checked examples

Represent basic, edge, cloze, image-occlusion, migration, and interoperability cases as Agda values. Examples should reveal whether the semantic domain captures actual Lineage requirements.

## Step 6: Choose an implementation representation

Design for:

* bounded Prompt loading;
* indexed stable identities;
* append-oriented repetition history;
* streaming and incremental operations;
* replaceable caches;
* explicit dependency graphs;
* inspectable serialization;
* practical JavaScript execution.

## Step 7: Define the denotation

Map implementation values to the semantic domain. Keep this function simple enough to understand and use in proofs.

## Step 8: Derive implementation operations

Solve the homomorphism equations for each primitive operation. Do not invent an unrelated algorithm and hope to prove it equivalent afterward.

## Step 9: Prove primitive preservation

Prove that each implementation primitive commutes with denotation.

## Step 10: Transfer derived laws

Use generic homomorphism and equation-transfer machinery where it genuinely reduces repetition and clarifies the argument.

## Step 11: Compile and expose a narrow API

Compile only the executable modules required by host applications. Keep proofs and semantic definitions available to the checker without unnecessarily carrying them into runtime representations.

## Step 12: Verify across the boundary

Run generated examples and conformance fixtures through compiled JavaScript or Haskell and compare the observations with those produced by the Agda development.

## Step 13: Measure performance

Benchmark realistic and stress corpora. Optimize the representation or derived algorithms without changing semantics. Re-run proofs and conformance checks after every change.

---

# 12. Proof and test strategy

Proofs do not eliminate tests, and tests do not replace proofs. They cover different risks.

## 12.1 Agda proofs cover

* universally quantified algebraic laws;
* preservation under denotation;
* structural invariants encoded by types;
* migration meaning preservation;
* canonicalization properties;
* semantic claims about composition;
* equation transfer from semantic to implementation domains.

## 12.2 Examples and property checks cover

* whether the chosen specification matches intended product behavior;
* executable edge cases that aid comprehension;
* performance characteristics;
* error quality;
* parser behavior over malformed external data;
* host-boundary representation mismatches.

## 12.3 Cross-backend conformance covers

* compilation assumptions;
* FFI adapters;
* generated JavaScript DTOs;
* deterministic serialization at runtime;
* agreement between JavaScript and Haskell builds where both are used.

## 12.4 Round-trip tests cover

* wire-format encoding and decoding;
* Anki import/export preservation;
* migration sequences;
* compatibility artifacts;
* canonical byte stability where promised.

## 12.5 Stress tests cover

The semantic specification should not contain arbitrary latency targets. Operational profiles and benchmarks should exercise at least a non-normative stress corpus on the order of:

```text
100,000 Prompts
1,000,000 Repetitions
```

The implementation must not require loading an entire corpus for ordinary Prompt review or repetition append operations.

---

# 13. Performance philosophy

Performance constrains architecture but does not determine ontology.

The order of priorities is:

1. semantic correctness;
2. durability and recoverability;
3. loss-aware interoperability;
4. sound asymptotic behavior;
5. practical constant-factor performance.

Denotational design supports optimization because multiple implementation representations can share one meaning. An index, cached fold, compact tree, or chunked log is acceptable when its denotation and preservation laws are explicit.

Derived state may be cached if:

* it can be recomputed from durable facts;
* invalidation semantics are clear;
* cache corruption cannot redefine corpus meaning;
* the cache is excluded from semantic equality unless intentionally durable.

---

# 14. Extensions and evolution

Lineage must evolve without allowing unknown extensions to become invisible semantic dependencies.

An extension design should state:

* its semantic contribution;
* whether it is required or optional;
* its fallback meaning;
* how it composes with core meanings;
* whether old implementations may preserve it opaquely;
* what happens when it cannot be interpreted;
* how migration affects it.

A required extension with no understood fallback may make a Prompt non-serveable. An optional enhancement must not be the only representation capable of conducting the review.

Versioning should distinguish:

* wire-format version;
* semantic profile version;
* presentation profile version;
* extension version;
* scheduler adapter version.

These versions have different meanings and should not be collapsed into one integer merely for convenience.

---

# 15. Anti-patterns

The following approaches conflict with this methodology.

## 15.1 Transcribing the current data document into implementation records

This would freeze provisional field choices before discovering the semantic domain.

## 15.2 Calling an implementation record the specification

A type can reject malformed values while still encoding the wrong meaning or exposing irrelevant distinctions.

## 15.3 Writing the optimized implementation first

A proof attempted afterward often becomes a complicated simulation argument over accidental implementation details.

## 15.4 Treating tests as the homomorphism proof

Differential tests provide valuable evidence about compiled execution. They do not prove a universal commuting equation.

## 15.5 Treating Agda as a more elaborate schema language

Dependent types are not being adopted merely to produce strongly typed JSON records. Agda's central roles are semantic definition, executable derivation, and proof.

## 15.6 Over-indexing unstable policy

Encoding every product decision in types can make evolution painful and obscure the durable mathematics.

## 15.7 Hiding partiality

Malformed input, unsupported versions, import loss, and migration failure must remain explicit.

## 15.8 Using arbitrary code as canonical presentation

JavaScript or imported templates may be preserved for fidelity, but the canonical Prompt must remain safely and portably reviewable without arbitrary execution or network access.

## 15.9 Equating byte identity with meaning

Canonical bytes may be useful, but semantic equality must be independently defined and justified.

## 15.10 Letting TypeScript become a second semantic implementation

If the web application independently decides identity, migration, disclosure, or history semantics, the proved core no longer governs the product.

---

# 16. Initial implementation sequence

The first implementation should be intentionally small.

## Phase 1: Foundations

1. Establish the Agda toolchain and literate Markdown build.
2. Define foundational equivalence and equational-reasoning conventions.
3. Document the trusted computing base and policy on postulates.
4. Add CI for type checking and generated documentation.

## Phase 2: Semantic kernel

1. Compare candidate meanings for Prompt and review contract.
2. Define a minimal basic Prompt semantic domain.
3. Define disclosure, response, and resolution observations.
4. Add checked examples and laws.
5. Extend the kernel to cloze deletion and image occlusion only after the basic case is coherent.

## Phase 3: Repetition histories

1. Define the semantic meaning of a Repetition and ordered history.
2. Separate factual observations from scheduler-derived state.
3. Define append and projection operations.
4. Establish correction/tombstone semantics.
5. Prove history laws.

## Phase 4: Executable corpus representation

1. Choose an inspectable initial wire representation.
2. Define raw syntax, validation, and canonicalization.
3. Define the efficient in-memory corpus representation.
4. Define its denotation.
5. Derive and prove core operations.

## Phase 5: Compiled boundary

1. Compile a narrow pure API to JavaScript.
2. Generate or maintain checked TypeScript bindings.
3. Build a plain reference renderer before a full application renderer.
4. Add conformance fixtures that run through compiled code.

## Phase 6: Migrations and interoperability

1. Formalize version-indexed migrations.
2. Prove preservation for meaning-preserving migrations.
3. Model Anki's relevant semantics explicitly.
4. Implement import/export with structured loss reporting.
5. Verify repetition-history round trips.

## Phase 7: Scheduling

1. Define the projection from durable history to scheduler observations.
2. Integrate an Open Spaced Repetition scheduler through an adapter.
3. Keep scheduler state replaceable and reproducible where practical.
4. Verify that changing scheduler implementations does not alter corpus identity or historical facts.

---

# 17. Review criteria for every design addition

Before accepting a new semantic concept or operation, ask:

## Meaning

* What does it mean independently of storage and UI?
* Is the meaning simpler than the implementation?
* Which observable distinctions matter?

## Composition

* How does its meaning arise from its parts?
* What algebraic operations does it participate in?
* Does it require hidden global state?

## Representation

* Why is the implementation representation efficient or practical?
* Which distinctions are representational only?
* Can it support streaming or incremental use?

## Denotation

* Is the denotation total on validated values?
* Is it simple enough to inspect?
* What equivalence exists in the target semantic domain?

## Proof

* What commuting equations are required?
* Can the operation be derived from those equations?
* Which laws can be transferred generically?
* Is proof difficulty revealing a design problem?

## Evolution

* What happens under migration?
* Can old implementations preserve unknown data safely?
* Does this concept accidentally bind the corpus to a current application or scheduler?

## Execution

* Can the operation compile cleanly to JavaScript or Haskell?
* Is the host-language API small and explicit?
* How will the FFI and compiled behavior be tested?

---

# 18. Definition of done for the formal core

A Lineage capability is not complete merely because an Agda function exists.

For a core capability, completion should normally require:

* explanatory literate prose;
* a simple semantic definition;
* named observable equivalence;
* primitive operations and laws;
* representative checked examples;
* an executable implementation representation;
* an explicit denotation;
* machine-checked preservation proofs;
* compiled API exposure where applications need it;
* conformance fixtures across the runtime boundary;
* performance evidence appropriate to the operation;
* documented trust assumptions and known losses.

Not every exploratory module will initially meet this standard. The distinction between experiments and accepted core modules must be visible.

---

# 19. Central principle

The central implementation principle is:

> **Give Lineage the simplest compositional meaning we can discover, derive efficient executable representations from that meaning, and require the denotation between them to preserve the operations we rely on.**

Agda is valuable not simply because it is strongly typed, and literate Agda is valuable not simply because it combines code with Markdown.

Together they let Lineage develop its specification, implementation, explanation, and correctness argument as one connected body of work—while still keeping semantic meaning distinct from representation and durable truth distinct from replaceable machinery.
