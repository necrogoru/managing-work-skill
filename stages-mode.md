# Stages mode

Four steps, in order. Each one finishes before the next starts.

## 1. Explore?

Ask the user whether anything needs exploring first (existing code, options, external docs) and
what. If so, explore with read-only subagents in parallel, one per question, and keep only their
conclusions: they go into `definitions.md` → Context. Report each finding to the user as what
breaks, for whom and how badly first; commits and paths come after.

## 2. Propose

Write the two files below, regenerate the progress page, show both to the user and wait for their
approval before executing. Before showing them, cut: for each Decision the simpler option wins
unless a requirement rules it out, and anything nobody asked for goes to Scope → out. When a spec
exists, check each Decision against its text. Re-read the Project rules and check that every planned
task can satisfy them; if a rule is absolute, say how the change meets it or who is exempt. Before a
Decision relies on existing code, trace the
main path through that code once and note what you ran or read; state each Decision as the outcome
it must achieve, not an existing example to copy. If untrusted input (people, other tenants, model
output) reaches a prompt, query, path or client that acts on it, list each such boundary in Context
and give it one hostile case in Acceptance.
For a reusable piece (component, library, API), Acceptance names its main real host contexts (e.g.
inside a modal, a scrolling panel), not only its showcase page.

`definitions.md` holds everything a task's agent needs and nothing else:

    # <Feature>
    ## Goal         the outcome, for whom, in one or two sentences
    ## Scope        in / out
    ## Context      exploration conclusions; existing code to reuse, with paths
    ## Decisions    each with a one-line why
    ## Contracts    names, data shapes and interfaces that tasks share
    ## Acceptance   verifiable criteria
    ## Project      test/build commands and the project rules that apply

`tasks.md` has one box per task. A task is small enough for one agent in one go and is proven by
one check:

    # <Feature>
    ## <Stage>
    - [ ] T1 · <imperative title>
      - Does: <the change, in a sentence or two>
      - Files: <paths, including shared test helpers the Test touches and existing tests that assert
        the code it changes (grep them)>
      - Needs: <task ids, or none>
      - Test: `<command>` (what it proves; add the project's guards that scan the files it adds)
    ## Closing
    - [ ] C1 · Full suite, build and checks pass (`<commands>`)
    - [ ] C2 · Independent review against definitions.md

Prefer fewer, meaningful tasks over many trivial ones.

### Large work

When the list passes 8 tasks (not counting Closing), the work is too big for one conversation. Keep
it as one piece of work in one `tasks.md`, planned to span several conversations:

- Group the tasks into stages of 3 to 8. Each stage ends in something that works and is tested on
  its own, and its tasks' `Needs` point only to the same or earlier stages.
- Publish the progress page as an artifact if there is a tool for it (in Claude Code, the Artifact
  tool) and write its URL under the title of `tasks.md` as `Tracking: <url>`.
- Write one prompt per stage in `.work/<slug>/prompts.md`, filled in from this template, and show
  them with the proposal:

      Use the managing-work skill to continue "<feature>" in <absolute repo path>.
      Work only on stage "<stage>" of .work/<slug>/tasks.md (<task ids>), following step 3 of
      stages-mode. When its boxes are all [x], run the project's suite and build; if they fail,
      add a task to this stage to fix it. Then report, end with the next stage's prompt from
      .work/<slug>/prompts.md, and stop: the next stage runs in a new conversation.

  The last stage's prompt adds: "Then run step 4, Close with tests, and the Self-review."
- Once the user approves, this conversation stops. Each stage, starting with the first, runs in a
  new conversation from its prompt.

## 3. Execute

You orchestrate and fresh subagents implement. Only you edit `.work/`.

- Anything a task needs that lives only in the conversation goes into `definitions.md` first.
- When the base branch moves during the work, re-check Context before the next task.
- When the work spans several worktrees or repos, give every command its directory explicitly
  (absolute paths, `git -C`); never rely on the shell's current directory.
- Take the tasks whose `Needs` are done. Run them in parallel only if they share no files and their
  tests can't see each other's half-done work; otherwise run them one at a time.
- Mark each one `[~]` and regenerate the page when you dispatch it.
- Use a subagent that starts empty (in Claude Code, `general-purpose`, never a fork). Its prompt is
  exactly this:

      Implement one task of "<feature>" in <absolute repo path>.

      Read first, it is the source of truth: <absolute path>/definitions.md

      Your task:
      <the task's block, copied verbatim from tasks.md>

      Already done that you build on: <one line per task in Needs, or "nothing">

      Bar: the simplest solution that meets the task; small focused files; code that reads like its
      surroundings; comments only for a non-obvious why; no slop. Stay within the task's Files; if
      something else must change, or the definitions look wrong, stop and say why.
      If the Test is a new test, write it first and watch it fail. Don't edit .work/ and don't commit.

      Reply with: done or blocked (why), files changed, the test command with its last output
      lines, and any doubt about the definitions.

- When it reports back, read the diff and run the task's test yourself, because a reported "done"
  can be wrong; a test against a live model or other nondeterministic service must pass three runs
  in a row. If it passes, mark `[x]`, add one `- Done:` detail line and regenerate the page. If
  it's blocked or the definitions were wrong, settle it with the user, fix `definitions.md`, then
  retry.
- Commits follow the project's rules and the user's say-so.
- If the user names another execution skill, use its implementer and reviewer loop, but `tasks.md`
  stays the only ledger and you commit as the orchestrator.

## 4. Close with tests

- C1: run the whole suite, the build and the project's checks yourself.
- C2: give a fresh subagent only `definitions.md`, the diff and the Bar text from step 3. It checks
  every Acceptance criterion and the Bar, and reports gaps as file:line.
- Each gap becomes a new task in `tasks.md` (so the percentage drops honestly) and goes back through
  step 3.
- When every box is `[x]`, run the Self-review in `SKILL.md`, then tell the user what was built
  and how it was verified, ending with any steps left to them (merge, deploy, publish) as a
  numbered list.
