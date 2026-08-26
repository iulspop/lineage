# Review session protocol specification

A review session is indexed by its disclosure stage. The type rules make it
impossible to present the resolution before an explicit submit or reveal action,
or to record an assessment before the resolution has been disclosed.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.ReviewSession where

open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
import Lineage.Specification.ReviewContract as Contract

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

data Stage : Set where
  challenge resolution complete : Stage

data Session
  (contract : Contract.Contract Content Response)
  (Attempt : Set a) (Assessment : Set g) : Stage → Set (a ⊔ g) where
  challenging : Session contract Attempt Assessment challenge
  resolving : Maybe Attempt → Session contract Attempt Assessment resolution
  completed : Maybe Attempt → Assessment →
    Session contract Attempt Assessment complete

begin : (contract : Contract.Contract Content Response) →
  Session contract Attempt Assessment challenge
begin contract = challenging

submit : ∀ {contract : Contract.Contract Content Response} → Attempt →
  Session contract Attempt Assessment challenge →
  Session contract Attempt Assessment resolution
submit attempt challenging = resolving (just attempt)

reveal : ∀ {contract : Contract.Contract Content Response} →
  Session contract Attempt Assessment challenge →
  Session contract Attempt Assessment resolution
reveal challenging = resolving nothing

assess : ∀ {contract : Contract.Contract Content Response} → Assessment →
  Session contract Attempt Assessment resolution →
  Session contract Attempt Assessment complete
assess assessment (resolving attempt) = completed attempt assessment

present : ∀ {contract : Contract.Contract Content Response} {stage : Stage} →
  Session contract Attempt Assessment stage → List Content
present {contract = contract} {stage = challenge} challenging =
  Contract.present contract Contract.challenge
present {contract = contract} {stage = resolution} (resolving attempt) =
  Contract.present contract Contract.resolution
present {contract = contract} {stage = complete} (completed attempt assessment) =
  Contract.present contract Contract.resolution

capturedAttempt : ∀ {contract : Contract.Contract Content Response} {stage : Stage} →
  Session contract Attempt Assessment stage → Maybe Attempt
capturedAttempt challenging = nothing
capturedAttempt (resolving attempt) = attempt
capturedAttempt (completed attempt assessment) = attempt
```
