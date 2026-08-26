# Executable repetition history representation

The executable history stores events newest-first. Appending a factual review is
therefore constant-time cons rather than a traversal of the full history. The
representation order is deliberately not the semantic order.

```agda
{-# OPTIONS --safe #-}

module Lineage.Implementation.RepetitionHistory where

open import Data.List.Base using (List; []; _∷_)
open import Level using (Level)

private
  variable
    e : Level
    Event : Set e
```

```agda
record History (Event : Set e) : Set e where
  constructor history
  field
    newest-first : List Event

open History public

empty : History Event
empty = history []

append : History Event → Event → History Event
append prior event = history (event ∷ newest-first prior)
```

No operation exposes `newest-first` as chronological meaning. Consumers obtain
ordered events through denotation or a proved derived operation.
