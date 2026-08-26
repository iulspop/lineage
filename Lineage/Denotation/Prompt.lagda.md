# Prompt revision denotation

The denotation forgets executable record layout while preserving stable identity,
revision, lifecycle status, and review-contract meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Denotation.Prompt where

open import Level using (Level)
import Lineage.Denotation.ReviewContract as Review
import Lineage.Implementation.Prompt as I
import Lineage.Specification.Prompt as S

private
  variable
    p c r : Level
    V : S.Vocabulary p c r

denote : I.PromptRevision V → S.PromptRevision V
denote prompt = S.prompt-revision
  (I.prompt-id prompt)
  (I.revision-index prompt)
  (I.status prompt)
  (Review.denote (I.contract prompt))
```
