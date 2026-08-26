# Lineage corpus v1: AI authoring specification

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

## Content and review contracts

Challenge and resolution are explicit canonical views. Structured reusable content belongs in Materials and Sources; Prompts reference them without losing a complete review contract. Accessibility descriptions preserve reading order and the disclosure boundary. Cloze targets and occlusion regions have stable IDs independent of position, numbering, wording, or geometry.

## Media

AI output may propose an asset ID, media type, accessible description, and purpose. The host obtains bytes, chooses a safe `assets/...` path, computes byte size and SHA-256, and then revalidates dependency closure. Placeholder media examples are intentionally not importable.

## Provenance

Use provenance for authorship, citations, licenses, imports, derivations, and corrections. Provenance is evidence of origin, not a truth claim. Preserve source chains.

## Repair protocol

Use stable diagnostic code/path pairs. Modify only named paths, preserve unrelated IDs/revisions/history, revalidate after every attempt, stop at the configured limit, and return unresolved failures for human action.
