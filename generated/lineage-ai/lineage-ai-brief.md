# Lineage corpus v1: AI brief

Generate JSON matching `lineage.corpus` version 1.

- Preserve stable Prompt IDs and use positive immutable revisions.
- Keep every withheld answer out of `challenge` and include it in `resolution`.
- Use `response: { "mode": "self-check", "capture": "none" }` when the learner recalls, reveals, then self-assesses.
- Prompt kinds: basic, cloze, image-occlusion.
- Never invent media bytes, byte sizes, SHA-256 digests, or claim an asset exists. Return media requests to the host instead.
- Output only a candidate. A human must preview and explicitly accept it before persistence.
