# Corpus specification

A corpus composes durable Prompt revisions and factual Repetitions. Its global
meaning includes the requirement that durable identities are unique and that
every Repetition resolves to the exact Prompt revision it says was served.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.Corpus where

open import Data.List.Base using (List)
open import Level using (Level; suc)
import Lineage.Specification.Prompt as P
import Lineage.Specification.Repetition as R

record Vocabulary (ℓ : Level) : Set (suc ℓ) where
  field
    PromptId Content Response RepetitionId Timestamp Duration Assessment Digest : Set ℓ

open Vocabulary public

promptVocabulary : {ℓ : Level} → Vocabulary ℓ → P.Vocabulary ℓ ℓ ℓ
promptVocabulary V = record
  { PromptId = PromptId V
  ; Content = Content V
  ; Response = Response V
  }

repetitionVocabulary : {ℓ : Level} → Vocabulary ℓ → R.Vocabulary ℓ
repetitionVocabulary V = record
  { RepetitionId = RepetitionId V
  ; PromptId = PromptId V
  ; Timestamp = Timestamp V
  ; Duration = Duration V
  ; Response = Response V
  ; Assessment = Assessment V
  ; Digest = Digest V
  }

record Corpus {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  constructor corpus
  field
    prompts : List (P.PromptRevision (promptVocabulary V))
    repetitions : List (R.Repetition (repetitionVocabulary V))

open Corpus public
```
