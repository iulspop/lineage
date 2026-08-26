# Small review-contract example

This fixture exercises the kernel with one basic question whose answer crosses
the disclosure boundary. It is intentionally independent of serialization and
rendering details.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.ReviewContract where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∈_)
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Unit.Base using (⊤; tt)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (yes; no)

import Lineage.Correctness.ReviewContract as C
import Lineage.Denotation.ReviewContract as D
import Lineage.Implementation.ReviewContract as I
import Lineage.Specification.ReviewContract as S
import Lineage.Validation.ReviewContract as V
```

The atoms stand for semantic content fragments, not literal strings. A future
content algebra can interpret them as structured text, media, or accessible
alternatives without changing the review-contract laws.

```agda
data Atom : Set where
  capital-question paris-answer : Atom

atom-equality : DecidableEquality Atom
atom-equality capital-question capital-question = yes refl
atom-equality capital-question paris-answer = no λ ()
atom-equality paris-answer capital-question = no λ ()
atom-equality paris-answer paris-answer = yes refl

challenge : List Atom
challenge = capital-question ∷ []

resolution : List Atom
resolution = capital-question ∷ paris-answer ∷ []

withheld : List Atom
withheld = paris-answer ∷ []
```

The constructors of membership make the disclosure evidence structural: the
answer has no possible membership proof in the challenge and has an explicit
membership proof in the resolution.

```agda
challenge-safe : S.NoLeak challenge withheld
challenge-safe (here refl) (here ())
challenge-safe (here refl) (there ())
challenge-safe (there ()) _

resolution-whole : S.FullyDisclosed resolution withheld
resolution-whole (here refl) = there (here refl)
resolution-whole (there ())
```

The executable value can only be constructed after those obligations have been
discharged. Its denotation is then a valid semantic review contract.

```agda
capital-of-france : I.Contract Atom ⊤
capital-of-france = record
  { challenge = challenge
  ; resolution = resolution
  ; response = tt
  ; withheld = withheld
  ; challenge-safe = challenge-safe
  ; resolution-whole = resolution-whole
  }

capital-of-france-meaning : S.Contract Atom ⊤
capital-of-france-meaning = D.denote capital-of-france
```

## Validation fixtures

The valid raw contract is accepted without requiring a host to provide proof
terms. Two malformed variants exercise each side of the disclosure boundary.

```agda
valid-raw : I.RawContract Atom ⊤
valid-raw = record
  { challenge = challenge
  ; resolution = resolution
  ; response = tt
  ; withheld = withheld
  }

leaking-raw : I.RawContract Atom ⊤
leaking-raw = record
  { challenge = capital-question ∷ paris-answer ∷ []
  ; resolution = resolution
  ; response = tt
  ; withheld = withheld
  }

missing-resolution-raw : I.RawContract Atom ⊤
missing-resolution-raw = record
  { challenge = challenge
  ; resolution = challenge
  ; response = tt
  ; withheld = withheld
  }

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

valid-raw-accepted : IsJust (V.validate atom-equality valid-raw)
valid-raw-accepted = is-just

leak-rejected : V.validate atom-equality leaking-raw ≡ nothing
leak-rejected = refl

missing-resolution-rejected :
  V.validate atom-equality missing-resolution-raw ≡ nothing
missing-resolution-rejected = refl
```

The general homomorphism theorems specialize directly to this fixture.

```agda
challenge-agrees = C.present-challenge-homomorphic capital-of-france
resolution-agrees = C.present-resolution-homomorphic capital-of-france
response-agrees = C.response-homomorphic capital-of-france
withheld-agrees = C.withheld-homomorphic capital-of-france
```
