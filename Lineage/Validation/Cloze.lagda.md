# Cloze validation

Validation decides that no answer fragment is visible in the challenge and that
every answer fragment is present in the resolution.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.Cloze where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∈_; _∉_)
import Data.List.Membership.DecPropositional
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (refl)
open import Relation.Nullary.Decidable using (Dec; yes; no)

import Lineage.Implementation.Cloze as I
import Lineage.Specification.Cloze as S

private
  variable
    i c : Level
    TargetId : Set i
    Content : Set c

member? : DecidableEquality Content →
  (content : Content) → (contents : List Content) → Dec (content ∈ contents)
member? _≟_ content contents = membership._∈?_ content contents
  where module membership = Data.List.Membership.DecPropositional _≟_

noAnswerLeak? : DecidableEquality Content →
  (answers challenge : List Content) → Dec (S.NoAnswerLeak answers challenge)
noAnswerLeak? _≟_ [] challenge = yes λ ()
noAnswerLeak? _≟_ (answer ∷ answers) challenge with member? _≟_ answer challenge
... | yes leaked = no λ safe → safe (here refl) leaked
... | no absent with noAnswerLeak? _≟_ answers challenge
...   | yes tail-safe = yes λ where
        (here refl) → absent
        (there answer∈answers) → tail-safe answer∈answers
...   | no tail-leaked = no λ safe →
        tail-leaked λ answer∈answers → safe (there answer∈answers)

answersDisclosed? : DecidableEquality Content →
  (answers resolution : List Content) → Dec (S.AnswersDisclosed answers resolution)
answersDisclosed? _≟_ [] resolution = yes λ ()
answersDisclosed? _≟_ (answer ∷ answers) resolution with member? _≟_ answer resolution
... | no missing = no λ disclosed → missing (disclosed (here refl))
... | yes present with answersDisclosed? _≟_ answers resolution
...   | yes tail-disclosed = yes λ where
        (here refl) → present
        (there answer∈answers) → tail-disclosed answer∈answers
...   | no tail-missing = no λ disclosed →
        tail-missing λ answer∈answers → disclosed (there answer∈answers)

record Valid {i c} {TargetId : Set i} {Content : Set c}
  (raw : I.RawCloze TargetId Content) : Set (i ⊔ c) where
  constructor valid
  field
    no-answer-leak : S.NoAnswerLeak (I.answers raw) (I.challenge raw)
    answers-disclosed : S.AnswersDisclosed (I.answers raw) (I.resolution raw)

open Valid public

valid? : DecidableEquality Content →
  (raw : I.RawCloze TargetId Content) → Dec (Valid raw)
valid? _≟_ raw with noAnswerLeak? _≟_ (I.answers raw) (I.challenge raw)
... | no leaked = no λ certificate → leaked (no-answer-leak certificate)
... | yes safe with answersDisclosed? _≟_ (I.answers raw) (I.resolution raw)
...   | no missing = no λ certificate → missing (answers-disclosed certificate)
...   | yes disclosed = yes (valid safe disclosed)

certify : (raw : I.RawCloze TargetId Content) → Valid raw →
  I.Cloze TargetId Content
certify raw certificate = I.cloze
  (I.target-id raw) (I.answers raw) (I.hints raw)
  (I.challenge raw) (I.resolution raw)
  (no-answer-leak certificate) (answers-disclosed certificate)

validate : DecidableEquality Content →
  I.RawCloze TargetId Content → Maybe (I.Cloze TargetId Content)
validate _≟_ raw with valid? _≟_ raw
... | yes certificate = just (certify raw certificate)
... | no _ = nothing
```
