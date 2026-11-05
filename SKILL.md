---
name: managing-work
description: Use when starting, planning, executing or resuming a feature, a multi-step task or a goal in any project; when asked to break work into a checklist, track how far along it is, work toward an objective until it is met, or continue work that already has a .work/ folder.
---

# Managing work

Each piece of work lives in `.work/<slug>/` at the repo root and is driven from those files, not from
the conversation, so any session can pick it up. Folders and files are in English; talk to the user
in their language.

## Principles

- **Less is more.** The simplest solution that meets the goal with a great experience wins. Good
  engineering solves today's requirement cleanly and stays easy to change; over-engineering adds
  layers, options or abstractions nobody asked for. When unsure, cut.
- **Solid.** Small focused files, code that reads like its surroundings, comments only for a
  non-obvious why. No slop, no dead code.
- **The files are the truth.** Decisions are written down before code exists, and a box is checked
  only on evidence.

## Start

1. If `.work/` already has a folder for this work, read it and resume: `tasks.md` → the first
   unchecked task, `goal.md` → the last Log entry. Don't ask the mode again.
2. Otherwise, before anything else, ask the user (with the question tool if there is one): **work it
   as a task list or as a goal?** Skip the question only if they already said which.
   - **Task list**: what to build is known and splits into tasks to check off → `tasks-mode.md`.
   - **Goal**: the outcome is known, the path isn't; iterate until verifiable criteria hold →
     `goal-mode.md`.
3. Create `.work/<slug>/` (short kebab-case). In a git repo, keep it local: append `.work/` to
   `$(git rev-parse --git-path info/exclude)` if it isn't there yet. Never touch `.gitignore`.

## Progress page

After every checkbox change, regenerate the page:

    node <this skill's folder>/scripts/progress.mjs .work/<slug>

It writes `.work/<slug>/progress.html` and prints `done/total (pct%)`. The page reloads itself, so
the first time give the user `open .work/<slug>/progress.html` and leave it open.

It counts top-level checkboxes: `- [ ]` to do, `- [~]` in progress, `- [x]` done, grouped by `##`
heading. Indented lines under a box are its details.
