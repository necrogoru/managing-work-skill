# Goal mode

Use it when the outcome is clear and the path isn't. There is no task list: you iterate until the
criteria hold.

## 1. Define

Write `goal.md` with the user, regenerate the progress page and wait for their approval:

    # <Goal>
    ## Goal
    <the outcome, in one or two sentences>
    ## Success criteria
    - [ ] K1 · <criterion> (check: `<command>` or <exact observation>)
    ## Limits
    - Out of scope: <...>
    - Stop and ask after <N> iterations without progress, or if <condition>.
    ## Log

Each criterion must be checkable by a command, or by an observation anyone would read the same way.
"Faster" isn't one; "p95 under 200 ms in `<bench>`" is. Keep only the criteria the user asked for;
anything else goes to Out of scope.

## 2. Iterate

Each iteration:

1. Check every criterion and note which ones fail.
2. Pick the smallest step that moves a failing criterion. Do it yourself, or hand it to a fresh
   subagent with the prompt from `stages-mode.md`: `goal.md` replaces `definitions.md` and the step
   replaces the task.
3. Every code change comes with its test.
4. Check again. Mark `[x]` only on evidence, and unmark any criterion that regressed.
5. Add a Log entry: `### <n> · <date>`, then one line each for what you tried, the result and the
   criteria now.
6. Regenerate the page.

Stop when every criterion holds, when a Limit is hit, or when the same failure repeats twice, and
report to the user with the Log.

## 3. Close

Check every criterion again in one pass, since an early one can regress. Run the project's whole
suite, run the Self-review in `SKILL.md`, then report.
