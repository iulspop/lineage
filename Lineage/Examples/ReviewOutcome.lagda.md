# Completed review outcome example

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.ReviewOutcome where

open import Data.Maybe.Base using (just)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.ReviewOutcome as C
import Lineage.Examples.ReviewSession as Review
import Lineage.Implementation.ReviewOutcome as I
import Lineage.Specification.ReviewOutcome as S
import Lineage.Denotation.ReviewOutcome as D

completed-outcome : I.Outcome Review.Attempt Review.Assessment
completed-outcome = I.finalize Review.completed-session

response-ready-for-repetition :
  I.captured-response completed-outcome ≡ just Review.paris-attempt
response-ready-for-repetition = refl

assessment-ready-for-repetition :
  I.recorded-assessment completed-outcome ≡ Review.recalled
assessment-ready-for-repetition = refl

finalization-commutes = C.finalize-preserved Review.completed-session

semantic-response :
  S.response (D.denote completed-outcome) ≡ just Review.paris-attempt
semantic-response = refl
```
