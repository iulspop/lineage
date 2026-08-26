# Repetition history specification

A repetition history means a finite chronological sequence of factual review
events. The oldest event appears first. This semantic order is durable; storage
layout, indexes, scheduler projections, and caches are not.

```agda
{-# OPTIONS --safe #-}

module Lineage.Specification.RepetitionHistory where

open import Data.List.Base using (List; []; [_]; _++_)
open import Level using (Level)

private
  variable
    e : Level
    Event : Set e
```

```agda
History : Set e → Set e
History Event = List Event

empty : History Event
empty = []

append : History Event → Event → History Event
append history event = history ++ [ event ]

events : History Event → List Event
events history = history
```

Append is the only primitive mutation in this initial algebra. Corrections and
retractions will be represented by new factual events rather than by rewriting
prior history.
