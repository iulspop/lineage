# Review session denotation

The denotation forgets the executable constructor names while retaining the
contract meaning, disclosure stage, captured attempt, and assessment.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.ReviewSession where

open import Level using (Level)
import Lineage.Denotation.ReviewContract as Contract
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
    stage : S.Stage

implementationContract :
  I.Session Content Response Attempt Assessment stage →
  Review.Contract Content Response
implementationContract (I.awaiting contract) = contract
implementationContract (I.showing contract attempt) = contract
implementationContract (I.recorded contract attempt assessment) = contract

denote : (session : I.Session Content Response Attempt Assessment stage) →
  S.Session
    (Contract.denote (implementationContract session))
    Attempt Assessment stage
denote (I.awaiting contract) = S.challenging
denote (I.showing contract attempt) = S.resolving attempt
denote (I.recorded contract attempt assessment) =
  S.completed attempt assessment
```
