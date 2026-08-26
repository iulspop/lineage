# Dependency-closure validation

Validation checks finite local inventory with decidable dependency identity. Its
certificate is indexed by the exact raw graph and cannot be reused after either
requirements or inventory changes.

```agda
{-# OPTIONS --safe #-}

module Lineage.Validation.DependencyClosure where

open import Data.List.Base using (List; []; _∷_)
open import Data.List.Membership.Propositional using (_∈_)
import Data.List.Membership.DecPropositional
open import Data.List.Relation.Unary.Any using (here; there)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level)
open import Relation.Binary.Definitions using (DecidableEquality)
open import Relation.Binary.PropositionalEquality using (refl)
open import Relation.Nullary.Decidable using (Dec; yes; no)

import Lineage.Implementation.DependencyClosure as I
import Lineage.Specification.DependencyClosure as S

private
  variable
    d : Level
    Dependency : Set d

member? : DecidableEquality Dependency →
  (dependency : Dependency) → (inventory : List Dependency) →
  Dec (dependency ∈ inventory)
member? _≟_ dependency inventory = membership._∈?_ dependency inventory
  where
    module membership = Data.List.Membership.DecPropositional _≟_

complete? : DecidableEquality Dependency →
  (required available : List Dependency) →
  Dec (S.Complete required available)
complete? _≟_ [] available = yes λ ()
complete? _≟_ (dependency ∷ required) available
  with member? _≟_ dependency available
... | no missing = no λ complete → missing (complete (here refl))
... | yes present with complete? _≟_ required available
...   | yes tail-complete = yes λ where
        (here refl) → present
        (there dependency∈required) → tail-complete dependency∈required
...   | no tail-incomplete = no λ complete →
        tail-incomplete λ dependency∈required →
          complete (there dependency∈required)

record Valid {d} {Dependency : Set d}
  (raw : I.RawClosure Dependency) : Set d where
  constructor valid
  field
    complete : S.Complete
      (I.RawClosure.requirements raw)
      (I.RawClosure.inventory raw)

open Valid public

valid? : DecidableEquality Dependency →
  (raw : I.RawClosure Dependency) → Dec (Valid raw)
valid? _≟_ raw with complete? _≟_
  (I.RawClosure.requirements raw) (I.RawClosure.inventory raw)
... | yes proof = yes (valid proof)
... | no incomplete = no λ certificate → incomplete (complete certificate)

certify : (raw : I.RawClosure Dependency) → Valid raw →
  I.Closure Dependency
certify raw certificate = I.closure
  (I.RawClosure.requirements raw)
  (I.RawClosure.inventory raw)
  (complete certificate)

validate : DecidableEquality Dependency →
  I.RawClosure Dependency → Maybe (I.Closure Dependency)
validate _≟_ raw with valid? _≟_ raw
... | yes certificate = just (certify raw certificate)
... | no _ = nothing
```
