# Stable Prompt revision example

This fixture gives one recall stream a stable identity while validating two
immutable revision snapshots. Revision zero is rejected at the host boundary.

```agda
{-# OPTIONS --safe #-}

module Lineage.Examples.Prompt where

open import Data.Maybe.Base using (Maybe; just; nothing)
open import Data.Nat.Base using (zero; suc)
open import Data.Unit.Base using (⊤)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)

import Lineage.Correctness.Prompt as C
import Lineage.Denotation.Prompt as D
import Lineage.Examples.ReviewContract as Review
import Lineage.Implementation.Prompt as I
import Lineage.Specification.Prompt as S
import Lineage.Validation.Prompt as V

data PromptId : Set where france-capital : PromptId

vocabulary : S.Vocabulary _ _ _
vocabulary = record
  { PromptId = PromptId
  ; Content = Review.Atom
  ; Response = ⊤
  }

revision-one-raw : I.RawPromptRevision vocabulary
revision-one-raw = I.raw-prompt-revision
  france-capital (suc zero) S.active Review.capital-of-france

revision-two-raw : I.RawPromptRevision vocabulary
revision-two-raw = I.raw-prompt-revision
  france-capital (suc (suc zero)) S.active Review.capital-of-france

revision-zero-raw : I.RawPromptRevision vocabulary
revision-zero-raw = I.raw-prompt-revision
  france-capital zero S.active Review.capital-of-france

data IsJust {A : Set} : Maybe A → Set where
  is-just : ∀ {value} → IsJust (just value)

revision-one-accepted : IsJust (V.validate revision-one-raw)
revision-one-accepted = is-just

revision-two-accepted : IsJust (V.validate revision-two-raw)
revision-two-accepted = is-just

revision-zero-rejected : V.validate revision-zero-raw ≡ nothing
revision-zero-rejected = refl

revision-one : I.PromptRevision vocabulary
revision-one = V.certify revision-one-raw (V.valid (V.positive zero))

identity-preserved = C.prompt-id-preserved revision-one
revision-number-preserved = C.revision-preserved revision-one
status-preserved = C.status-preserved revision-one

semantic-revision-is-one : S.revision (D.denote revision-one) ≡ suc zero
semantic-revision-is-one = refl
```
