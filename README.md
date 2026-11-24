<img width="150" height="150" alt="workmark-cut" src="https://github.com/user-attachments/assets/bad75251-66bc-482c-a70c-cde9e6388766" />![Uploadi<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title">
  <title id="title">Workmark Cut</title>
  <path fill="#16151b" d="M2 12h16l6 20 5-12h11l3 12 5-20h14L51 53H36l-4-11-3 11H15z"/>
  <path fill="#7d5cff" d="M5 14h11l8 25 7-17 5 12-8 17H17z"/>
  <path fill="#c8f560" d="M31 22h7l5 17 7-25h9L49 51H38l-8-19z"/>
  <path fill="#ff974f" d="M50 14h9l-3 10h-9z"/>
</svg>
    
ng workmark-cut.svg…]()

# managing-work

An agent skill for running a feature, a multi-step task, or an open-ended goal from files on disk
instead of from the conversation, so any session can pick the work up where the last one stopped.

## What it does

- Chooses between two ways of working: **stages** for work that is already known and can be split
  into tasks, and **goal** for an outcome whose path is not known yet.
- Writes the plan down before code exists: `tasks.md` plus `definitions.md`, or `goal.md`.
- Keeps each piece of work in `.work/<slug>/` at the repo root and treats those files as the source
  of truth.
- Regenerates a self-reloading `progress.html` page after every checkbox change.
- Keeps a friction log and reviews the skill itself at the end of the work.

## Modes

| Mode | Use when | Ledger |
| --- | --- | --- |
| Stages | What to build is known and splits into tasks to check off. Signals: "add", "build", "migrate X to Y". | `tasks.md` |
| Goal | The outcome is known, the path is not; iterate until verifiable criteria hold. Signals: "under 200 ms", "make it pass", "find out why". | `goal.md` |

## Requirements

- Node.js 18 or later. Use Node 20.12+ if you keep the TypeSafe key in a `.env` file.
- Optional: `TYPESAFE_API_KEY` in the environment or in this folder's `.env`, used to recommend a
  mode. Without it, the skill falls back to judging from the request's signals.

## Install

Install this folder once in the cross-runtime location, `~/.agents/skills/managing-work`, and let
Claude Code point at it. Runtimes that read `.agents/skills` pick it up directly; a symlink gives
Claude Code the same single copy to update:

```bash
mkdir -p ~/.agents/skills
git clone https://github.com/necrogoru/managing-work-skill.git ~/.agents/skills/managing-work

mkdir -p ~/.claude/skills
ln -s ~/.agents/skills/managing-work ~/.claude/skills/managing-work
```

## Usage

Ask for the work in your own words; the skill handles the rest.

- "Add CSV export to the reports page" — stages mode.
- "Get the checkout flow's p95 under 200 ms" — goal mode.

The agent creates `.work/<slug>/`, writes the plan, asks for approval, then executes and tracks
progress.

## Scripts

| Script | Purpose |
| --- | --- |
| `node scripts/recommend-mode.mjs "<request>"` | Prints the suggested mode and confidence, e.g. `goal 0.94`. |
| `node scripts/progress.mjs .work/<slug>` | Rebuilds `progress.html` and prints `done/total (pct%)`. |

## Files

- `SKILL.md` — entry point and shared rules.
- `stages-mode.md` — explore, propose, execute, close.
- `goal-mode.md` — define criteria, iterate, close.
- `scripts/` — mode recommender, progress generator, and its HTML template.

## Notes

- `.work/` stays local: it is added to `$(git rev-parse --git-path info/exclude)`, never to
  `.gitignore`.
- Only the session running the work edits `.work/`; side questions and forks only read it.
