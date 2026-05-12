---
name: dev-notes
description: Access the Obsidian vault dev-notes for project documentation and specs. Use when asked about project history, architecture decisions, stack choices, or roadmap.
license: MIT
---

# Dev Notes

The project documentation lives in `~/Documents/dev/dev-notes/`. Key paths:

- `Projects/weekly-hours-calculator/` — current project specs
- `Areas/Architectures/` — architecture references

## When to use

Load this skill when:

- Starting any task on this project
- Asked about architecture, stack, or roadmap
- Need context on past decisions or specs

## Workflow

1. Use `glob` or `read` to find relevant files in `~/Documents/dev/dev-notes/`
2. Read the relevant markdown docs before proceeding
3. Reference specific files when explaining decisions
