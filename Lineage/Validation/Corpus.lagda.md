# Corpus-wide validation

Global validation enforces unique Prompt-revision keys, unique Repetition
identities, and exact resolution of every Repetition's served Prompt revision.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.Corpus where

open import Data.Bool.Base using (Bool; true; false; not; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (_≡ᵇ_)
open import Level using (Level)
import Lineage.Implementation.Corpus as I
import Lineage.Implementation.Prompt as P
import Lineage.Specification.Corpus as S
import Lineage.Specification.Repetition as R

private
  variable
    ℓ : Level
    V : S.Vocabulary ℓ

promptKeyEqual : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  P.PromptRevision (S.promptVocabulary V) →
  P.PromptRevision (S.promptVocabulary V) → Bool
promptKeyEqual idEqual left right =
  idEqual (P.prompt-id left) (P.prompt-id right) ∧
  (P.revision left ≡ᵇ P.revision right)

containsPromptKey : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  P.PromptRevision (S.promptVocabulary V) →
  List (P.PromptRevision (S.promptVocabulary V)) → Bool
containsPromptKey {V = V} idEqual wanted [] = false
containsPromptKey {V = V} idEqual wanted (candidate ∷ rest) with
  promptKeyEqual {V = V} idEqual wanted candidate
... | true = true
... | false = containsPromptKey {V = V} idEqual wanted rest

uniquePromptKeys : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  List (P.PromptRevision (S.promptVocabulary V)) → Bool
uniquePromptKeys {V = V} idEqual [] = true
uniquePromptKeys {V = V} idEqual (promptValue ∷ rest) =
  not (containsPromptKey {V = V} idEqual promptValue rest) ∧
  uniquePromptKeys {V = V} idEqual rest

containsRepetitionId : {V : S.Vocabulary ℓ} →
  (S.RepetitionId V → S.RepetitionId V → Bool) →
  S.RepetitionId V → List (R.Repetition (S.repetitionVocabulary V)) → Bool
containsRepetitionId {V = V} idEqual wanted [] = false
containsRepetitionId {V = V} idEqual wanted (candidate ∷ rest) with
  idEqual wanted (R.repetition-id candidate)
... | true = true
... | false = containsRepetitionId {V = V} idEqual wanted rest

uniqueRepetitionIds : {V : S.Vocabulary ℓ} →
  (S.RepetitionId V → S.RepetitionId V → Bool) →
  List (R.Repetition (S.repetitionVocabulary V)) → Bool
uniqueRepetitionIds {V = V} idEqual [] = true
uniqueRepetitionIds {V = V} idEqual (repetitionValue ∷ rest) =
  not (containsRepetitionId {V = V} idEqual
    (R.repetition-id repetitionValue) rest) ∧
  uniqueRepetitionIds {V = V} idEqual rest

resolves : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  R.Repetition (S.repetitionVocabulary V) →
  List (P.PromptRevision (S.promptVocabulary V)) → Bool
resolves {V = V} idEqual repetitionValue [] = false
resolves {V = V} idEqual repetitionValue (promptValue ∷ rest) with
  idEqual (R.prompt-id repetitionValue) (P.prompt-id promptValue) ∧
  (R.prompt-revision repetitionValue ≡ᵇ P.revision promptValue)
... | true = true
... | false = resolves {V = V} idEqual repetitionValue rest

allRepetitionsResolve : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  List (R.Repetition (S.repetitionVocabulary V)) →
  List (P.PromptRevision (S.promptVocabulary V)) → Bool
allRepetitionsResolve {V = V} idEqual [] prompts = true
allRepetitionsResolve {V = V} idEqual (repetitionValue ∷ rest) prompts =
  resolves {V = V} idEqual repetitionValue prompts ∧
  allRepetitionsResolve {V = V} idEqual rest prompts

valid : {V : S.Vocabulary ℓ} →
  (S.PromptId V → S.PromptId V → Bool) →
  (S.RepetitionId V → S.RepetitionId V → Bool) →
  I.Corpus V → Bool
valid {V = V} promptIdEqual repetitionIdEqual corpusValue =
  uniquePromptKeys {V = V} promptIdEqual (I.prompts corpusValue) ∧
  uniqueRepetitionIds {V = V} repetitionIdEqual (I.repetitions corpusValue) ∧
  allRepetitionsResolve {V = V} promptIdEqual
    (I.repetitions corpusValue) (I.prompts corpusValue)
```
