# Lineage

> A durable format for lifelong memory, and an application that uses it.

## Vision

Lineage is two things:

1. **A durable, versioned format and library for memories and repetitions.**
2. **An SRS application that implements that format.**

The distinction is fundamental.

Applications change.

Schedulers improve.

Interfaces come and go.

A person's memories and decades of review history should not disappear with them.

Lineage is designed so that the durable layer can survive independently of the current app or scheduling algorithm.

---

# 1. Lineage as a Durable Memory Format

At the foundation of Lineage is an open, documented, versioned format for representing:

* memories;
* prompts and answers;
* notes and explanations;
* media;
* provenance;
* relationships and organization;
* repetitions;
* review timestamps;
* review outcomes;
* relevant historical scheduling information.

This corpus is the durable artifact.

A person might begin building it at 18 and still be maintaining the same corpus at 80.

The format should therefore be designed on the timescale of decades rather than release cycles.

It should be:

* open;
* documented;
* versioned;
* portable;
* recoverable;
* inspectable;
* migration-friendly;
* independent of any particular Lineage application implementation.

A Lineage corpus should remain meaningful even if the original Lineage application no longer exists.

A different program written decades later should be able to read the format and continue maintaining the same memories.

---

# Memories and Repetitions Are the Durable State

The most important data in Lineage is not a due date.

It is:

```text
memory
+
repetition history
```

A memory represents **what someone intends to remember**.

A repetition represents **what actually happened when they attempted to remember it**.

Together they form a historical record that can outlive any particular scheduler.

For example:

```text
Memory
├── stable identity
├── content
├── provenance
├── relationships
└── metadata

Repetitions
├── reviewed_at
├── response / rating
├── response_time
├── historical interval
├── scheduler metadata
└── other observed facts
```

The format should distinguish between historical facts and derived state.

As much as practical:

> **Store what happened. Derive what it means for scheduling.**

---

# Scheduling Is Replaceable

Lineage should not invent its own scheduling research.

Scheduling should be delegated to the **Open Spaced Repetition** ecosystem.

Today that may mean FSRS.

In the future it may mean a newer FSRS version or a completely different scheduler.

Conceptually:

```text
Lineage corpus
    │
    │ memories + repetitions
    ▼
Open Spaced Repetition scheduler
    │
    ▼
derived memory state
    │
    ▼
next review
```

The scheduling engine interprets the corpus.

It does not define the corpus.

This means the scheduler can change without changing the identity of the user's memories or destroying their review history.

A user might maintain the same Lineage corpus through:

```text
FSRS 5
   ↓
FSRS 6
   ↓
future OSR scheduler
   ↓
scheduler that does not exist yet
```

while the underlying memories and repetitions remain continuous.

---

# 2. Lineage as an SRS Application

On top of the durable format, Lineage provides a full spaced-repetition application.

In this sense it belongs to the same family as:

* SuperMemo;
* Anki;
* RemNote;
* and other SRS systems.

The application provides the things users expect from an SRS:

* creating and editing memories;
* reviewing;
* browsing;
* searching;
* organizing;
* tagging;
* media;
* statistics;
* import and export;
* synchronization;
* scheduling configuration;
* memory maintenance.

But the application is only one implementation of the Lineage format.

It should be possible for other implementations to exist.

For example:

```text
                  Lineage Format
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
 Lineage Desktop   Lineage Mobile   lineage-cli

       │
       ▼
 future third-party applications
```

The Lineage application should be excellent.

But it should never become the only software capable of understanding a Lineage library.

---

# Format Over Application

Most SRS systems effectively make their application's database the permanent home of the user's memory.

Lineage reverses that relationship.

Instead of:

```text
application
    └── owns memories
```

Lineage should be:

```text
Lineage corpus
    ├── opened by application A
    ├── opened by application B
    ├── scheduled by algorithm A
    ├── later scheduled by algorithm B
    └── preserved through all of them
```

The corpus is primary.

The application is a tool for interacting with it.

The scheduler is a tool for interpreting its review history.

---

# Decades of Continuity

The core use case for Lineage is not:

> "I need to memorize this for an exam."

It is:

> "I want to still know this thirty years from now."

A Lineage corpus may accumulate:

```text
2026  first memories created
2028  thousands of repetitions
2032  new computer
2035  new Lineage app implementation
2040  new scheduling algorithm
2048  corpus migrated to format v4
2055  new interface built around AI
2065  another scheduler
2075  memories created fifty years earlier still reviewed
```

None of these transitions should require starting over.

That continuity is the product.

---

# Versioning

The Lineage format should evolve deliberately.

Every corpus should identify the version of the specification it follows.

For example:

```text
lineage-format: 1
```

Future versions may introduce new capabilities.

Migrations should be explicit and deterministic where possible:

```text
v1 → v2 → v3
```

Older data should not become mysterious because a new release changed some internal database representation.

The specification should describe both:

* the structure of the data;
* the semantics of the data.

This distinction matters enormously over decades.

A field called `rating = 3` is useless to future software unless the specification also explains what `3` meant.

---

# First-Class Anki Compatibility

Anki should be a first-class interoperability target.

A user should be able to import a mature Anki collection into Lineage while preserving its repetition history as faithfully as possible.

Likewise, a Lineage user should be able to export to Anki without their memories suddenly behaving as if they had never been reviewed.

The goal is:

> **Leaving Lineage should not mean losing your memory history.**

Import and export should preserve, where representable:

* memories and notes;
* repetitions;
* timestamps;
* intervals;
* ratings;
* lapses;
* review counts;
* media;
* tags;
* card/note relationships;
* scheduling history.

Compatibility should be evaluated through round-trip tests.

A card that looks identical but has lost fifteen years of reviews has not been successfully exported.

---

# The Lineage Library

The durable layer should eventually be useful independently of the primary application.

A standalone library should make it straightforward for developers to:

```text
open corpus
read memories
write memories
append repetitions
validate format
migrate versions
query history
hand history to OSR
import/export Anki
```

The official Lineage application should itself use this library.

This prevents the format from quietly becoming merely a description of whatever the main application's database happens to contain.

The library and specification become the contract.

## Specification, implementation, and proof

Lineage should be developed using **denotational design**: first describe the simplest precise meaning of the corpus and its operations, then derive practical representations that preserve that meaning.

The formal core will be written in **literate Agda**, so its mathematical specification, executable implementation, explanations, and machine-checked proofs can form one connected body of work.

The semantic specification and efficient implementation will remain distinct, connected by an explicit denotation. Core operations should satisfy proved homomorphism equations showing that implementation behavior agrees with the simple specification.

```text
simple specification
        │
        │ denotation and preservation proofs
        ▼
executable Agda implementation
        │
        ▼
compiled interfaces for applications
```

This approach is intended to keep storage layouts, indexes, codecs, and application technology replaceable without allowing them to redefine what a Lineage corpus means. The detailed method is described in `implementation-methodology.md`.

---

# Longevity Principles

Lineage should prefer technologies appropriate for archival data.

### Durable identity

Memories should have stable identities independent of their location, deck, folder, or UI representation.

### Append history rather than erase it

Repetition history is valuable.

Historical observations should rarely need destructive mutation.

### Separate observations from derived state

A review event is historical truth.

A predicted retrievability value is a model's interpretation of that truth.

These should not be confused.

### Prefer boring data

The format should be understandable without reconstructing a complicated application environment.

### Explicit migrations

Format evolution should happen through versioned transformations rather than invisible schema changes.

### No mandatory vendor

Reading a Lineage corpus should never require access to a Lineage-operated server.

---

# What Should Be Stable?

Lineage distinguishes between things that should remain stable and things we expect to replace.

## Durable

```text
memory identity
memory content
provenance
relationships
repetition history
timestamps
format semantics
```

## Replaceable

```text
desktop application
mobile application
UI framework
sync provider
database indexes
search implementation
scheduler
scheduler parameters
derived scheduling state
AI provider
```

This boundary is the central architectural constraint of Lineage.

---

# The Promise

Lineage makes a simple promise:

> **You own the memories. You own the repetitions.**

The current application is one way to interact with them.

The current scheduler is one way to decide when to review them.

Neither should determine how long the knowledge survives.

Applications may be rewritten.

Schedulers may be replaced.

Companies may disappear.

Computers may change.

The format should endure.

---

# North Star

A successful Lineage ecosystem might eventually look like this:

```text
                        LINEAGE
                   durable corpus
                        │
        memories + decades of repetitions
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
  Lineage App      future app       third-party app
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                Open Spaced Repetition
                        │
            scheduler chosen today
                        │
                  replaceable later
```

The application can change.

The scheduling algorithm can change.

The durable, versioned memory format remains.

For years.

For decades.

Potentially for a lifetime.
