# CLAUDE.md Playbook

A repeatable process for creating, auditing and updating [CLAUDE.md](../../CLAUDE.md) for this project.

> **Why the live file isn't in `docs/`**: Claude Code automatically loads `CLAUDE.md` from the project root (and from parent folders of the working directory). A copy in `docs/` would never be loaded and would drift out of date. So the **live** file stays at `expense-tracker-ai/CLAUDE.md`, and the **process** for maintaining it lives here.

---

## When to run it

| Trigger | Scope |
|---|---|
| New feature merged to `main` | Full refresh |
| New folder, storage key, dependency, npm script or convention | Update the affected sections only |
| A known issue in §8 was fixed | Remove it from §8 |
| Claude repeated a mistake twice | Add a one-line rule where it would have prevented it |
| Every ~10 feature merges, or quarterly | Full audit, even if nothing seems stale |

## Principles (what makes a good CLAUDE.md here)

1. **Verified, not remembered.** Every path, key, script and claim must be checked against the code on `main` at the time you write it.
2. **Specific beats generic.** "Dates are `YYYY-MM-DD`. Never call `new Date(dateStr)`" works. "Handle dates carefully" doesn't.
3. **Rules come with recipes.** Each extension point says *where* to change code and *what else* must change with it.
4. **Point to code by symbol name, not line number.** Line numbers drift; function and type names don't.
5. **Short enough to stay loaded.** Aim for under ~250 lines. Move long references into `docs/dev/` and link to them.
6. **Record known issues so they aren't copied.** A bug listed in §8 stops Claude from copying the pattern.

## Section contract

CLAUDE.md always has these sections, in this order. Keep the numbering, because the sections cross-reference each other.

| § | Section | Must contain |
|---|---|---|
| 1 | Where you are | git root vs app root, branch layout quirks, what's gitignored |
| 2 | Commands | every `package.json` script that matters, plus the test status |
| 3 | Definition of done | branch, plan, `verify`, manual browser checks, tests, docs, commit style |
| 4 | Repository map | folder tree that matches `ls` output, plus a "where new code goes" table |
| 5 | Architecture | data flow, component tree with state owners, **localStorage key registry**, real vs simulated |
| 6 | Conventions | invariants (dates, money, IDs, categories, client boundary, hydration, imports, styling, deps) |
| 7 | Extension recipes | one short paragraph per common extension |
| 8 | Known issues | verified bugs and anti-patterns, by symbol name |
| 9 | Docs and prompts | doc pair format, prompt archive, what never to commit |

## Steps

### 1. Branch

```bash
git checkout main && git pull
git checkout -b docs-refresh-claude-md
```

### 2. Collect the facts (run from `expense-tracker-ai/`)

```bash
cat package.json                                         # scripts and deps → §2, §6
find src docs prompts -type f | sort                     # tree → §4
grep -rn "useLocalStorage<" src                          # storage keys → §5 registry
grep -rLn "'use client'" src/components                  # server-safe components → §6
grep -rn "ts-expect-error\|ts-ignore\|eslint-disable" src  # suppressions → §8 candidates
find src -name "*.ts*" | xargs wc -l                                     # oversized files → split candidates in §4/§7
git log --oneline -15                                    # what changed since the last refresh
npm run verify                                           # baseline must pass
```

### 3. Audit each section against the facts

- [ ] §1: the layout notes are still true (is the git root still the parent? do the old branches still exist?)
- [ ] §2: every script listed exists in `package.json`, and none are missing
- [ ] §4: the tree matches the files on disk, and new folders are in the "where it goes" table
- [ ] §5: the component tree matches the actual imports, and every `useLocalStorage` key is in the registry
- [ ] §5: the real vs simulated statement is still accurate
- [ ] §6: each invariant still holds (spot-check `utils/date.ts`, `ExpenseForm` validation, `CATEGORY_CONFIG`)
- [ ] §7: each recipe still names real symbols, so walk through one recipe as a dry run
- [ ] §8: each issue is still reproducible. Remove fixed ones and add newly found ones.
- [ ] Nothing describes code that doesn't exist (search for every backticked symbol)

### 4. Write

Edit sections in place. Don't regenerate the whole file from scratch, because hand-added rules would be lost.

### 5. Verify and commit

```bash
npm run verify
git add expense-tracker-ai/CLAUDE.md expense-tracker-ai/docs/ai/
git commit -m "docs: refresh CLAUDE.md"
```

Add a row to the changelog below.

## Ready-to-paste prompt

Use this in a Claude Code session opened at the repo root or in `expense-tracker-ai/`:

```text
Think hard. Refresh expense-tracker-ai/CLAUDE.md by following
expense-tracker-ai/docs/ai/claude-md-playbook.md exactly:
1. Create branch docs-refresh-claude-md from main.
2. Run every command in "Collect the facts" and work through every audit checkbox.
3. Edit CLAUDE.md in place. Keep the 9-section contract, and refer to code by symbol name, not line number.
4. Only state what you verified in the code. List anything you removed or were unsure about.
5. Run npm run verify, add a changelog row to the playbook, and commit.
Show me the diff summary before committing.
```

> Tip: `.claude/` is gitignored in this repo. If you want this as a `/refresh-claude-md` slash command, save the prompt to `expense-tracker-ai/.claude/commands/refresh-claude-md.md` on your machine. To share it with the team, stop ignoring `.claude/commands/` in the root `.gitignore`.

## Changelog

| Date | Change |
|---|---|
| 2026-10-25 | Rewrote CLAUDE.md into the 9-section contract. Added the `typecheck`/`verify` scripts, the storage key registry, extension recipes and verified known issues. Created this playbook. |
