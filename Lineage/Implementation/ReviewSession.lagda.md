# Executable review session state machine

The executable state machine keeps the contract in every state so a host can
render without consulting ambient mutable state. Constructors expose only legal
transitions across the disclosure boundary.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.ReviewSession where

open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Level using (Level; _⊔_)
import Lineage.Implementation.ReviewContract as Contract
import Lineage.Specification.ReviewSession as S

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

data Session
  (Content : Set c) (Response : Set r)
  (Attempt : Set a) (Assessment : Set g) : S.Stage → Set (c ⊔ r ⊔ a ⊔ g) where
  awaiting : Contract.Contract Content Response →
    Session Content Response Attempt Assessment S.challenge
  showing : Contract.Contract Content Response → Maybe Attempt →
    Session Content Response Attempt Assessment S.resolution
  recorded : Contract.Contract Content Response → Maybe Attempt → Assessment →
    Session Content Response Attempt Assessment S.complete

begin : Contract.Contract Content Response →
  Session Content Response Attempt Assessment S.challenge
begin = awaiting

submit : Attempt →
  Session Content Response Attempt Assessment S.challenge →
  Session Content Response Attempt Assessment S.resolution
submit attempt (awaiting contract) = showing contract (just attempt)

reveal :
  Session Content Response Attempt Assessment S.challenge →
  Session Content Response Attempt Assessment S.resolution
reveal (awaiting contract) = showing contract nothing

assess : Assessment →
  Session Content Response Attempt Assessment S.resolution →
  Session Content Response Attempt Assessment S.complete
assess assessment (showing contract attempt) = recorded contract attempt assessment

present : ∀ {stage} →
  Session Content Response Attempt Assessment stage → List Content
present (awaiting contract) = Contract.presentChallenge contract
present (showing contract attempt) = Contract.presentResolution contract
present (recorded contract attempt assessment) = Contract.presentResolution contract

capturedAttempt : ∀ {stage} →
  Session Content Response Attempt Assessment stage → Maybe Attempt
capturedAttempt (awaiting contract) = nothing
capturedAttempt (showing contract attempt) = attempt
capturedAttempt (recorded contract attempt assessment) = attempt
```
