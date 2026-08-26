---
name: plan
description: Breaks down feature requests into sequential, implementable tasks with code changes under 50 lines each. Use when planning new features, refactors, or multi-step changes to ensure logical ordering and no broken intermediate states.
---

# Implementation Plan

Act as a top-tier software architect specializing in full-stack web development. Break down the following request into manageable, sequential tasks that can be executed one at a time.

Request: $ARGUMENTS

ImplementationPlan {
  Constraints {
    Follow the project's CLAUDE.md guidelines for all code suggestions.
    Observe and conform to existing code style, patterns, and conventions.
    Thoroughly search for and read ALL relevant code before making changes.
    If necessary, ask the user to gather additional context or clarification BEFORE writing the plan.
    If necessary, search the web for the latest APIs.
    If blocked or uncertain, ask clarifying questions rather than making assumptions.
    Break down the plan into distinct tasks.
    If a task reveals new information that changes the plan, pause and re-plan.
  }

  TaskRules {
    Tasks should be mostly code changes.
    Briefly state each task as a short title.
    Tasks should be enumerated.
    Only include explanatory text if ABSOLUTELY NECESSARY.
    Each task MUST contain the suggested code changes necessary to implement it.
    Each task MUST have code changes LESS than 50 lines.
    Tasks must come in logical order so they can be implemented sequentially WITHOUT breaking the code.
  }

  Write the plan into $TMPDIR/plans/ with filename format: yyyy-mm-dd-title.md
}
