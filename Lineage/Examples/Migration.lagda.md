# Corpus migration examples

The checked histories demonstrate a valid forward chain, rejection of a gap in
version continuity, rejection of a backward migration, and preservation of the
final format version through denotation.

```agda
{-# OPTIONS --safe #-}
module Lineage.Examples.Migration where

open import Data.Bool.Base using (true; false)
open import Data.List.Base using ([]; _∷_)
open import Data.Nat.Base using (ℕ)
open import Relation.Binary.PropositionalEquality using (_≡_; refl)
import Lineage.Correctness.Migration as C
import Lineage.Denotation.Migration as D
import Lineage.Implementation.Migration as I
import Lineage.Validation.Migration as V

one-to-two : I.Step ℕ ℕ ℕ
one-to-two = I.step 10 1 2 100 200

two-to-four : I.Step ℕ ℕ ℕ
two-to-four = I.step 11 2 4 101 400

three-to-four : I.Step ℕ ℕ ℕ
three-to-four = I.step 12 3 4 102 401

two-to-one : I.Step ℕ ℕ ℕ
two-to-one = I.step 13 2 1 103 100

validHistory : I.History ℕ ℕ ℕ
validHistory = I.history 1 (one-to-two ∷ two-to-four ∷ [])

gappedHistory : I.History ℕ ℕ ℕ
gappedHistory = I.history 1 (one-to-two ∷ three-to-four ∷ [])

backwardHistory : I.History ℕ ℕ ℕ
backwardHistory = I.history 2 (two-to-one ∷ [])

valid-chain-proof : V.valid validHistory ≡ true
valid-chain-proof = refl

gap-rejection-proof : V.valid gappedHistory ≡ false
gap-rejection-proof = refl

backward-rejection-proof : V.valid backwardHistory ≡ false
backward-rejection-proof = refl

current-version-proof : V.currentVersion validHistory ≡ 4
current-version-proof = refl

semantic-current-version-proof :
  C.semanticCurrentVersion (D.denote validHistory) ≡ 4
semantic-current-version-proof = refl
```
