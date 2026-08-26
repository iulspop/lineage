# Corpus-wide integrity examples

These fixtures accept a coherent corpus and reject duplicate Prompt revisions,
duplicate Repetition identities, missing Prompt identities, and references to an
unavailable historical revision.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Corpus where

open import Data.Bool.Base using (Bool; true; false)
open import Data.List.Base using ([]; _∷_)
open import Data.Maybe.Base using (just)
open import Data.Nat.Base using (zero; suc)
open import Data.Unit.Base using (⊤; tt)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Corpus as C
import Lineage.Denotation.Corpus as D
import Lineage.Examples.ReviewContract as Review
import Lineage.Implementation.Corpus as I
import Lineage.Implementation.Prompt as P
import Lineage.Specification.Corpus as S
import Lineage.Specification.Prompt as SP
import Lineage.Specification.Repetition as R
import Lineage.Validation.Corpus as V

data PromptId : Set where france-capital italy-capital : PromptId
data RepetitionId : Set where rep-one rep-two : RepetitionId
data Timestamp : Set where review-time : Timestamp
data Duration : Set where four-seconds : Duration
data Assessment : Set where good : Assessment
data Digest : Set where presentation-digest : Digest

vocabulary : S.Vocabulary _
vocabulary = record
  { PromptId = PromptId
  ; Content = Review.Atom
  ; Response = ⊤
  ; RepetitionId = RepetitionId
  ; Timestamp = Timestamp
  ; Duration = Duration
  ; Assessment = Assessment
  ; Digest = Digest
  }

promptIdEqual : PromptId → PromptId → Bool
promptIdEqual france-capital france-capital = true
promptIdEqual italy-capital italy-capital = true
promptIdEqual _ _ = false

repetitionIdEqual : RepetitionId → RepetitionId → Bool
repetitionIdEqual rep-one rep-one = true
repetitionIdEqual rep-two rep-two = true
repetitionIdEqual _ _ = false

prompt-one : P.PromptRevision (S.promptVocabulary vocabulary)
prompt-one = P.prompt-revision
  france-capital zero SP.active Review.capital-of-france

repetition-one : R.Repetition (S.repetitionVocabulary vocabulary)
repetition-one = R.repetition
  rep-one france-capital zero (just presentation-digest)
  review-time (just four-seconds) tt good

missing-prompt-repetition : R.Repetition (S.repetitionVocabulary vocabulary)
missing-prompt-repetition = R.repetition
  rep-two italy-capital zero (just presentation-digest)
  review-time (just four-seconds) tt good

missing-revision-repetition : R.Repetition (S.repetitionVocabulary vocabulary)
missing-revision-repetition = R.repetition
  rep-two france-capital (suc zero) (just presentation-digest)
  review-time (just four-seconds) tt good

validCorpus : I.Corpus vocabulary
validCorpus = I.corpus (prompt-one ∷ []) (repetition-one ∷ [])

duplicatePromptCorpus : I.Corpus vocabulary
duplicatePromptCorpus = I.corpus
  (prompt-one ∷ prompt-one ∷ []) (repetition-one ∷ [])

duplicateRepetitionCorpus : I.Corpus vocabulary
duplicateRepetitionCorpus = I.corpus
  (prompt-one ∷ []) (repetition-one ∷ repetition-one ∷ [])

missingPromptCorpus : I.Corpus vocabulary
missingPromptCorpus = I.corpus
  (prompt-one ∷ []) (missing-prompt-repetition ∷ [])

missingRevisionCorpus : I.Corpus vocabulary
missingRevisionCorpus = I.corpus
  (prompt-one ∷ []) (missing-revision-repetition ∷ [])

valid-proof : V.valid promptIdEqual repetitionIdEqual validCorpus ≡ true
valid-proof = refl

duplicate-prompt-rejection :
  V.valid promptIdEqual repetitionIdEqual duplicatePromptCorpus ≡ false
duplicate-prompt-rejection = refl

duplicate-repetition-rejection :
  V.valid promptIdEqual repetitionIdEqual duplicateRepetitionCorpus ≡ false
duplicate-repetition-rejection = refl

missing-prompt-rejection :
  V.valid promptIdEqual repetitionIdEqual missingPromptCorpus ≡ false
missing-prompt-rejection = refl

missing-revision-rejection :
  V.valid promptIdEqual repetitionIdEqual missingRevisionCorpus ≡ false
missing-revision-rejection = refl

semantic-valid-proof :
  C.semanticValid promptIdEqual repetitionIdEqual (D.denote validCorpus) ≡ true
semantic-valid-proof = refl
```
