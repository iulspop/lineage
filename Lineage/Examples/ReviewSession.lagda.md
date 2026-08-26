# Disclosure-safe review session examples

The checked traces demonstrate both legal paths across the disclosure boundary:
submitting an attempt or explicitly revealing without one. Assessment is only
available after either path reaches the resolution stage.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.ReviewSession where

open import Data.Maybe.Base using (just; nothing)
open import Data.Unit.Base using (⊤)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.ReviewSession as C
import Lineage.Denotation.ReviewSession as D
import Lineage.Examples.ReviewContract as Review
import Lineage.Implementation.ReviewSession as I
import Lineage.Specification.ReviewSession as S

data Attempt : Set where paris-attempt : Attempt
data Assessment : Set where recalled : Assessment

challenge-session :
  I.Session Review.Atom ⊤ Attempt Assessment S.challenge
challenge-session = I.begin Review.capital-of-france

submitted-session :
  I.Session Review.Atom ⊤ Attempt Assessment S.resolution
submitted-session = I.submit paris-attempt challenge-session

revealed-session :
  I.Session Review.Atom ⊤ Attempt Assessment S.resolution
revealed-session = I.reveal challenge-session

completed-session :
  I.Session Review.Atom ⊤ Attempt Assessment S.complete
completed-session = I.assess recalled submitted-session

challenge-presents-question :
  I.present challenge-session ≡ Review.challenge
challenge-presents-question = refl

submission-presents-resolution :
  I.present submitted-session ≡ Review.resolution
submission-presents-resolution = refl

submitted-attempt-retained :
  I.capturedAttempt completed-session ≡ just paris-attempt
submitted-attempt-retained = refl

revealed-without-attempt :
  I.capturedAttempt revealed-session ≡ nothing
revealed-without-attempt = refl

submit-commutes = C.submit-preserved
  {Assessment = Assessment} paris-attempt Review.capital-of-france
reveal-commutes = C.reveal-preserved
  {Attempt = Attempt} {Assessment = Assessment} Review.capital-of-france
assessment-commutes = C.assess-preserved
  recalled Review.capital-of-france (just paris-attempt)

semantic-resolution-visible :
  S.present (D.denote submitted-session) ≡ Review.resolution
semantic-resolution-visible = refl
```
