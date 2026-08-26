# Corpus manifest denotation

Denotation preserves corpus identity, declared compatibility requirements,
integrity metadata, and migration history.

```agda
{-# OPTIONS --safe #-}
module Lineage.Denotation.Manifest where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)
import Lineage.Denotation.Migration as M
import Lineage.Implementation.Manifest as I
import Lineage.Specification.Manifest as S

private
  variable
    c p e t d i : Level
    CorpusId : Set c
    ProfileId : Set p
    ExtensionId : Set e
    Timestamp : Set t
    Digest : Set d
    MigrationId : Set i

denoteRequirement : I.Requirement ProfileId → S.Requirement ProfileId
denoteRequirement requiredCapability = S.requirement
  (I.Requirement.capability-id requiredCapability)
  (I.Requirement.version requiredCapability)
  (I.Requirement.necessity requiredCapability)

denoteRequirements : List (I.Requirement ProfileId) →
  List (S.Requirement ProfileId)
denoteRequirements [] = []
denoteRequirements (requiredCapability ∷ requirements) =
  denoteRequirement requiredCapability ∷ denoteRequirements requirements

denote :
  I.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId →
  S.Manifest CorpusId ProfileId ExtensionId Timestamp Digest MigrationId
denote corpusManifest = S.manifest
  (I.Manifest.corpus-id corpusManifest)
  (I.Manifest.format-version corpusManifest)
  (I.Manifest.created-at corpusManifest)
  (I.Manifest.updated-at corpusManifest)
  (denoteRequirements (I.Manifest.profiles corpusManifest))
  (denoteRequirements (I.Manifest.extensions corpusManifest))
  (I.Manifest.integrity-digest corpusManifest)
  (M.denote (I.Manifest.migrations corpusManifest))
```
