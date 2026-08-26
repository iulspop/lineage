# Lineage corpus v1: AI brief

Produce only a candidate `lineage.corpus` document.

## Minimal corpus fields

- `format` (required; literal): Format discriminator. Exactly lineage.corpus.
- `formatVersion` (required; literal; minimum): Wire version. Exactly numeric version one.
- `corpusId` (required; scalar): Stable corpus identity. Application ownership is external.
- `prompts` (required; array): Prompt revisions. Identity/revision keys are unique.

## Prompt fields

- `id` (required; scalar; nonEmpty): Stable Prompt identity. One independently scheduled recall stream.
- `revision` (required; scalar; minimum): Positive immutable revision. Repetitions bind to this exact revision.
- `status` (optional; enumeration): Lifecycle status. Defaults to active.
- `kind` (optional; enumeration): Prompt kind. Defaults to basic.
- `challenge` (required; array): Pre-disclosure content. Must not reveal withheld material.
- `withheld` (required; array): Concealed answer material. Non-empty and fully disclosed by resolution.
- `resolution` (required; array): Post-disclosure content. Contains every withheld item.
- `response` (required; alternatives): Response policy. Typed capture or self-check/no-capture.
- `materials` (optional; array): Material references. All resolve locally.
- `sources` (optional; array): Source references. All resolve locally.
- `assets` (optional; array): Asset references. All resolve to archive bytes when exporting.
- `clozeTargets` (optional; array): Stable cloze targets. Required for cloze Prompts.
- `sourceAsset` (optional; reference): Occlusion source image. Required for image occlusion.
- `occlusionRegions` (optional; array): Stable occlusion regions. Required and non-empty for image occlusion.
- `presentationProfile` (optional; scalar): Presentation contract version. Defaults to lineage.review/1.
- `extensions` (optional; objectRef): Prompt extension requirements. Required and optional capabilities are explicit.
- `provenance` (optional; array): Origin records. All references resolve.

## Critical invariants

- `structure.invalid`: Document does not match the version-1 wire shape.
- `format.unsupported-version`: The format version is unsupported.
- `identity.empty`: A stable identity is empty.
- `identity.duplicate`: A stable entity identity is duplicated.
- `identity.duplicate-prompt-revision`: A Prompt identity and revision are duplicated.
- `revision.non-positive`: A revision is not positive.
- `reference.unresolved`: A referenced entity is absent.
- `disclosure.withheld-empty`: A Prompt has no withheld material.
- `disclosure.answer-leaked`: Challenge content contains withheld material.
- `disclosure.answer-missing`: Resolution omits withheld material.
- `response.invalid-self-check`: Self-check response configuration is invalid.
- `cloze.targets-required`: A cloze Prompt has no targets.
- `occlusion.source-required`: Image occlusion has no source asset.
- `occlusion.regions-required`: Image occlusion has no regions.

Never invent asset bytes, sizes, paths, or digests. Preserve unrelated identities and revisions during repair. Require human preview and explicit acceptance before persistence.
