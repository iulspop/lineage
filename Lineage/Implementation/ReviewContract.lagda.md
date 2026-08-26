# Executable review contract representation

The executable representation stores the challenge and resolution views
separately. This shape is direct to validate, encode, and expose through a host
API, while its meaning remains the phase-indexed function in the specification.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.ReviewContract where

open import Data.List.Base using (List)
open import Level using (Level; _⊔_)

open import Lineage.Specification.ReviewContract
  using (FullyDisclosed; NoLeak)

private
  variable
    c r : Level
    Content : Set c
    Response : Set r
```

A valid executable contract carries the disclosure evidence required by the
semantic domain. Untrusted serialized input will eventually be decoded and
validated into this type; hosts will not manufacture the evidence themselves.

```agda
record Contract (Content : Set c) (Response : Set r) : Set (c ⊔ r) where
  field
    challenge         : List Content
    resolution        : List Content
    response          : Response
    withheld          : List Content
    challenge-safe    : NoLeak challenge withheld
    resolution-whole  : FullyDisclosed resolution withheld

open Contract public
```

These projections are the executable review-contract algebra. Their names are
kept distinct from the semantic operations so the homomorphism equations are
visible rather than hidden by definitional coincidence.

```agda
presentChallenge : Contract Content Response → List Content
presentChallenge = challenge

presentResolution : Contract Content Response → List Content
presentResolution = resolution

captureResponse : Contract Content Response → Response
captureResponse = response

concealedMaterial : Contract Content Response → List Content
concealedMaterial = withheld
```
