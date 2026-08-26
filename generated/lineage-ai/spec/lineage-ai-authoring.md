# Lineage corpus v1: AI authoring specification

Portable, locally complete version-1 Lineage corpus and archive format.

## ClozeTarget

ClozeTarget version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable cloze-target identity. Independent of marker order and wording.
- `answer` (required; scalar): Withheld target answer. Must be disclosed after reveal.
- `hints` (optional; array): Optional hints. Hints must not leak the answer.

## RectangleGeometry

RectangleGeometry version-1 wire object.

- `type` (required; literal): Geometry discriminator. Selects normalized rectangle fields.
- `x` (required; scalar; maximum): Left coordinate. Inclusive range zero through one.
- `y` (required; scalar; maximum): Top coordinate. Inclusive range zero through one.
- `width` (required; scalar; minimum, maximum): Normalized width. Greater than zero and at most one.
- `height` (required; scalar; minimum, maximum): Normalized height. Greater than zero and at most one.

## PolygonGeometry

PolygonGeometry version-1 wire object.

- `type` (required; literal): Geometry discriminator. Selects polygon points.
- `points` (required; array): Normalized polygon vertices. At least three points.

## OcclusionRegion

OcclusionRegion version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable region identity. Geometry changes do not change identity.
- `label` (required; scalar): Human-readable region label. Must be non-empty.
- `accessibleDescription` (required; scalar): Accessible equivalent. Must describe the concealed region without leaking its answer.
- `geometry` (required; taggedChoice): Normalized geometry. Rectangle or polygon with coordinates from zero through one.

## Source

Source version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable Source identity. Pairs with revision.
- `revision` (required; scalar; minimum): Positive immutable revision. Starts at one.
- `title` (required; scalar): Source title. Must be non-empty.
- `content` (required; scalar): Source content. Portable non-executable text.
- `assets` (optional; array): Referenced assets. All references resolve locally.
- `provenance` (optional; array): Origin records. All references resolve locally.

## Material

Material version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable Material identity. Pairs with revision.
- `revision` (required; scalar; minimum): Positive immutable revision. Starts at one.
- `content` (required; array): Structured portable content. Ordered content blocks.
- `sources` (optional; array): Source references. All references resolve.
- `assets` (optional; array): Asset references. All references resolve.
- `provenance` (optional; array): Origin records. All references resolve.

## Asset

Asset version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable asset identity. Referenced by Prompts, Sources, and Materials.
- `mediaType` (required; scalar): IANA media type. Must be non-empty.
- `byteSize` (required; scalar): Exact byte count. Computed by the host from actual bytes.
- `sha256` (required; scalar; regexPattern): Lowercase SHA-256 digest. Exactly 64 hexadecimal characters, host-computed.
- `path` (required; scalar): Safe archive-relative path. Must begin assets/ and cannot traverse.
- `accessibleDescription` (optional; scalar): Accessible media equivalent. Required when media conveys review meaning.

## Prompt

Prompt version-1 wire object.

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

## Provenance

Provenance version-1 wire object.

- `id` (required; scalar; nonEmpty): Stable provenance identity. Unique among provenance records.
- `kind` (required; enumeration): Origin kind. Does not imply truth or trust.
- `recordedAt` (required; scalar; semanticFormat): Record timestamp. RFC 3339 date-time.
- `agent` (optional; scalar): Human or software agent. Optional attribution.
- `citation` (optional; scalar): Citation. Portable source citation.
- `license` (optional; scalar): License expression. Optional rights information.
- `note` (optional; scalar): Origin note. Optional explanatory text.
- `sources` (optional; array): Prior provenance records. Forms append-only derivation chains.

## Repair protocol

Use stable diagnostic code/path pairs. Modify only named paths, preserve unrelated IDs, revisions, and history, revalidate after every attempt, stop at the configured limit, and surface unresolved failures for human action. Media integrity is always computed by the host from actual bytes.
