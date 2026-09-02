# Learning-planning examples

This small authored plan demonstrates an eligible recall activity whose cost is
within its explicit budget. Real policies replace the fixture function without
changing the obligations.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Planning where

open import Data.Bool.Base using (true)
open import Data.List.Base using ([]; _∷_)
open import Data.Nat.Base using (ℕ)
open import Data.Nat.Base public using (z≤n; s≤s)
open import Relation.Binary.PropositionalEquality using (refl)
import Lineage.Specification.LearningEvidence as E
import Lineage.Specification.LearningTarget as T
import Lineage.Specification.Planning as S

vocabulary : S.Vocabulary _
vocabulary = record
  { ActivityId = ℕ; Rationale = ℕ; PolicyId = ℕ; Score = ℕ; Seed = ℕ
  ; target-vocabulary = record
      { PromptId = ℕ; SourceId = ℕ; MaterialId = ℕ; CollectionId = ℕ
      ; ConceptId = ℕ; SegmentId = ℕ } }

recall-activity : S.Activity vocabulary
recall-activity = S.activity 1 (T.prompt-target 10 1) E.recall 3

recall-candidate : S.Candidate vocabulary
recall-candidate = S.candidate recall-activity true 100 (1 ∷ [])

eligible-recall : S.Selected vocabulary
eligible-recall = S.selected recall-candidate refl

example-plan : S.SessionPlan vocabulary 5
example-plan = S.session-plan (eligible-recall ∷ []) []
  (S.policy-identity 1 1 ∷ []) 42 (s≤s (s≤s (s≤s z≤n)))

budget-is-sound = S.plan-budget-sound example-plan
selected-is-eligible = S.selected-eligible eligible-recall
```
