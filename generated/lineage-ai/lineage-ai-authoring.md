# Lineage corpus v1: AI authoring guide

# Lineage corpus v1: AI brief

Generate JSON matching `lineage.corpus` version 1.

- Preserve stable Prompt IDs and use positive immutable revisions.
- Keep every withheld answer out of `challenge` and include it in `resolution`.
- Use `response: { "mode": "self-check", "capture": "none" }` when the learner recalls, reveals, then self-assesses.
- Prompt kinds: basic, cloze, image-occlusion.
- Never invent media bytes, byte sizes, SHA-256 digests, or claim an asset exists. Return media requests to the host instead.
- Output only a candidate. A human must preview and explicitly accept it before persistence.

## Repair contract

Treat diagnostics as authoritative. Repair only the paths named by diagnostics, preserve unrelated identities and revisions, and stop after the host's bounded attempt limit.

## Stable diagnostic codes

- `structure.invalid`
- `format.unsupported-version`
- `identity.empty`
- `identity.duplicate-prompt-revision`
- `revision.non-positive`
- `disclosure.withheld-empty`
- `disclosure.answer-leaked`
- `disclosure.answer-missing`
- `response.invalid-self-check`
- `cloze.targets-required`
- `occlusion.source-required`
- `occlusion.regions-required`
- `asset.unresolved`
- `asset.integrity-host-required`

## Semantic rules

- **disclosure.answer-leaked**: Challenge content must not contain withheld material.
- **disclosure.answer-missing**: Resolution content must contain every withheld item.
- **revision.non-positive**: Prompt revisions begin at one.
- **identity.duplicate-prompt-revision**: Prompt identity and revision pairs are unique.
- **cloze.targets-required**: Cloze prompts require stable target definitions.
- **occlusion.source-required**: Image occlusion requires a declared source asset.
- **asset.integrity-host-required**: Only the host computes byte sizes and SHA-256 digests.
