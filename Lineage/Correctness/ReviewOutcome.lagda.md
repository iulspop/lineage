# Completed-review outcome preservation

Finalizing the executable session and then taking its meaning is the same as
first taking the completed semantic session and finalizing it there.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.ReviewOutcome where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.ReviewOutcome as D
import Lineage.Denotation.ReviewSession as SessionD
import Lineage.Implementation.ReviewSession as I
import Lineage.Implementation.ReviewOutcome as O
import Lineage.Specification.ReviewOutcome as S
import Lineage.Specification.ReviewSession as Stage

private
  variable
    c r a g : Level
    Content : Set c
    Response : Set r
    Attempt : Set a
    Assessment : Set g

finalize-preserved :
  (session : I.Session Content Response Attempt Assessment Stage.complete) →
  D.denote (O.finalize session) ≡ S.finalize (SessionD.denote session)
finalize-preserved (I.recorded contract attempt assessment) = refl

response-preserved : (outcome : O.Outcome Attempt Assessment) →
  O.captured-response outcome ≡ S.response (D.denote outcome)
response-preserved outcome = refl

assessment-preserved : (outcome : O.Outcome Attempt Assessment) →
  O.recorded-assessment outcome ≡ S.assessment (D.denote outcome)
assessment-preserved outcome = refl
```
