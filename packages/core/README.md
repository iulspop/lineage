# `@lineage/core`

Pure, framework-independent learning infrastructure for Lineage. The package owns durable corpus validation, proved Review semantics, append-only evidence folds, replaceable recall scheduling, candidate inspection, and deterministic session planning across recall, authored practice, lessons, and incremental reading.

The package is **private** at version `0.0.0`. Publishing it to npm is not part of the current milestone.

## Boundaries

`@lineage/core` depends on no React, Prisma, HTTP, user-account, clock, randomness, filesystem, or Node-only API. Hosts provide corpus/evidence data, `asOf`, persistence, identities, and any optional seed explicitly.

Durable truth consists of versioned corpus content and factual append-only evidence. Due state, reading position, summaries, candidate scores, plans, and mastery estimates are derived projections. A `Prompt` remains one atomic active-recall unit with its proved disclosure boundary; reading and lesson activities do not masquerade as reviews.

## Public entry points

- `@lineage/core`: cohesive facade and all public contracts
- `@lineage/core/corpus`: corpus schemas, types, canonical serialization
- `@lineage/core/evidence`: deterministic evidence ordering and state folds
- `@lineage/core/planning`: candidates, scoring, interleaving, budgets, recall queue
- `@lineage/core/policies`: prerequisite, incremental-reading, and mathematics policies
- `@lineage/core/review`: proved challenge/response/disclosure Review transitions
- `@lineage/core/scheduling`: replaceable recall-policy contract and FSRS-6
- `@lineage/core/runtime`: generated Agda runtime and authoritative validator adapter

## Basic use

```ts
import {
  createLineageCore,
  incrementalReading,
  mathematicsLesson,
  prerequisiteReadiness,
} from "@lineage/core";

const core = createLineageCore();
const validation = core.validateCorpus(untrustedDocument);

if (!validation.valid) {
  console.error(validation.diagnostics);
} else {
  const corpus = validation.document;
  const asOf = "2026-09-02T17:00:00Z";
  const state = core.deriveState({ corpus, asOf });

  const candidates = core.inspectCandidates({
    corpus,
    state,
    asOf,
    objective: { type: "collection", collectionId: "mathematics" },
  });

  const plan = core.planSession({
    corpus,
    state,
    asOf,
    objective: { type: "collection", collectionId: "mathematics" },
    constraints: { availableMinutes: 45, maximumActivities: 20 },
    seed: "session-id",
  });

  console.log({ candidates, plan });
}
```

Policies can be inspected or composed separately. Baseline policies operate only on authored corpus content and declared relationships; they do not invent lessons, exercises, explanations, or prerequisites.

## Determinism and replay

For the same normalized corpus, evidence, policy implementations and identities, objective, constraints, `asOf`, and seed, the core produces the same derived state and ordered plan. Equal-time evidence is ordered by stable evidence identity. Hosts must define merge/conflict ordering before supplying multi-device evidence; the core does not consult an implicit clock.

Recall evidence preserves the existing `Repetition` representation and Anki/Open Spaced Repetition interoperability contract. Generalized observations supplement rather than replace Repetitions. Reading targets bind an exact Source or Material revision plus a stable segment ID.

## Compatibility policy

Four compatibility domains are versioned independently:

1. **Package API** follows semantic versioning once the package leaves private `0.0.0` status.
2. **Corpus format** is governed by `format` and `formatVersion`; compatible fields use explicit default-empty decoding. Existing Repetition encoding is unchanged.
3. **Policies** carry family/version/implementation/profile/parameter-set identities. Changed scheduling or planning behavior requires a changed identity even when TypeScript types remain compatible.
4. **Generated Agda runtime** is identified by a SHA-256 digest recorded in `generated-artifacts.json`. Generated output must never be edited as authoritative source.

Breaking durable-format changes require an explicit migration with preservation evidence. Deprecated package APIs must remain documented for at least one minor release after publication; no such stability promise applies while the package is private `0.0.0`.

## Verification

```sh
pnpm --filter @lineage/core typecheck
pnpm --filter @lineage/core test
pnpm --filter @lineage/core build
pnpm --filter @lineage/core check:architecture
pnpm --filter @lineage/core benchmark:scale
```

The scale gate exercises 100,000 Prompts and 1,000,000 evidence events. On September 2, 2026 it completed in 3,169 ms with approximately 875 MiB heap under a 1,536 MiB Node heap limit.

Repository-level release verification additionally includes safe Agda checking, generated-runtime drift checks, generated AI conformance, full web tests/typechecking/builds, architecture checks, and Lineage Playwright journeys.

## Release checklist

1. Verify the working tree contains no unintended generated or secret files.
2. Run safe Agda and generated JavaScript drift checks.
3. Regenerate and verify all Lineage AI artifacts.
4. Run core typecheck, tests, build, architecture check, and scale benchmark.
5. Run full web typecheck, tests, production builds, architecture check, and Playwright journeys.
6. Confirm corpus compatibility fixtures and exact FSRS/recall-queue parity.
7. Record policy identity changes and the generated-runtime SHA-256.
8. Update `CHANGELOG.md`.
9. Keep `private: true` unless npm publication is approved as a separate decision.

## Development

The authoritative formal model lives under `Lineage/{Specification,Implementation,Validation,Denotation,Correctness,Examples,API}`. Generated JavaScript is built from `Lineage.API.JavaScript`; TypeScript is a host adapter and policy layer, not a replacement for the proved corpus and Review semantics.
