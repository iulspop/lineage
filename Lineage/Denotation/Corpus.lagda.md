# Corpus denotation

Corpus denotation maps every executable Prompt revision to its semantic meaning
while retaining factual Repetitions unchanged.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Corpus where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Denotation.Prompt as P
import Lineage.Implementation.Corpus as I
import Lineage.Implementation.Prompt as IP
import Lineage.Specification.Corpus as S
import Lineage.Specification.Prompt as SP

private
  variable
    ℓ : Level
    V : S.Vocabulary ℓ

denotePrompts :
  List (IP.PromptRevision (S.promptVocabulary V)) →
  List (SP.PromptRevision (S.promptVocabulary V))
denotePrompts {V = V} [] = []
denotePrompts {V = V} (promptValue ∷ rest) =
  P.denote promptValue ∷ denotePrompts {V = V} rest

denote : I.Corpus V → S.Corpus V
denote {V = V} corpusValue = S.corpus
  (denotePrompts {V = V} (I.prompts corpusValue))
  (I.repetitions corpusValue)
```
