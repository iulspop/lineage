# Native cloze example

This fixture models one stable cloze target for Paris. Validation accepts the
safe form and rejects both answer leakage and incomplete resolution.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.Cloze where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
open import Relation.Nullary.Decidable using (yes; no)

import Lineage.Correctness.Cloze as C
import Lineage.Denotation.Cloze as D
import Lineage.Implementation.Cloze as I
import Lineage.Specification.Cloze as S
import Lineage.Validation.Cloze as V

data TargetId : Set where paris-target : TargetId

data Atom : Set where
  blank city-hint paris-answer capital-context : Atom

atom-equality : DecidableEquality Atom
atom-equality blank blank = yes refl
atom-equality city-hint city-hint = yes refl
atom-equality paris-answer paris-answer = yes refl
atom-equality capital-context capital-context = yes refl
atom-equality blank city-hint = no λ ()
atom-equality blank paris-answer = no λ ()
atom-equality blank capital-context = no λ ()
atom-equality city-hint blank = no λ ()
atom-equality city-hint paris-answer = no λ ()
atom-equality city-hint capital-context = no λ ()
atom-equality paris-answer blank = no λ ()
atom-equality paris-answer city-hint = no λ ()
atom-equality paris-answer capital-context = no λ ()
atom-equality capital-context blank = no λ ()
atom-equality capital-context city-hint = no λ ()
atom-equality capital-context paris-answer = no λ ()

valid-raw : I.RawCloze TargetId Atom
valid-raw = I.raw-cloze paris-target
  (paris-answer ∷ [])
  (city-hint ∷ [])
  (blank ∷ capital-context ∷ [])
  (paris-answer ∷ capital-context ∷ [])

leaking-raw : I.RawCloze TargetId Atom
leaking-raw = I.raw-cloze paris-target
  (paris-answer ∷ [])
  (city-hint ∷ [])
  (paris-answer ∷ capital-context ∷ [])
  (paris-answer ∷ capital-context ∷ [])

missing-answer-raw : I.RawCloze TargetId Atom
missing-answer-raw = I.raw-cloze paris-target
  (paris-answer ∷ [])
  (city-hint ∷ [])
  (blank ∷ capital-context ∷ [])
  (capital-context ∷ [])

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

valid-accepted : IsJust (V.validate atom-equality valid-raw)
valid-accepted = is-just

leak-rejected : V.validate atom-equality leaking-raw ≡ nothing
leak-rejected = refl

missing-answer-rejected :
  V.validate atom-equality missing-answer-raw ≡ nothing
missing-answer-rejected = refl

safe : S.NoAnswerLeak (paris-answer ∷ []) (blank ∷ capital-context ∷ [])
safe (here refl) (here ())
safe (here refl) (there (here ()))
safe (here refl) (there (there ()))
safe (there ()) _

disclosed : S.AnswersDisclosed
  (paris-answer ∷ []) (paris-answer ∷ capital-context ∷ [])
disclosed (here refl) = here refl
disclosed (there ())

validated : I.Cloze TargetId Atom
validated = V.certify valid-raw (V.valid safe disclosed)

meaning : S.Cloze TargetId Atom
meaning = D.denote validated

target-stable = C.target-id-preserved validated
answers-preserved = C.answers-preserved validated
challenge-preserved = C.challenge-preserved validated
resolution-preserved = C.resolution-preserved validated
```
