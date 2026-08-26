# Review contract correctness

The first correctness theorem family states that denotation is a homomorphism
for every primitive observation in the initial review-contract algebra. The
proofs are definitional because the executable operations were derived from the
semantic equations rather than implemented independently.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.ReviewContract where

open import Data.List.Base using (List)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Denotation.ReviewContract as D
import Lineage.Implementation.ReviewContract as I
import Lineage.Specification.ReviewContract as S

private
  variable
    c r : Level
    Content : Set c
    Response : Set r
```

## Presentation preservation

Observing either semantic phase after denotation is exactly the corresponding
executable presentation operation.

```agda
present-challenge-homomorphic :
  (contract : I.Contract Content Response) →
  S.present (D.denote contract) S.challenge ≡ I.presentChallenge contract
present-challenge-homomorphic contract = refl

present-resolution-homomorphic :
  (contract : I.Contract Content Response) →
  S.present (D.denote contract) S.resolution ≡ I.presentResolution contract
present-resolution-homomorphic contract = refl
```

## Interaction and disclosure preservation

The response interaction and declared concealed material carry the same meaning
across the representation boundary.

```agda
response-homomorphic :
  (contract : I.Contract Content Response) →
  S.responseInteraction (D.denote contract) ≡ I.captureResponse contract
response-homomorphic contract = refl

withheld-homomorphic :
  (contract : I.Contract Content Response) →
  S.withheldMaterial (D.denote contract) ≡ I.concealedMaterial contract
withheld-homomorphic contract = refl
```

The disclosure laws themselves remain inhabited after denotation. They are not
re-established by an independent algorithm: valid executable values already
carry the evidence required by the semantic domain.

```agda
challenge-safety-preserved :
  (contract : I.Contract Content Response) →
  S.NoLeak
    (S.present (D.denote contract) S.challenge)
    (S.withheldMaterial (D.denote contract))
challenge-safety-preserved contract = I.challenge-safe contract

resolution-completeness-preserved :
  (contract : I.Contract Content Response) →
  S.FullyDisclosed
    (S.present (D.denote contract) S.resolution)
    (S.withheldMaterial (D.denote contract))
resolution-completeness-preserved contract = I.resolution-whole contract
```
