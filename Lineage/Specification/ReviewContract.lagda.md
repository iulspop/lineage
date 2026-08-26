# Review contract specification

A review contract denotes what a learner can observe before and after resolving
one independently scheduled active-recall prompt. The semantic domain is
intentionally small: a phase-indexed presentation, a response interaction, and
the material that crosses the disclosure boundary.

The content and response types are parameters. This keeps the kernel independent
of any document tree, media format, widget system, or host application.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.ReviewContract where

open import Data.Empty using (⊥)
open import Data.List.Base using (List)
open import Data.List.Membership.Propositional using (_∈_)
open import Level using (Level; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

private
  variable
    c r : Level
    Content : Set c
    Response : Set r
```

## Review phases

The disclosure boundary divides review into exactly two canonical observations.
Applications may render intermediate UI states, but those states do not alter
which information belongs before or after resolution.

```agda
data Phase : Set where
  challenge resolution : Phase
```

## Disclosure laws

Every item declared withheld must be absent from the challenge and present in
the resolution. These laws model semantic availability, not merely visual
visibility: renderers must apply the same boundary to visible, accessible, and
fallback representations.

```agda
NoLeak : ∀ {c} {Content : Set c} → List Content → List Content → Set c
NoLeak challengeView withheld =
  ∀ {item} → item ∈ withheld → item ∈ challengeView → ⊥

FullyDisclosed : ∀ {c} {Content : Set c} → List Content → List Content → Set c
FullyDisclosed resolutionView withheld =
  ∀ {item} → item ∈ withheld → item ∈ resolutionView
```

## Semantic contract

A semantic contract is a function from review phase to presentation. This
function-shaped meaning is deliberately simpler than an implementation record
with separate front and back fields.

```agda
record Contract (Content : Set c) (Response : Set r) : Set (c ⊔ r) where
  field
    view             : Phase → List Content
    response         : Response
    withheld         : List Content
    challenge-safe   : NoLeak (view challenge) withheld
    resolution-whole : FullyDisclosed (view resolution) withheld

open Contract public
```

The primitive observations form the initial review-contract algebra.

```agda
present : ∀ {c r} {Content : Set c} {Response : Set r} →
  Contract Content Response → Phase → List Content
present = view

responseInteraction : ∀ {c r} {Content : Set c} {Response : Set r} →
  Contract Content Response → Response
responseInteraction = response

withheldMaterial : ∀ {c r} {Content : Set c} {Response : Set r} →
  Contract Content Response → List Content
withheldMaterial = withheld
```

## Observable equivalence

Proof terms and representation choices are not observable prompt meaning. Two
contracts are equivalent when both canonical views, their response interaction,
and their withheld material agree.

```agda
record _≈_ {c r} {Content : Set c} {Response : Set r}
  (left right : Contract Content Response) : Set (c ⊔ r) where
  field
    challenge-view : present left challenge ≡ present right challenge
    resolution-view : present left resolution ≡ present right resolution
    response-view : responseInteraction left ≡ responseInteraction right
    withheld-view : withheldMaterial left ≡ withheldMaterial right

≈-refl : ∀ {c r} {Content : Set c} {Response : Set r}
  {contract : Contract Content Response} → contract ≈ contract
≈-refl = record
  { challenge-view = refl
  ; resolution-view = refl
  ; response-view = refl
  ; withheld-view = refl
  }
```
