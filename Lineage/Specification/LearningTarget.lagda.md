# Learning target specification

A learning target is an exact durable reference. Prompt, Source, and Material
targets bind a positive revision; reading additionally binds a stable segment
identity. Collections and authored concepts are stable organizational targets.

```agda
{-# OPTIONS --safe #-}
module Lineage.Specification.LearningTarget where

open import Data.Nat.Base using (ℕ; suc)
open import Level using (Level)

record Vocabulary (ℓ : Level) : Set (Level.suc ℓ) where
  field
    PromptId SourceId MaterialId CollectionId ConceptId SegmentId : Set ℓ

open Vocabulary public

data LearningTarget {ℓ : Level} (V : Vocabulary ℓ) : Set ℓ where
  prompt-target : PromptId V → ℕ → LearningTarget V
  source-target : SourceId V → ℕ → LearningTarget V
  material-target : MaterialId V → ℕ → LearningTarget V
  reading-target : SourceId V → ℕ → SegmentId V → LearningTarget V
  material-reading-target : MaterialId V → ℕ → SegmentId V → LearningTarget V
  collection-target : CollectionId V → LearningTarget V
  concept-target : ConceptId V → LearningTarget V

prompt-revision : {ℓ : Level} {V : Vocabulary ℓ} → PromptId V → ℕ → LearningTarget V
prompt-revision prompt-id revision-index = prompt-target prompt-id (suc revision-index)

source-revision : {ℓ : Level} {V : Vocabulary ℓ} → SourceId V → ℕ → LearningTarget V
source-revision source-id revision-index = source-target source-id (suc revision-index)

material-revision : {ℓ : Level} {V : Vocabulary ℓ} → MaterialId V → ℕ → LearningTarget V
material-revision material-id revision-index = material-target material-id (suc revision-index)
```

Revision-bound targets prevent mutable content from silently changing the
meaning of historical evidence. Segment identity is authored and stable; byte
or character offsets are not durable identities.
