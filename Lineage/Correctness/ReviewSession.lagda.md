# Review session preservation proofs

Every executable transition commutes with review-session denotation. Therefore
hosts may execute the compact state machine without changing the specified
disclosure protocol.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.ReviewSession where

open import Data.Maybe.Base using (Maybe)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.ReviewContract as ContractD
import Lineage.Denotation.ReviewSession as D
import Lineage.Implementation.ReviewContract as Review
import Lineage.Implementation.ReviewSession as I
import Lineage.Specification.ReviewSession as S

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

begin-preserved :
  (contract : Review.Contract Content Response) →
  D.denote (I.begin {Attempt = Attempt} {Assessment = Assessment} contract) ≡
  S.begin (ContractD.denote contract)
begin-preserved contract = refl

submit-preserved :
  (attempt : Attempt) →
  (contract : Review.Contract Content Response) →
  D.denote (I.submit {Assessment = Assessment} attempt (I.awaiting contract)) ≡
  S.submit attempt (S.challenging {contract = ContractD.denote contract})
submit-preserved attempt contract = refl

reveal-preserved :
  (contract : Review.Contract Content Response) →
  D.denote (I.reveal {Attempt = Attempt} {Assessment = Assessment}
    (I.awaiting contract)) ≡
  S.reveal (S.challenging {contract = ContractD.denote contract})
reveal-preserved contract = refl

assess-preserved :
  (assessment : Assessment) →
  (contract : Review.Contract Content Response) →
  (attempt : Maybe Attempt) →
  D.denote (I.assess assessment (I.showing contract attempt)) ≡
  S.assess assessment
    (S.resolving {contract = ContractD.denote contract} attempt)
assess-preserved assessment contract attempt = refl

presentation-preserved :
  ∀ {stage} (session : I.Session Content Response Attempt Assessment stage) →
  I.present session ≡ S.present (D.denote session)
presentation-preserved (I.awaiting contract) = refl
presentation-preserved (I.showing contract attempt) = refl
presentation-preserved (I.recorded contract attempt assessment) = refl

attempt-preserved :
  ∀ {stage} (session : I.Session Content Response Attempt Assessment stage) →
  I.capturedAttempt session ≡ S.capturedAttempt (D.denote session)
attempt-preserved (I.awaiting contract) = refl
attempt-preserved (I.showing contract attempt) = refl
attempt-preserved (I.recorded contract attempt assessment) = refl
```
