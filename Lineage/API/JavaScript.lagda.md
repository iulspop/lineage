# JavaScript API boundary

The JavaScript backend compiles this module and its public pure API. It contains
no browser, storage, networking, clock, or randomness effects; TypeScript hosts
supply those capabilities and treat all incoming values as untrusted DTOs.

The proof-oriented pure validator currently compiles through standard-library
`Dec` machinery that is not executable under Agda 2.8's JavaScript backend. The
two specialized entry points below therefore have explicit JavaScript code
generation while retaining the pure Agda definitions as their meanings. This
FFI boundary is smoke-tested with corresponding accepted and rejected cases.

```agda
module Lineage.API.JavaScript where

open import Data.Bool.Base using (Bool)
open import Data.List.Base using (List)
open import Data.Maybe.Base using (Maybe)
open import Data.String.Base using (String)
import Lineage.API.Pure as Pure

open Pure using
  ( RawReviewContract
  ; ReviewContract
  ; ChallengeSession
  ; ResolutionSession
  ; CompletedSession
  )

rawReviewContract :
  List String → List String → String → List String → RawReviewContract
rawReviewContract = Pure.rawReviewContract

isValidReviewContract : RawReviewContract → Bool
isValidReviewContract = Pure.isValidReviewContract

validateReviewContract : RawReviewContract → Maybe ReviewContract
validateReviewContract = Pure.validateReviewContract

beginReview : ReviewContract → ChallengeSession
beginReview = Pure.beginReview

submitResponse : String → ChallengeSession → ResolutionSession
submitResponse = Pure.submitResponse

revealResolution : ChallengeSession → ResolutionSession
revealResolution = Pure.revealResolution

recordAssessment : String → ResolutionSession → CompletedSession
recordAssessment = Pure.recordAssessment

presentChallenge : ChallengeSession → List String
presentChallenge = Pure.presentChallenge

presentResolution : ResolutionSession → List String
presentResolution = Pure.presentResolution

presentCompleted : CompletedSession → List String
presentCompleted = Pure.presentCompleted

capturedResolutionAttempt : ResolutionSession → Maybe String
capturedResolutionAttempt = Pure.capturedResolutionAttempt

capturedCompletedAttempt : CompletedSession → Maybe String
capturedCompletedAttempt = Pure.capturedCompletedAttempt

{-# COMPILE JS isValidReviewContract = raw => raw.record({ record: (challenge, resolution, response, withheld) => withheld.every(item => !challenge.includes(item) && resolution.includes(item)) }) #-}

{-# COMPILE JS validateReviewContract = raw => raw.record({ record: (challenge, resolution, response, withheld) => { const valid = withheld.every(item => !challenge.includes(item) && resolution.includes(item)); if (!valid) return visitor => visitor.nothing(); const contract = { record: visitor => visitor.record(challenge, resolution, response, withheld, null, null) }; return visitor => visitor.just(contract); } }) #-}
```
