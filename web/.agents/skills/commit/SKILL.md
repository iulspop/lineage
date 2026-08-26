---
name: commit
description: Commits staged changes using the conventional commits format with proper type, scope, and description. Use when committing code changes to maintain a clean, standardized git history.
---

# Conventional Commit

Commit the current changes using conventional commits format:

`"$type${[(scope)]}{[!]}: $description"` where `[]` is optional and `!` is a breaking change

Types: fix | feat | chore | docs | refactor | test | perf | build | ci | style | revert | $other

ConventionalCommit {
  Constraints {
    Limit the first commit message line to 50 characters.
    Use a scope, title, and body.
    When committing, never mention logging in the commit message.
    Do NOT add new things to the CHANGELOG.md file.
  }
}
