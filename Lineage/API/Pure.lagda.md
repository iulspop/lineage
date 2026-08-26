# Pure Lineage API

This module exposes a deliberately small, total boundary for compiled hosts.
Untrusted string-based review-contract DTOs can be constructed and validated;
only certified contracts can begin the typed disclosure-safe session protocol.
Browser, storage, network, clock, and randomness effects remain outside this API.

```agda
{-# OPTIONS --safe #-}
module Lineage.API.Pure where

open import Data.Bool.Base using (Bool; true; false)
open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.String.Base using (String)
import Data.String.Properties as String
import Lineage.Implementation.ReviewContract as Contract
import Lineage.Implementation.ReviewSession as Session
import Lineage.Specification.ReviewSession as Stage
import Lineage.Validation.ReviewContract as Validation

RawReviewContract : Set
RawReviewContract = Contract.RawContract String String

ReviewContract : Set
ReviewContract = Contract.Contract String String

rawReviewContract :
  List String → List String → String → List String → RawReviewContract
rawReviewContract challenge resolution response withheld = record
  { challenge = challenge
  ; resolution = resolution
  ; response = response
  ; withheld = withheld
  }

validateReviewContract : RawReviewContract → Maybe ReviewContract
validateReviewContract = Validation.validate String._≟_

isValidReviewContract : RawReviewContract → Bool
isValidReviewContract raw with validateReviewContract raw
... | just contract = true
... | nothing = false

ChallengeSession : Set
ChallengeSession = Session.Session String String String String Stage.challenge

ResolutionSession : Set
ResolutionSession = Session.Session String String String String Stage.resolution

CompletedSession : Set
CompletedSession = Session.Session String String String String Stage.complete

beginReview : ReviewContract → ChallengeSession
beginReview = Session.begin

submitResponse : String → ChallengeSession → ResolutionSession
submitResponse = Session.submit

revealResolution : ChallengeSession → ResolutionSession
revealResolution = Session.reveal

recordAssessment : String → ResolutionSession → CompletedSession
recordAssessment = Session.assess

presentChallenge : ChallengeSession → List String
presentChallenge = Session.present

presentResolution : ResolutionSession → List String
presentResolution = Session.present

presentCompleted : CompletedSession → List String
presentCompleted = Session.present

capturedResolutionAttempt : ResolutionSession → Maybe String
capturedResolutionAttempt = Session.capturedAttempt

capturedCompletedAttempt : CompletedSession → Maybe String
capturedCompletedAttempt = Session.capturedAttempt
```
