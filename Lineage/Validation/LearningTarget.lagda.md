# Learning-target validation

Revision-bound targets reject revision zero. Identity existence and segment
resolution are corpus-wide checks supplied by the host corpus validator.

```agda
{-# OPTIONS --safe #-}
module Lineage.Validation.LearningTarget where

open import Data.Bool.Base using (Bool; true; not)
open import Data.Nat.Base using (zero; _≡ᵇ_)
open import Level using (Level)
import Lineage.Specification.LearningTarget as S

positive : {ℓ : Level} {V : S.Vocabulary ℓ} → S.LearningTarget V → Bool
positive (S.prompt-target id revision) = not (revision ≡ᵇ zero)
positive (S.source-target id revision) = not (revision ≡ᵇ zero)
positive (S.material-target id revision) = not (revision ≡ᵇ zero)
positive (S.reading-target id revision segment) = not (revision ≡ᵇ zero)
positive (S.material-reading-target id revision segment) = not (revision ≡ᵇ zero)
positive (S.collection-target id) = true
positive (S.concept-target id) = true
```
