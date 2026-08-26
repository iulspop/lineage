# Corpus correctness

Denotation preserves the corpus-wide identity and referential-integrity checks.

```agda
{-# OPTIONS --safe #-}
module Lineage.Correctness.Corpus where

open import Data.Bool.Base using (Bool; true; false; not; _∧_)
open import Data.List.Base using (List; []; _∷_)
open import Data.Nat.Base using (_≡ᵇ_)
open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Corpus as D
import Lineage.Denotation.Prompt as DP
import Lineage.Implementation.Corpus as I
import Lineage.Implementation.Prompt as IP
import Lineage.Specification.Corpus as S
import Lineage.Specification.Prompt as SP
import Lineage.Specification.Repetition as R
import Lineage.Validation.Corpus as V

private
  variable
    ℓ : Level
    W : S.Vocabulary ℓ

semanticPromptKeyEqual :
  (S.PromptId W → S.PromptId W → Bool) →
  SP.PromptRevision (S.promptVocabulary W) →
  SP.PromptRevision (S.promptVocabulary W) → Bool
semanticPromptKeyEqual {W = W} idEqual left right =
  idEqual (SP.prompt-id left) (SP.prompt-id right) ∧
  (SP.revision left ≡ᵇ SP.revision right)

semanticContainsPromptKey :
  (S.PromptId W → S.PromptId W → Bool) →
  SP.PromptRevision (S.promptVocabulary W) →
  List (SP.PromptRevision (S.promptVocabulary W)) → Bool
semanticContainsPromptKey {W = W} idEqual wanted [] = false
semanticContainsPromptKey {W = W} idEqual wanted (candidate ∷ rest) with
  semanticPromptKeyEqual {W = W} idEqual wanted candidate
... | true = true
... | false = semanticContainsPromptKey {W = W} idEqual wanted rest

semanticUniquePromptKeys :
  (S.PromptId W → S.PromptId W → Bool) →
  List (SP.PromptRevision (S.promptVocabulary W)) → Bool
semanticUniquePromptKeys {W = W} idEqual [] = true
semanticUniquePromptKeys {W = W} idEqual (promptValue ∷ rest) =
  not (semanticContainsPromptKey {W = W} idEqual promptValue rest) ∧
  semanticUniquePromptKeys {W = W} idEqual rest

semanticResolves :
  (S.PromptId W → S.PromptId W → Bool) →
  R.Repetition (S.repetitionVocabulary W) →
  List (SP.PromptRevision (S.promptVocabulary W)) → Bool
semanticResolves {W = W} idEqual repetitionValue [] = false
semanticResolves {W = W} idEqual repetitionValue (promptValue ∷ rest) with
  idEqual (R.prompt-id repetitionValue) (SP.prompt-id promptValue) ∧
  (R.prompt-revision repetitionValue ≡ᵇ SP.revision promptValue)
... | true = true
... | false = semanticResolves {W = W} idEqual repetitionValue rest

semanticAllRepetitionsResolve :
  (S.PromptId W → S.PromptId W → Bool) →
  List (R.Repetition (S.repetitionVocabulary W)) →
  List (SP.PromptRevision (S.promptVocabulary W)) → Bool
semanticAllRepetitionsResolve {W = W} idEqual [] prompts = true
semanticAllRepetitionsResolve {W = W} idEqual (repetitionValue ∷ rest) prompts =
  semanticResolves {W = W} idEqual repetitionValue prompts ∧
  semanticAllRepetitionsResolve {W = W} idEqual rest prompts

semanticValid :
  (S.PromptId W → S.PromptId W → Bool) →
  (S.RepetitionId W → S.RepetitionId W → Bool) →
  S.Corpus W → Bool
semanticValid {W = W} promptIdEqual repetitionIdEqual corpusValue =
  semanticUniquePromptKeys {W = W} promptIdEqual (S.prompts corpusValue) ∧
  V.uniqueRepetitionIds {V = W} repetitionIdEqual (S.repetitions corpusValue) ∧
  semanticAllRepetitionsResolve {W = W} promptIdEqual
    (S.repetitions corpusValue) (S.prompts corpusValue)

prompt-key-equal-preserved :
  (idEqual : S.PromptId W → S.PromptId W → Bool) →
  (left right : IP.PromptRevision (S.promptVocabulary W)) →
  V.promptKeyEqual {V = W} idEqual left right ≡
  semanticPromptKeyEqual {W = W} idEqual
    (DP.denote left)
    (DP.denote right)
prompt-key-equal-preserved {W = W} idEqual left right = refl

contains-prompt-key-preserved :
  (idEqual : S.PromptId W → S.PromptId W → Bool) →
  (wanted : IP.PromptRevision (S.promptVocabulary W)) →
  (prompts : List (IP.PromptRevision (S.promptVocabulary W))) →
  V.containsPromptKey {V = W} idEqual wanted prompts ≡
  semanticContainsPromptKey {W = W} idEqual
    (DP.denote wanted) (D.denotePrompts {V = W} prompts)
contains-prompt-key-preserved {W = W} idEqual wanted [] = refl
contains-prompt-key-preserved {W = W} idEqual wanted (candidate ∷ rest) with
  V.promptKeyEqual {V = W} idEqual wanted candidate
... | true = refl
... | false = contains-prompt-key-preserved {W = W} idEqual wanted rest

unique-prompt-keys-preserved :
  (idEqual : S.PromptId W → S.PromptId W → Bool) →
  (prompts : List (IP.PromptRevision (S.promptVocabulary W))) →
  V.uniquePromptKeys {V = W} idEqual prompts ≡
  semanticUniquePromptKeys {W = W} idEqual (D.denotePrompts {V = W} prompts)
unique-prompt-keys-preserved {W = W} idEqual [] = refl
unique-prompt-keys-preserved {W = W} idEqual (promptValue ∷ rest)
  rewrite contains-prompt-key-preserved {W = W} idEqual promptValue rest
        | unique-prompt-keys-preserved {W = W} idEqual rest = refl

resolves-preserved :
  (idEqual : S.PromptId W → S.PromptId W → Bool) →
  (repetitionValue : R.Repetition (S.repetitionVocabulary W)) →
  (prompts : List (IP.PromptRevision (S.promptVocabulary W))) →
  V.resolves {V = W} idEqual repetitionValue prompts ≡
  semanticResolves {W = W} idEqual repetitionValue (D.denotePrompts {V = W} prompts)
resolves-preserved {W = W} idEqual repetitionValue [] = refl
resolves-preserved {W = W} idEqual repetitionValue (promptValue ∷ rest) with
  idEqual (R.prompt-id repetitionValue) (IP.prompt-id promptValue) ∧
  (R.prompt-revision repetitionValue ≡ᵇ IP.revision promptValue)
... | true = refl
... | false = resolves-preserved {W = W} idEqual repetitionValue rest

all-resolve-preserved :
  (idEqual : S.PromptId W → S.PromptId W → Bool) →
  (repetitions : List (R.Repetition (S.repetitionVocabulary W))) →
  (prompts : List (IP.PromptRevision (S.promptVocabulary W))) →
  V.allRepetitionsResolve {V = W} idEqual repetitions prompts ≡
  semanticAllRepetitionsResolve {W = W} idEqual repetitions (D.denotePrompts {V = W} prompts)
all-resolve-preserved {W = W} idEqual [] prompts = refl
all-resolve-preserved {W = W} idEqual (repetitionValue ∷ rest) prompts
  rewrite resolves-preserved {W = W} idEqual repetitionValue prompts
        | all-resolve-preserved {W = W} idEqual rest prompts = refl

validity-preserved :
  (promptIdEqual : S.PromptId W → S.PromptId W → Bool) →
  (repetitionIdEqual : S.RepetitionId W → S.RepetitionId W → Bool) →
  (corpusValue : I.Corpus W) →
  V.valid {V = W} promptIdEqual repetitionIdEqual corpusValue ≡
  semanticValid {W = W} promptIdEqual repetitionIdEqual (D.denote {V = W} corpusValue)
validity-preserved {W = W} promptIdEqual repetitionIdEqual corpusValue
  rewrite unique-prompt-keys-preserved {W = W} promptIdEqual (I.prompts corpusValue)
        | all-resolve-preserved {W = W} promptIdEqual
            (I.repetitions corpusValue) (I.prompts corpusValue) = refl
```
