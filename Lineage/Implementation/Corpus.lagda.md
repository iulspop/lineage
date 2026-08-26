# Executable corpus representation

The executable aggregate stores validated Prompt revisions and Repetitions in
lists. Indexes, chunking, and caches may replace these lists later without
changing the corpus denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Implementation.Corpus where

open import Data.List.Base using (List)
open import Level using (Level)
import Lineage.Implementation.Prompt as P
import Lineage.Specification.Corpus as S
import Lineage.Specification.Repetition as R

record Corpus {ℓ : Level} (V : S.Vocabulary ℓ) : Set ℓ where
  constructor corpus
  field
    prompts : List (P.PromptRevision (S.promptVocabulary V))
    repetitions : List (R.Repetition (S.repetitionVocabulary V))

open Corpus public
```
