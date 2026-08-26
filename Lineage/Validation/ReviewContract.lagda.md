# Review contract validation

Validation converts untrusted, proof-free executable data into a contract whose
disclosure obligations are machine-checked. The validator requires decidable
content equality because it must determine finite-list membership.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.ReviewContract where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∈_)
import Data.List.Membership.DecPropositional
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Nullary.Decidable using (Dec; yes; no)
open import Relation.Binary.PropositionalEquality using (refl)

import Lineage.Implementation.ReviewContract as I
import Lineage.Specification.ReviewContract as S

private
  variable
    c r : Level
    Content : Set c
    Response : Set r
```

## Deciding disclosure laws

The checks recurse over the finite withheld-material list. Each element must be
absent from the challenge and present in the resolution.

```agda
member? : DecidableEquality Content →
  (item : Content) → (items : List Content) → Dec (item ∈ items)
member? _≟_ item items = membership._∈?_ item items
  where
    module membership = Data.List.Membership.DecPropositional _≟_

noLeak? : DecidableEquality Content →
  (challenge withheld : List Content) → Dec (S.NoLeak challenge withheld)
noLeak? _≟_ challenge [] = yes λ ()
noLeak? _≟_ challenge (item ∷ withheld) with member? _≟_ item challenge
... | yes item∈challenge = no λ safe → safe (here refl) item∈challenge
... | no item∉challenge with noLeak? _≟_ challenge withheld
...   | yes tail-safe = yes λ where
        (here refl) item∈challenge → item∉challenge item∈challenge
        (there item∈withheld) item∈challenge →
          tail-safe item∈withheld item∈challenge
...   | no tail-unsafe = no λ safe →
        tail-unsafe λ item∈withheld → safe (there item∈withheld)

fullyDisclosed? : DecidableEquality Content →
  (resolution withheld : List Content) →
  Dec (S.FullyDisclosed resolution withheld)
fullyDisclosed? _≟_ resolution [] = yes λ ()
fullyDisclosed? _≟_ resolution (item ∷ withheld)
  with member? _≟_ item resolution
... | no item∉resolution = no λ whole → item∉resolution (whole (here refl))
... | yes item∈resolution with fullyDisclosed? _≟_ resolution withheld
...   | yes tail-whole = yes λ where
        (here refl) → item∈resolution
        (there item∈withheld) → tail-whole item∈withheld
...   | no tail-incomplete = no λ whole →
        tail-incomplete λ item∈withheld → whole (there item∈withheld)
```

## Validation certificate

A certificate is indexed by the exact raw value it validates. It cannot be
reused for another contract with different presentations or withheld material.

```agda
record Valid {c r} {Content : Set c} {Response : Set r}
  (raw : I.RawContract Content Response) : Set c where
  field
    challenge-safe :
      S.NoLeak (I.Raw.challenge raw) (I.Raw.withheld raw)
    resolution-whole :
      S.FullyDisclosed (I.Raw.resolution raw) (I.Raw.withheld raw)

open Valid public

valid? : ∀ {c r} {Content : Set c} {Response : Set r} →
  DecidableEquality Content →
  (raw : I.RawContract Content Response) → Dec (Valid raw)
valid? _≟_ raw
  with noLeak? _≟_ (I.Raw.challenge raw) (I.Raw.withheld raw)
... | no unsafe = no λ certificate → unsafe (challenge-safe certificate)
... | yes safe
  with fullyDisclosed? _≟_ (I.Raw.resolution raw) (I.Raw.withheld raw)
... | no incomplete = no λ certificate →
      incomplete (resolution-whole certificate)
... | yes whole = yes record
      { challenge-safe = safe
      ; resolution-whole = whole
      }
```

## Certified construction

Certification preserves every raw field exactly and adds only proof evidence.
The convenience validator erases rejection evidence into `Maybe` for ordinary
host boundaries; proof-oriented callers can use `valid?` directly.

```agda
certify : ∀ {c r} {Content : Set c} {Response : Set r} →
  (raw : I.RawContract Content Response) → Valid raw →
  I.Contract Content Response
certify raw certificate = record
  { challenge = I.Raw.challenge raw
  ; resolution = I.Raw.resolution raw
  ; response = I.Raw.response raw
  ; withheld = I.Raw.withheld raw
  ; challenge-safe = challenge-safe certificate
  ; resolution-whole = resolution-whole certificate
  }

validate : ∀ {c r} {Content : Set c} {Response : Set r} →
  DecidableEquality Content →
  I.RawContract Content Response → Maybe (I.Contract Content Response)
validate _≟_ raw with valid? _≟_ raw
... | yes certificate = just (certify raw certificate)
... | no _ = nothing
```
