# Lineage corpus v1: AI brief

Generate only the requested JSON candidate matching `lineage.corpus` version 1.

## Minimal structure

`{ "format": "lineage.corpus", "formatVersion": 1, "corpusId": "...", "prompts": [...] }`

- Prompt kinds: basic, cloze, image-occlusion.
- Response modes: `"text"` or `{ "mode": "self-check", "capture": "none" }`.
- Prompt IDs are stable; revisions are positive and immutable.
- Keep withheld answers out of every pre-reveal representation and include them in resolution.
- Resolve all source, material, asset, provenance, extension, history, and relationship references.
- Never invent media bytes, sizes, paths, or SHA-256 digests. Return media requirements to the host.
- Do not mutate repetition history; add correction events.
- A human must preview and explicitly accept before persistence.

## Common invalid patterns

Answer leakage; missing resolution answers; duplicate identities; revision 0; unresolved references; missing cloze targets; invalid occlusion geometry; invented asset integrity; unsafe archive paths; non-contiguous migrations; unreported conversion loss.

## Small valid example

```json
{
  "assets": [],
  "corpusId": "example-basic",
  "extensions": [],
  "format": "lineage.corpus",
  "formatVersion": 1,
  "interoperability": [],
  "materials": [],
  "migrations": [],
  "prompts": [
    {
      "assets": [],
      "challenge": [
        "What is the capital of France?"
      ],
      "extensions": {
        "optional": [],
        "required": []
      },
      "id": "capital-of-france",
      "kind": "basic",
      "materials": [],
      "presentationProfile": "lineage.review/1",
      "provenance": [],
      "resolution": [
        "What is the capital of France?",
        "Paris"
      ],
      "response": {
        "capture": "none",
        "mode": "self-check"
      },
      "revision": 1,
      "sources": [],
      "status": "active",
      "withheld": [
        "Paris"
      ]
    }
  ],
  "provenance": [],
  "relationships": [],
  "repetitionCorrections": [],
  "repetitions": [],
  "sources": []
}
```
