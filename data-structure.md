# Lineage Data Structure Design

> A preliminary logical design for the durable Lineage corpus.

## Status

This document records the current data-model direction. It defines logical entities and semantics before selecting a physical representation such as JSON, SQLite, a directory tree, or an archive.

The design is intentionally provisional. Field names and serialization examples are illustrative rather than a finalized schema.

---

# 1. Design Goals

A Lineage corpus must preserve everything necessary to:

* identify an independently scheduled prompt over time;
* reconstruct and present the prompt without the application that created it;
* conduct an active-recall review;
* reveal a reference answer and supporting explanation;
* preserve the complete repetition history;
* support cloze deletion and image occlusion natively;
* preserve provenance and relationships;
* migrate explicitly between format versions;
* interoperate faithfully with Anki;
* remain readable without a mandatory server, vendor, scheduler, or AI provider.

The corpus stores durable facts. Applications, renderers, schedulers, indexes, and derived scheduling state are replaceable.

---

# 2. Central Model

The central durable unit is a **Prompt**:

> A Prompt is a durably identified, independently scheduled active-recall contract.

A Prompt is not merely question text or a visual card. It defines:

```text
Prompt
├── challenge
├── disclosure boundary
├── response contract
├── resolution
└── dependency closure
```

A **Repetition** records what happened when a person reviewed a particular Prompt revision.

```text
Prompt
+
append-oriented Repetition history
```

A Prompt may use shared Sources, Materials, Assets, and Regions. Those objects do not own repetition histories unless they are themselves represented by independently scheduled Prompts.

## 2.1 Terminology

The product may call a Prompt a “memory” in user-facing language. In the logical format, `Prompt` is used for precision: it is the object that is presented, answered, scheduled, and reviewed.

The format does not currently require a separate abstract `Memory` entity representing “the knowledge itself.” Knowledge boundaries are subjective, while independently reviewed prompts have observable identities and histories.

---

# 3. Corpus Structure

```text
Corpus
├── manifest
├── prompts
├── sources
├── materials
├── assets
├── repetitions
├── relationships
├── provenance records
├── extension declarations
└── migration history
```

The exact physical layout remains undecided. The logical model should not depend on whether these records ultimately live in one database, many files, or a packaged archive.

---

# 4. Corpus Manifest

The manifest identifies and describes the corpus as a whole.

```yaml
corpus:
  id: cor_01
  lineage_format: 1
  created_at: 2026-08-25T18:00:00Z
  updated_at: 2026-08-25T20:00:00Z

  presentation_profiles:
    - lineage.review/1

  extensions: []
```

Expected responsibilities:

* stable corpus identity;
* format version;
* creation and modification timestamps;
* required presentation profiles;
* required and optional extensions;
* integrity information;
* migration history or references to it.

A format version identifies the corpus schema and semantics. A presentation profile identifies the rendering and review semantics used by prompts.

---

# 5. Prompt

A Prompt is the unit of independent scheduling and repetition history.

```yaml
prompt:
  id: prm_paris_cloze
  revision: 3
  status: active
  profile: lineage.review/1

  materials:
    paris:
      type: text
      value: "Paris"

    context:
      type: text
      value: " is the capital of France."

  review:
    challenge: {}
    disclosure: {}
    response: {}
    resolution: {}

  provenance: []
  relationships: []
  created_at: 2026-08-25T18:00:00Z
  updated_at: 2026-08-25T20:00:00Z
```

## 5.1 Stable identity

A Prompt ID must remain stable across ordinary edits such as:

* correcting wording;
* adding an explanation;
* adjusting formatting;
* moving an image mask;
* adding a hint;
* changing organization or tags.

Identity represents continuity of the independently practiced recall stream, not immutable bytes.

Material changes may require a new Prompt identity. Examples include:

* changing the knowledge being tested;
* changing recall direction;
* splitting one Prompt into several independently scheduled Prompts;
* merging several Prompts into one;
* changing from recognition to production when that changes the practiced ability.

Splits and merges should create new identities connected through explicit relationships. Histories must not be silently copied or combined into fictional repetition streams.

## 5.2 Revisions

Prompt content evolves. Revisions make those changes historically interpretable.

```yaml
prompt:
  id: prm_paris_cloze
  revision: 3
```

A Repetition references the Prompt revision actually served. A canonical digest may additionally identify its exact review contract.

```yaml
prompt_revision: 3
presentation_digest: "sha256:..."
```

The eventual storage model must decide whether revisions are retained as full snapshots, deltas, or reconstructable history. Regardless of physical representation, historical repetitions must remain interpretable.

## 5.3 Status

Possible logical states include:

```text
active
suspended
retired
deleted/tombstoned
```

These semantics remain to be finalized. Removing a Prompt must not silently erase its repetition history or break provenance and relationship references.

---

# 6. Portable Review Contract

A Prompt’s canonical presentation is a portable review contract:

```text
Review contract
├── Challenge: what is communicated before the attempt
├── Disclosure boundary: what must remain concealed
├── Response: what the learner may do
└── Resolution: what is communicated after the attempt
```

This model stores active-recall semantics rather than application-specific screens or executable templates.

## 6.1 Challenge

The Challenge describes what is presented before the learner responds or reveals the answer.

```yaml
review:
  challenge:
    content:
      - type: paragraph
        children:
          - type: text
            value: "What is the capital of France?"
```

A renderer may adapt the Challenge to its medium, but it must preserve:

* content and reading order;
* semantic roles;
* essential spatial relationships;
* accessibility equivalents;
* the disclosure boundary.

## 6.2 Disclosure boundary

The disclosure boundary explicitly identifies information that must remain unavailable until Resolution.

```yaml
review:
  disclosure:
    withheld_until_resolution:
      - paris
```

Withheld information must not be exposed through:

* visible text;
* accessibility labels;
* alternative text;
* hidden document content;
* media metadata presented by the renderer;
* fallback representations;
* response controls.

Disclosure is broader than visual concealment. A cloze answer hidden visually but announced by a screen reader is not correctly rendered.

## 6.3 Response contract

The Response contract describes what the learner does and how the outcome may be assessed.

A mentally answered, self-assessed prompt:

```yaml
review:
  response:
    capture:
      type: none
    assessment:
      type: self
```

A typed response with automatic comparison:

```yaml
review:
  response:
    capture:
      type: text
    assessment:
      type: automatic
      comparator:
        type: normalized_text
        accepted:
          - "Paris"
        case_sensitive: false
        whitespace: normalized
```

The data model must distinguish:

```text
response capture
    What the learner supplied.

reference answer
    What is shown for comparison or study.

acceptance criteria
    Rules used for automatic evaluation.

assessment
    Who or what determines the result.
```

A rich reference answer does not imply that automatic grading is possible.

Potential response types include:

```text
none / mental recall
text
single choice
multiple choice
ordering
region selection
drawing or handwriting
audio
```

Only demonstrated requirements should enter the initial core profile.

## 6.4 Resolution

Resolution describes what is communicated after the attempt.

```yaml
review:
  resolution:
    answer:
      - type: paragraph
        children:
          - type: text
            value: "Paris"
            role: answer

    explanation:
      - type: paragraph
        children:
          - type: text
            value: "Paris is the capital and largest city of France."
```

Resolution can contain:

* reference answer;
* expected and supplied response comparison;
* explanation;
* citations;
* media;
* annotations;
* related context.

Scheduler controls such as Again, Hard, Good, and Easy are application or scheduling-profile behavior, not necessarily part of each Prompt’s canonical content.

---

# 7. Structured Content

Canonical Prompt presentation uses a small, typed, non-executable content model.

Potential core content types include:

```text
text
paragraph
heading
emphasis
list
quote
code
mathematics
table
image
audio
video
link
placeholder
annotated image
```

Example:

```yaml
- type: paragraph
  children:
    - type: text
      value: "Paris"
      role: answer
    - type: text
      value: " is the capital of France."
```

Typed content is preferred over unrestricted HTML, CSS, or JavaScript because it is:

* safe to render from untrusted corpora;
* interpretable by non-browser applications;
* explicit about meaning;
* easier to validate and migrate;
* less dependent on disappearing runtime environments.

Markdown and HTML may be supported as authoring, import, export, or preserved-original representations. They are not sufficient by themselves as the canonical portable review contract.

## 7.1 Semantic roles

Content should express meaning separately from optional visual styling.

Possible roles include:

```text
cue
context
question
answer
hint
explanation
citation
warning
concealed target
expected response
supplied response
```

For example:

```yaml
- type: text
  value: "Paris"
  role: answer
```

A visual renderer may use bold or color. A speech renderer may use an announcement or pause. Meaning must not depend solely on a visual choice such as color.

## 7.2 Required and preferred presentation

Presentation constraints should distinguish semantic requirements from aesthetics.

```yaml
layout:
  required:
    relationship: overlay
    coordinate_space: normalized
  preferred:
    maximum_width: 800
```

Required properties preserve meaning. Preferred properties may be adapted or ignored by a renderer.

---

# 8. Materials and Sources

## 8.1 Materials

Materials are stable reusable pieces used to construct a Prompt’s Challenge and Resolution.

```yaml
materials:
  paris:
    type: text
    value: "Paris"

  context:
    type: text
    value: " is the capital of France."
```

References prevent duplicated authoritative content:

```yaml
challenge:
  content:
    - type: paragraph
      children:
        - type: placeholder
          for: paris
        - ref: context

resolution:
  answer:
    - type: paragraph
      children:
        - ref: paris
          role: answer
        - ref: context
```

Materials may be local to a Prompt or shared at corpus scope. The ownership and revision rules for shared Materials remain an open design decision.

## 8.2 Sources

A Source is shared authored, imported, or captured material from which Prompts may be derived.

Examples include:

* a note;
* a document;
* a quotation;
* a textbook excerpt;
* an Anki note;
* an image with named regions;
* imported structured data.

```yaml
source:
  id: src_france
  type: document
  content: []
  provenance: []
```

A Source is not automatically an independently scheduled object and does not own repetition history merely because Prompts derive from it.

A Prompt may reference a Source, but the complete dependency closure required to serve that Prompt must remain available in the corpus.

---

# 9. Cloze Deletion

Cloze targets require stable identities independent of array position, textual marker number, or current wording.

```yaml
materials:
  paris:
    type: text
    value: "Paris"

  context:
    type: text
    value: " is the capital of France."
```

```yaml
review:
  challenge:
    content:
      - type: paragraph
        children:
          - type: placeholder
            for: paris
            hint: "city"
          - ref: context

  disclosure:
    withheld_until_resolution:
      - paris

  response:
    capture:
      type: none
    assessment:
      type: self

  resolution:
    answer:
      - type: paragraph
        children:
          - ref: paris
            role: answer
          - ref: context
```

Important invariants:

* renumbering a cloze marker must not change Prompt identity;
* editing surrounding text must not implicitly create a new repetition stream;
* each independently scheduled cloze has its own Prompt identity;
* one Prompt may intentionally target multiple spans;
* hints are presentation data and must not disclose the answer accidentally;
* repetition history attaches to the Prompt, not the cloze’s array position.

Authoring syntax such as `{{c1::Paris}}` may be compiled into this canonical representation and preserved as source metadata where useful.

---

# 10. Image Occlusion

Image occlusion uses locally preserved Assets and stably identified Regions.

```yaml
asset:
  id: ast_skeleton
  media_type: image/png
  digest: "sha256:..."
  location: "assets/sha256/..."
```

```yaml
region:
  id: reg_femur
  asset: ast_skeleton
  geometry:
    type: polygon
    coordinate_space: normalized
    points:
      - [0.31, 0.18]
      - [0.42, 0.20]
      - [0.45, 0.72]
      - [0.34, 0.74]

  answer:
    type: text
    value: "Femur"

  challenge_description:
    type: text
    value: "The concealed upper-leg region"
```

```yaml
review:
  challenge:
    content:
      - type: annotated_image
        asset: ast_skeleton
        alt: "Anterior human skeleton without anatomical labels"
        overlays:
          - type: concealment
            region: reg_femur

  disclosure:
    withheld_until_resolution:
      - reg_femur.answer

  response:
    capture:
      type: none
    assessment:
      type: self

  resolution:
    answer:
      - type: annotated_image
        asset: ast_skeleton
        alt: "Anterior human skeleton with the femur identified"
        overlays:
          - type: highlight
            region: reg_femur
            label:
              ref: reg_femur.answer
```

Important invariants:

* Region identity is not derived from geometry;
* moving or refining a mask does not inherently reset history;
* coordinates should be independent of rendered pixel dimensions;
* rectangles and polygons should be supported;
* one Prompt may target multiple Regions;
* sibling-mask policies must be explicit;
* accessible challenge descriptions must not reveal withheld labels;
* the source image must be locally available and integrity-verifiable.

---

# 11. Assets

Assets are durable media referenced by Sources, Materials, Challenges, and Resolutions.

```yaml
asset:
  id: ast_skeleton
  media_type: image/png
  byte_length: 284193
  digest: "sha256:..."
  location: "assets/sha256/..."
  created_at: 2026-08-25T18:00:00Z
  provenance: []
```

Asset requirements:

* stable logical identity;
* declared media type;
* integrity digest;
* local availability within the corpus or its defined package;
* deterministic resolution without a mandatory network service;
* provenance where known;
* accessibility descriptions at the point of use, because the appropriate description may depend on disclosure phase.

Content addressing is preferred for byte integrity and deduplication, but logical identity should not necessarily be identical to a content hash.

---

# 12. Repetition

A Repetition is an append-oriented historical observation of a review.

```yaml
repetition:
  id: rep_01
  prompt_id: prm_paris_cloze
  prompt_revision: 3
  presentation_digest: "sha256:..."

  reviewed_at: 2026-08-25T19:42:13Z
  duration_ms: 4210

  response:
    capture_type: none

  assessment:
    scheme: osr.four_grade
    value: good

  historical_scheduling:
    interval_before: "P12D"
    interval_after: "P29D"

  scheduler:
    family: fsrs
    version: "..."
    metadata: {}

  provenance: []
```

The final fields will be aligned with Open Spaced Repetition semantics and Anki interoperability requirements.

## 12.1 Historical facts versus derived state

Durable observations may include:

* review timestamp;
* Prompt and revision served;
* captured response, when retained;
* assessment or rating;
* response time;
* historical interval;
* scheduler identity and version;
* scheduler output used at that time;
* import provenance.

Replaceable derived state may include:

* current stability;
* current difficulty;
* predicted retrievability;
* next due time;
* current scheduler parameters;
* cached statistics.

The corpus should prefer:

> Store what happened. Derive what it means for scheduling.

Corrections to historical events should be explicit and auditable rather than silently overwriting the original record.

---

# 13. Relationships

Relationships connect Prompts, Sources, Assets, and other corpus objects without making organization part of identity.

```yaml
relationship:
  id: rel_01
  kind: derived_from
  from: prm_paris_cloze
  to: src_france
  created_at: 2026-08-25T18:00:00Z
```

Potential relationship kinds include:

```text
derived_from
alternate_presentation_of
reverse_of
prerequisite_of
related_to
supersedes
split_from
merged_from
imports
cites
```

Relationship semantics must be documented. Unknown relationship types should be preserved even if an implementation cannot interpret them.

Decks, folders, tags, and collections may organize Prompts, but changing organization must not change Prompt identity or invalidate repetition history.

---

# 14. Provenance

Provenance records where content and history came from.

```yaml
provenance:
  id: prv_01
  origin:
    system: anki
    collection_id: "..."
    note_id: "..."
    card_id: "..."

  imported_at: 2026-08-25T18:00:00Z
  importer:
    name: lineage
    version: "..."
```

Provenance may describe:

* original source or citation;
* author or creator;
* import system and identifiers;
* import time and tool version;
* generated or transformed content;
* AI involvement;
* licensing information;
* chain of derived objects.

Provenance should not be confused with trust or truth. It records origin, not correctness.

---

# 15. Rendering Profiles and Extensions

## 15.1 Presentation profiles

A Prompt declares a versioned presentation profile:

```yaml
profile: lineage.review/1
```

The profile defines:

* supported content types;
* Challenge and Resolution semantics;
* disclosure requirements;
* response types;
* coordinate systems;
* required fallback behavior;
* accessibility expectations;
* deterministic and implementation-defined behavior.

A renderer can state which profiles it supports.

## 15.2 Extensions

Extensions add capabilities outside the core profile.

```yaml
extensions:
  - id: org.example.chemical-structure
    version: 1
    requirement: optional
```

An extension should declare whether it is:

```text
required
    The Prompt cannot be faithfully served without it.

optional
    The Prompt remains servable using canonical fallback content.
```

Unknown extension data should be preserved during read/write operations where practical.

## 15.3 Fallback representations

Specialized content should provide portable fallbacks.

```yaml
content:
  type: molecule_3d
  asset: ast_caffeine_model

  fallbacks:
    - type: image
      asset: ast_caffeine_svg
    - type: text
      value: "Three-dimensional molecular structure of caffeine"
```

Disclosure rules apply equally to primary and fallback representations.

---

# 16. Canonical, Enhanced, and Original Representations

A corpus may preserve multiple representation layers:

```text
Canonical
    Safe, portable, non-executable review contract.

Enhanced
    Optional higher-fidelity representation for supporting renderers.

Original
    Source-system representation preserved for provenance or round trips.
```

For an imported Anki card:

```yaml
representations:
  canonical:
    profile: lineage.review/1
    review: {}

  original:
    system: anki
    fields: {}
    front_template: "..."
    back_template: "..."
    css: "..."
```

Arbitrary HTML, CSS, or JavaScript may be preserved as original data, but canonical review must not require executing it.

If normalization is incomplete, the importer should report fidelity explicitly:

```yaml
normalization:
  status: partial
  unsupported_features:
    - custom_javascript
  canonical_fallback_available: true
```

---

# 17. Prompt Dependency Closure

Every active Prompt must have a complete local dependency closure.

```text
closure(prompt)
=
    prompt revision
  + referenced sources and materials
  + assets
  + regions
  + presentation profile
  + required extensions
```

A closure manifest may make that set explicit:

```yaml
closure:
  prompt: prm_femur
  revision: 2
  dependencies:
    sources:
      - src_anatomy
    assets:
      - ast_skeleton
    regions:
      - reg_femur
    profiles:
      - lineage.review/1
```

A validator should be able to report:

```yaml
renderable: true
missing_dependencies: []
unsupported_required_extensions: []
disclosure_violations: []
```

A single Prompt and its closure should be exportable and reviewable offline.

---

# 18. Validation Invariants

A conforming corpus should enforce at least the following logical invariants.

## Identity

* Every durable object has a stable, unique identity.
* Repetition history references Prompt identity, never array position or display order.
* Cloze and Region identities do not depend on marker numbers or geometry hashes.

## Referential integrity

* Every required reference resolves.
* Every active Prompt has a complete dependency closure.
* Deletion does not leave uninterpretable repetition history.

## Reviewability

* Challenge content is renderable.
* Resolution content is renderable.
* The declared response interaction is supported by the profile or has a valid fallback.
* Required semantic ordering and spatial relationships are explicit.

## Disclosure

* Withheld material is not exposed in Challenge representations.
* Accessibility and fallback representations obey the same disclosure boundary.

## History

* Every Repetition identifies its Prompt.
* Every Repetition identifies the revision or canonical digest served.
* Historical observations are append-oriented and corrections are auditable.

## Assets

* Required Assets are locally resolvable.
* Asset bytes match declared digests.
* Media types are explicit.

## Evolution

* Corpus format and presentation profiles are versioned.
* Required extensions are declared.
* Migrations are explicit and deterministic where possible.

---

# 19. Example: Complete Basic Prompt

```yaml
prompt:
  id: prm_france_capital
  revision: 1
  status: active
  profile: lineage.review/1

  review:
    challenge:
      content:
        - type: paragraph
          children:
            - type: text
              value: "What is the capital of France?"
              role: question

    disclosure:
      withheld_until_resolution:
        - answer

    response:
      capture:
        type: none
      assessment:
        type: self

    resolution:
      answer:
        - id: answer
          type: paragraph
          children:
            - type: text
              value: "Paris"
              role: answer

      explanation:
        - type: paragraph
          children:
            - type: text
              value: "Paris is the capital and largest city of France."

  provenance: []
  relationships: []
  created_at: 2026-08-25T18:00:00Z
  updated_at: 2026-08-25T18:00:00Z
```

---

# 20. Example: Complete Cloze Prompt

```yaml
prompt:
  id: prm_paris_cloze
  revision: 1
  status: active
  profile: lineage.review/1

  materials:
    paris:
      type: text
      value: "Paris"

    context:
      type: text
      value: " is the capital of France."

  review:
    challenge:
      content:
        - type: paragraph
          children:
            - type: placeholder
              for: paris
              hint: "city"
            - ref: context

    disclosure:
      withheld_until_resolution:
        - paris

    response:
      capture:
        type: none
      assessment:
        type: self

    resolution:
      answer:
        - type: paragraph
          children:
            - ref: paris
              role: answer
            - ref: context

      explanation: []

  provenance: []
  relationships: []
  created_at: 2026-08-25T18:00:00Z
  updated_at: 2026-08-25T18:00:00Z
```

---

# 21. Open Decisions

This design deliberately leaves several questions unresolved.

## Identity and revision

* What ID scheme should durable objects use?
* Which edits retain Prompt identity?
* How are full historical Prompt revisions retained?
* Are presentation digests mandatory for Repetitions?

## Physical representation

* JSON, YAML, CBOR, SQLite, directory tree, archive, or a combination?
* How are large histories and Assets packaged?
* How are atomic writes and recovery handled?

## Content model

* What is the minimum core node set?
* How is rich text represented?
* What mathematical representation is canonical?
* Which media types require core support?
* Are Materials prompt-local, corpus-global, or both?

## Review contract

* Which response types belong in version 1?
* How are supplied responses retained or redacted?
* What automatic comparators are portable enough for the core?
* Are Challenge and Resolution the only required phases?
* How are multi-step prompts represented without creating a workflow language?

## Disclosure and accessibility

* What exact guarantees must a conforming renderer provide?
* How are equivalent accessible representations distinguished from independently scheduled alternate prompts?
* How are disclosure violations detected statically?

## History

* What is the canonical repetition outcome vocabulary?
* How is OSR scheduler metadata represented?
* How are corrections, voids, and imported synthetic events recorded?
* Which Anki revlog fields must be preserved verbatim?

## Deletion and correction

* Are deletions tombstones, status transitions, or append-only events?
* How are mistaken merges and splits repaired?
* How are source and material edits propagated without corrupting historical interpretation?

## Interoperability

* How are Anki notes, cards, templates, and revlogs mapped?
* Which original artifacts are retained for lossless round trips?
* How is normalization fidelity measured and reported?

## Security and packaging

* Which canonical media formats are safe and durable?
* How are encrypted corpora and Assets represented?
* How are signatures and integrity manifests handled?

---

# 22. Current Recommendation

The current recommended logical foundation is:

```text
Corpus
├── Prompt
│   └── portable review contract
│       ├── Challenge
│       ├── Disclosure boundary
│       ├── Response contract
│       └── Resolution
├── Source
├── Material
├── Asset
├── Region
├── Repetition
├── Learning observation
├── Stable reading segment
├── Relationship
├── Provenance
├── Presentation profile
└── Extension declaration
```

The strongest current invariant is:

> Every active Prompt must have a complete, locally available, non-executable canonical representation sufficient for a conforming renderer to conduct the review and record its outcome without consulting the application that created it or any mandatory external service.

This structure preserves what matters over decades:

```text
what was practiced
how it was presented
what was withheld
what response was requested
what was revealed
what happened during each review or broader learning activity
which exact revision-bound segment was read
where the material came from
```

Everything else—including a particular UI, template engine, scheduler, mastery model, session planner, search index, or AI system—can be replaced.

Broader learning state follows the same durable-facts rule. Recall evidence remains the existing Repetition contract for OSR and Anki interoperability. Non-recall evidence records factual presentation, attempt, completion, skip, assessment, or deferral against an exact learning target. Incremental-reading progress binds a stable segment ID to an exact Source or Material revision rather than using mutable character offsets. Session candidates, policy scores, prerequisite-readiness estimates, reading position, mastery, and ordered plans are replaceable derived values; when plans are retained for explanation they include their policy identities and deterministic inputs rather than becoming canonical content truth.
