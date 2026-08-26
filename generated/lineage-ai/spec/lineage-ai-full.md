# Lineage corpus v1: full AI reference

## 1. Scope and authority

This generated reference describes the canonical version-1 corpus and archive boundary. JSON Schema proves shape only; authoritative semantic validation remains mandatory.

## 2. Entities

### 2.1 ArchiveEntry

Safe path, byte count, media type, and host-computed digest.

### 2.2 Asset

Content-addressed local media declaration verified from bytes.

### 2.3 ClozeTarget

Stable cloze identity independent of marker number or position.

### 2.4 CorpusDocument

Top-level canonical corpus; ownership and current due state are excluded.

### 2.5 Extension

Versioned required or optional capability with portable fallback.

### 2.6 InteroperabilityReport

Exactness or named losses for conversion.

### 2.7 Manifest

Archive root binding corpus and entry digests.

### 2.8 Material

Reusable immutable content fragment revision.

### 2.9 Migration

Explicit forward format migration.

### 2.10 OcclusionRegion

Stable region identity with normalized geometry and accessible description.

### 2.11 Prompt

Stable independently scheduled review contract revision.

### 2.12 Provenance

Auditable origin, citation, license, and derivation record.

### 2.13 Relationship

Typed identity-neutral edge.

### 2.14 Repetition

Append-only review event tied to an exact Prompt revision.

### 2.15 RepetitionCorrection

Append-only correction; never overwrites its target.

### 2.16 ResponseInteraction

Typed response capture or reveal-and-self-check.

### 2.17 Source

Shared immutable authored/imported source revision.

## 3. Invariants

### 3.1 identity

Stable IDs identify durable entities; Prompt identity means continuity of one review stream. Revisions are positive and immutable.

### 3.2 disclosure

Challenge, accessible descriptions, fallbacks, and labels visible before reveal must not leak withheld answers; resolution must disclose all answers.

### 3.3 references

Every Prompt/source/material/provenance/asset reference resolves in the same locally complete corpus or archive.

### 3.4 history

Repetitions and corrections are append-only; repetitions resolve to exact Prompt revisions; corrections target distinct existing events.

### 3.5 migrations

Migration history is ordered, contiguous, forward-only, and meaning-preserving.

### 3.6 extensions

Required extensions require support. Optional extensions require canonical portable fallbacks.

### 3.7 interoperability

Exact conversions report no losses; lossy conversions enumerate each loss and preserve original artifacts where possible.

### 3.8 archive

Paths are normalized relative paths; entries are unique; sizes and SHA-256 digests are computed from actual bytes; undeclared and missing required entries are rejected.

### 3.9 canonicalization

Canonical JSON recursively sorts object keys, preserves array order, materializes defaults, and is idempotent.

## 4. Compatibility

Readers reject unknown required format versions and required extensions. Unknown optional extensions remain reviewable through fallbacks. Migrations preserve denotation and remain recorded. Import/export reports exactness or explicit losses. Original Anki or other source artifacts may be preserved as archive entries without becoming the canonical representation.

## 5. Decoder and validation pipeline

Parse JSON; validate against the generated schema; decode tagged alternatives and materialize defaults; run semantic validation; verify references and history; for archives verify paths, sizes, digests, and dependency closure; canonicalize; preview; explicitly accept; persist atomically.

## 6. Stable diagnostics

- `structure.invalid`
- `format.unsupported-version`
- `identity.empty`
- `identity.duplicate`
- `identity.duplicate-prompt-revision`
- `revision.non-positive`
- `reference.unresolved`
- `disclosure.withheld-empty`
- `disclosure.answer-leaked`
- `disclosure.answer-missing`
- `response.invalid-self-check`
- `cloze.targets-required`
- `occlusion.source-required`
- `occlusion.regions-required`
- `asset.unresolved`
- `asset.integrity-host-required`
- `asset.path-unsafe`
- `history.prompt-unresolved`
- `history.correction-invalid`
- `migration.chain-invalid`
- `extension.required-unsupported`
- `extension.optional-fallback-missing`
- `interoperability.loss-unreported`
- `manifest.corpus-mismatch`
- `archive.entry-missing`
- `archive.digest-mismatch`
- `archive.duplicate-path`

## 7. Canonical round trips

For valid corpus `c`: decoding `encode(c)` succeeds with the same denotation; canonicalization is idempotent; generated schema accepts canonical encodings; migrations and import/export marked exact preserve denotation.
