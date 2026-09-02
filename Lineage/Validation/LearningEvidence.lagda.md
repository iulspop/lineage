# Learning-evidence validation

Validation delegates exact target resolution to the corpus boundary. Recall
facts remain valid exactly when their existing Repetition projection resolves.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.LearningEvidence where

open import Data.Bool.Base using (Bool)
open import Level using (Level)
import Lineage.Specification.LearningEvidence as S
import Lineage.Specification.LearningTarget as T
import Lineage.Specification.Repetition as R

valid : {ℓ : Level} {V : S.Vocabulary ℓ} →
  (T.LearningTarget (S.target-vocabulary V) → Bool) →
  (R.Repetition (S.repetition-vocabulary V) → Bool) →
  S.LearningEvidence V → Bool
valid target-valid repetition-valid (S.recall-evidence review-fact) =
  repetition-valid review-fact
valid target-valid repetition-valid (S.observation-evidence learning-observation) =
  target-valid (S.target learning-observation)
```
