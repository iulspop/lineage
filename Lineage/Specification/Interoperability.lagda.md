# Interoperability semantics

Format conversion must make information loss explicit. An exact conversion has
no losses; a lossy conversion carries one or more durable, inspectable loss
observations. The converted value and its loss report are semantic results, not
log messages or transient UI state.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Interoperability where

open import Data.Empty using (⊥)
open import Data.List.Base using (List; []; _∷_)
open import Data.Unit using (⊤)
open import Level using (Level; Lift; lift; _⊔_)
open import Relation.Binary.PropositionalEquality using (_≡_)

private
  variable
    t ℓ : Level

data Fidelity : Set where
  exact lossy : Fidelity

LossesMatch : {Loss : Set ℓ} → Fidelity → List Loss → Set ℓ
LossesMatch exact losses = losses ≡ []
LossesMatch {ℓ = ℓ} lossy [] = Lift ℓ ⊥
LossesMatch {ℓ = ℓ} lossy (loss ∷ losses) = Lift ℓ ⊤

record Conversion (Target : Set t) (Loss : Set ℓ) : Set (t ⊔ ℓ) where
  constructor conversion
  field
    value : Target
    losses : List Loss
    fidelity : Fidelity
    losses-match : LossesMatch fidelity losses
```
