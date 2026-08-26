# Prompt revision preservation

Each primitive executable observation commutes with Prompt denotation. Stable
identity is therefore independent of review-contract representation, while the
served revision and lifecycle status retain their semantic meaning.

```agda
{-# OPTIONS --safe #-}

module Lineage.Correctness.Prompt where

open import Level using (Level)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Denotation.Prompt as D
import Lineage.Implementation.Prompt as I
import Lineage.Specification.Prompt as S

private
  variable
    p c r : Level
    V : S.Vocabulary p c r

prompt-id-preserved : (prompt : I.PromptRevision V) →
  S.prompt-id (D.denote prompt) ≡ I.prompt-id prompt
prompt-id-preserved prompt = refl

revision-preserved : (prompt : I.PromptRevision V) →
  S.revision (D.denote prompt) ≡ I.revision prompt
revision-preserved prompt = refl

status-preserved : (prompt : I.PromptRevision V) →
  S.status (D.denote prompt) ≡ I.status prompt
status-preserved prompt = refl
```
