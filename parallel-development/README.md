# Parallel Feature Development with Worktrees and Subagents

This folder is a workspace for building several features of **expense-tracker-ai** at the same time, from one Claude Code session. One custom command, `/parallel-agents`, does all of the following:

1. Creates a separate Git worktree and branch for each feature.
2. Installs dependencies in each worktree.
3. Starts one subagent per feature. The subagents run in parallel, each in its own worktree.
4. Collects each subagent's report and gives you a final summary.

> **What's a worktree?** It's a second (or third…) working copy of the same Git repo, checked out on a different branch, in its own folder. All worktrees share one history, so agents can work on separate branches without getting in each other's way.

---

## 1. Folder layout

Everything depends on running Claude Code from the right folder. Claude Code runs in `parallel-development/`, the **parent** of the project, not inside the project:

```
parallel-development/                        # <- Run Claude Code from HERE
├── .claude/commands/parallel-agents.md      # the custom command
├── README.md                                # this guide
├── expense-tracker-ai/                      # main project (its own git repo)
├── expense-tracker-<feature-a>/             # worktree, created by the command
└── expense-tracker-<feature-b>/             # worktree, created by the command
```

The command creates each worktree at `../expense-tracker-[feature-name]`, relative to the main project. That puts all the worktrees next to the project, inside this folder.

---

## 2. One-time setup

### Step 1: Clone the project into this folder

`expense-tracker-ai/` must be a **standalone** Git repo, because worktrees need a repo of their own. The copy at `ai-experiements/expense-tracker-ai/` is part of the outer `ai-experiements` repo, so don't use it. Clone a fresh copy here instead.

```powershell
cd C:\LocalProject2\ai-experiements\parallel-development
git clone -b feature-data-export-v3 https://github.com/s1learn/AgenticCourses.git expense-tracker-ai
```

On GitHub, the `feature-data-export-v3` branch has the app at the top of the repo, with the Export Hub and its docs. New feature branches start from that branch. To start from v1 or v2 instead, put that branch name after `-b`.

### Step 2: Install dependencies in the main project (optional)

The command installs dependencies in each worktree. The main project only needs them if you plan to build or run it there.

```powershell
cd expense-tracker-ai
npm install
```

### Step 3: Check the command file is in place

`.claude/commands/parallel-agents.md` must be in this folder. Claude Code only picks up custom commands from the folder it was started in. A backup copy is kept in [`claude-code-commands/parallel-agents.md`](../claude-code-commands/parallel-agents.md), because the repo's `.gitignore` ignores `.claude/` folders.

---

## 3. Run the parallel workflow

### Step 1: Start Claude Code in this folder

**Terminal**
```powershell
cd C:\LocalProject2\ai-experiements\parallel-development
claude
```

**VS Code extension.** Use **File → Open Folder…** and choose `parallel-development`, then open Claude Code. The extension runs in whichever folder is open in VS Code. If the whole `ai-experiements` folder is open, the command won't be found and the paths will be wrong.

### Step 2: Run the command with your features

```
/parallel-agents Implement a simple top expense categories page and a simple top vendors page
```

List the features in plain English. Claude names each one, for example `top-expense-categories` and `top-vendors`.

### Step 3: Approve the prompts

Unless you've pre-approved these commands, Claude asks for permission for `git worktree add`, `npm install` and the subagents' file edits and builds. To avoid repeated prompts, approve each one with "don't ask again" for the session.

### Step 4: Watch it work

You'll see roughly this sequence:

```
⏺ Bash(git -C expense-tracker-ai worktree add ../expense-tracker-top-expense-categories -b feature/top-expense-categories)
⏺ Bash(git -C expense-tracker-ai worktree add ../expense-tracker-top-vendors -b feature/top-vendors)
⏺ Bash(git -C expense-tracker-ai worktree list)
⏺ Bash(cd expense-tracker-top-expense-categories && npm install)
⏺ Bash(cd expense-tracker-top-vendors && npm install)
⏺ Task(Implement top expense categories)   ← running in parallel
⏺ Task(Implement top vendors page)         ← running in parallel
```

Each subagent edits only its own worktree. When it's done, it checks its work with `npx tsc --noEmit`, `npm run lint` and `npm run build`; the project has no test suite. It never starts the dev server.

### Step 5: Read the final summary

When both subagents finish, Claude reads their reports and summarises:

- what each feature does and where its page lives (for example `src/app/categories/page.tsx`)
- the files each branch created or changed
- conflicts to expect when merging. Both features usually add a link to `src/components/Navigation.tsx`.
- the next steps for merging

Each subagent's detailed report is saved in the main project:

```
expense-tracker-ai/top-expense-categories.work.txt
expense-tracker-ai/top-vendors.work.txt
```

---

## 4. Review and merge the features

### Try a feature on its own

Each worktree is a full copy of the app. Run it in its own terminal; don't start it from Claude Code:

```powershell
cd C:\LocalProject2\ai-experiements\parallel-development\expense-tracker-top-vendors
npm run dev -- -p 3001     # use a different port for each worktree
```

### Merge into the main project

```powershell
cd C:\LocalProject2\ai-experiements\parallel-development\expense-tracker-ai
git merge feature/top-expense-categories
git merge feature/top-vendors        # expect a conflict in Navigation.tsx
```

To fix the `Navigation.tsx` conflict, keep **both** new nav links, then run `git add` and `git commit`. Before you push, check that the merged app still builds with `npm run build`.

### Clean up the worktrees

```powershell
git worktree remove ../expense-tracker-top-expense-categories
git worktree remove ../expense-tracker-top-vendors
git branch -d feature/top-expense-categories feature/top-vendors
git worktree prune
```

Always use `git worktree remove` rather than deleting the folder in Explorer. If you delete the folder, Git still thinks the worktree exists until you run `git worktree prune`.

---

## Troubleshooting

**`/parallel-agents` isn't recognised.**
Claude Code was started in the wrong folder. Restart it in `parallel-development`, or open that folder in VS Code.

**`fatal: not a git repository` when creating worktrees.**
`expense-tracker-ai/` here isn't a standalone repo, probably because it was copied instead of cloned. Delete it and clone again (setup step 1).

**`fatal: a branch named 'feature/x' already exists`.**
A previous run left the branch behind. Delete it with `git branch -D feature/x`, or ask for a different feature name.

**`'../expense-tracker-x' already exists`.**
A previous run left the worktree behind. Run `git worktree remove ../expense-tracker-x --force`, or run `git worktree prune` if the folder is already gone.

**The subagents went to the wrong folders.**
Ask Claude to use absolute paths, for example `C:\LocalProject2\ai-experiements\parallel-development\expense-tracker-top-vendors`. Saying exactly which folder to work in makes the command more reliable.

**The outer `ai-experiements` repo shows thousands of new files.**
The clone and the worktrees are ignored by the root `.gitignore` rule `parallel-development/expense-tracker*/`. Make sure that line is still there.

**`npm install` is slow.**
Each worktree gets its own `node_modules` (about 340 packages), so expect roughly 5–30 s per worktree.

---

## Related

- [`claude-code-commands/`](../claude-code-commands/): the other custom commands in this course (`document-feature`, `code-review`, `api-test`)
- [Export Hub technical reference](../expense-tracker-ai/docs/dev/export-hub-implementation.md): the feature that new branches start from
