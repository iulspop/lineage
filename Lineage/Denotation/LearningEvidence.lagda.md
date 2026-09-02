# Learning-evidence denotation

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.LearningEvidence where

open import Data.List.Base using (List; reverse)
open import Level using (Level)
import Lineage.Implementation.LearningEvidence as I
import Lineage.Specification.LearningEvidence as S

denote : {ℓ : Level} {V : S.Vocabulary ℓ} → I.History V → List (S.LearningEvidence V)
denote evidence-history = reverse (I.newest-first evidence-history)
```
