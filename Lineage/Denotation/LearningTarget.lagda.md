# Learning-target denotation

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.LearningTarget where

open import Level using (Level)
import Lineage.Implementation.LearningTarget as I
import Lineage.Specification.LearningTarget as S

denote : {ℓ : Level} {V : S.Vocabulary ℓ} → I.LearningTarget V → S.LearningTarget V
denote (I.prompt-target id revision) = S.prompt-target id revision
denote (I.source-target id revision) = S.source-target id revision
denote (I.material-target id revision) = S.material-target id revision
denote (I.reading-target id revision segment) = S.reading-target id revision segment
denote (I.material-reading-target id revision segment) =
  S.material-reading-target id revision segment
denote (I.collection-target id) = S.collection-target id
denote (I.concept-target id) = S.concept-target id
```
