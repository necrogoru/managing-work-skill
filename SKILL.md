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

1. If `.work/` already has a folder for this work, read it and resume: `tasks.md` → stages mode,
   the first unchecked task; `goal.md` → goal mode, the last Log entry. Don't ask the mode again.
2. Otherwise, before anything else, find which mode fits the request. Run
   `node <this skill's folder>/scripts/recommend-mode.mjs "<the user's request>"`: it asks Jev
   (key in `TYPESAFE_API_KEY` or this skill's `.env`) and prints its pick and confidence, e.g.
   `goal 0.94`. A confidence of 0.5 or more makes that the
   fitting mode; below 0.5, or if the script fails, judge it yourself with the signals below.
   Then ask the user (with the question tool if there is one): **work it in stages or as a goal?**
   The fitting mode is the first option, marked recommended, and its description gives the why in
   one line taken from the request. Skip the question only if they already said which.
   - **Stages**: what to build is known and splits into tasks to check off, grouped in stages →
     `stages-mode.md`. Signals: a concrete deliverable ("add", "build", "migrate X to Y").
   - **Goal**: the outcome is known, the path isn't; iterate until verifiable criteria hold →
     `goal-mode.md`. Signals: a measurable target or an unknown cause ("under 200 ms", "make it
     pass", "find out why").
3. Create `.work/<slug>/` (short kebab-case). In a git repo, keep it local: append `.work/` to
   `$(git rev-parse --git-path info/exclude)` if it isn't there yet. Never touch `.gitignore`.

## Progress page

After every checkbox change, regenerate the page:

    node <this skill's folder>/scripts/progress.mjs .work/<slug>

It writes `.work/<slug>/progress.html` and prints `done/total (pct%)`. The page reloads itself, so
the first time give the user `open .work/<slug>/progress.html` and leave it open. If `tasks.md` has
a `Tracking: <url>` line, also republish `progress.html` to that artifact after each box marked
`[x]`.

It counts top-level checkboxes: `- [ ]` to do, `- [~]` in progress, `- [x]` done, grouped by `##`
heading. Indented lines under a box are its details.

## Friction log

Whenever the process itself gets in the way, add one line to `.work/<slug>/friction.md`:
`- <date> · <what happened> · <the step of this skill that let it happen>`. Friction is: the user
rejects or corrects a proposal, a reported "done" fails your re-run, a task is blocked by missing
definitions, parallel work collides, a criterion turns out vague, or the same failure repeats.

## Self-review

After the mode's close step, before the final report, review this skill against `friction.md`:

1. For each line, decide whether a different instruction in this skill would have prevented it in
   any project. Problems specific to this project don't count.
2. If none would, end the report with one line: "Self-review: no changes to the skill."
3. Otherwise propose up to three edits, each as: file of this skill, the change in one or two lines,
   the friction it prevents. Ask the user (with the question tool if there is one) which to apply:
   all, some, or none.
4. Apply only what the user accepts, in English, keeping the skill as short as it was.
