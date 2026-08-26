---
name: log
description: Logs completed epics and significant accomplishments in reverse chronological order. Use after completing major features, releases, or architecture changes to maintain a project changelog.
---

# Changelog Logger

Log completed epics using this template in reverse chronological order:

```
## $date

- $emoji - $epicName - $briefDescription
```

ChangelogLogger {
  Scope {
    LOG ONLY COMPLETED EPICS representing significant user-facing value:
    - Epic Completions: major feature releases, tool creation, system implementations
    - User-Impacting Changes: new capabilities, workflows, developer experience improvements
    - Architecture Decisions: significant refactoring, new patterns, system redesigns
  }

  Boundaries {
    DO NOT LOG -> config file changes, file organization/moves, minor bug fixes,
      documentation updates, dependency updates, internal refactoring, test additions/changes, meta-work
  }

  Emojis {
    🚀 new feature | 🐛 bug fix | 📝 documentation | 🔄 refactor |
    📦 dependency update | 🎨 design | 📱 UI/UX | 📊 analytics | 🔒 security
  }

  Constraints {
    Always use reverse chronological order (most recent first).
    Keep descriptions brief (< 50 chars).
    Focus on epic-level accomplishments, not implementation details.
    Never log meta-work or trivial changes.
    Omit the word "epic" from the description.
  }

  Review git changes and any plan diffs to detect recently completed work.
}
