# Repetition validation example

The fixture accepts a review served from prompt revision one, preserves its
facts through denotation, and rejects revision zero.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.Repetition where

open import Data.Maybe.Base using (just; nothing)
open import Data.Nat.Base using (zero; suc)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Denotation.Repetition as D
import Lineage.Implementation.Repetition as I
import Lineage.Specification.Repetition as S
import Lineage.Validation.Repetition as V

data RepetitionId : Set where rep-1 : RepetitionId
data PromptId : Set where paris-prompt : PromptId
data Timestamp : Set where review-time : Timestamp
data Duration : Set where four-seconds : Duration
data Response : Set where no-captured-response : Response
data Assessment : Set where good : Assessment
data Digest : Set where paris-digest : Digest

vocabulary : S.Vocabulary _
vocabulary = record
  { RepetitionId = RepetitionId
  ; PromptId = PromptId
  ; Timestamp = Timestamp
  ; Duration = Duration
  ; Response = Response
  ; Assessment = Assessment
  ; Digest = Digest
  }

accepted : I.RawRepetition vocabulary
accepted = I.raw-repetition rep-1 paris-prompt (suc zero)
  (just paris-digest) review-time (just four-seconds)
  no-captured-response good

rejected : I.RawRepetition vocabulary
rejected = I.raw-repetition rep-1 paris-prompt zero
  (just paris-digest) review-time (just four-seconds)
  no-captured-response good

accepted-proof : V.Valid accepted
accepted-proof = V.valid (V.positive zero)

accepted-by-validator : V.valid? accepted ≡ just accepted-proof
accepted-by-validator = refl

rejected-by-validator : V.valid? rejected ≡ nothing
rejected-by-validator = refl

served-revision-preserved :
  S.prompt-revision (D.denote accepted accepted-proof) ≡ suc zero
served-revision-preserved = refl
```
