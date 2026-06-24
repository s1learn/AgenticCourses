# Git Setup & Commit Guide

Steps used to initialise a local git repository and push the project to a remote (GitHub / GitLab / Azure DevOps, etc.).

All commands run from the project root:

```bash
cd C:\LocalProject2\ai-experiements\expense-tracker-ai
```

---

## Step 1 — Initialise the local repository

```bash
git init
git branch -M main    # rename default branch to 'main'
```

---

## Step 2 — Stage all files

```bash
git add .
```

Files excluded by `.gitignore` (not staged):

| Path | Reason |
|---|---|
| `node_modules/` | npm packages — restored via `npm install` |
| `.next/` | Next.js build cache |
| `.env*.local` | Local environment variables |

---

## Step 3 — Create the initial commit

```bash
git commit -m "Initial commit: Next.js 14 expense tracker app"
```

---

## Step 4 — Create a remote repository

On GitHub:

1. Go to <https://github.com/new>
2. Name the repo (e.g. `expense-tracker-ai`)
3. Set to Public or Private
4. **Do NOT** initialise with README / .gitignore / licence — the repo must be empty
5. Click **Create repository** and copy the HTTPS or SSH URL shown

---

## Step 5 — Connect local repo to remote

```bash
git remote add origin <REMOTE_URL>
```

**HTTPS example:**
```bash
git remote add origin https://github.com/<your-username>/expense-tracker-ai.git
```

**SSH example:**
```bash
git remote add origin git@github.com:<your-username>/expense-tracker-ai.git
```

Verify the remote was added:
```bash
git remote -v
```

---

## Step 6 — Push to remote

```bash
git push -u origin main
```

The `-u` flag sets `origin main` as the upstream, so future pushes only need `git push`.

---

## Reorganising files into a subfolder

Use this when you want to nest a project under a subfolder inside an existing remote repo (e.g. adding `expense-tracker-ai/` to `AgenticCourses`).

```bash
# 1. Clone the existing remote repo to a temp location
git clone https://github.com/s1learn/AgenticCourses /tmp/AgenticCourses
cd /tmp/AgenticCourses

# 2. Remove any build artifacts / sensitive files committed by mistake
git rm -r .next/ .claude/
git rm next-env.d.ts tsconfig.tsbuildinfo

# 3. Move all source files into the new subfolder
mkdir expense-tracker-ai
git mv .eslintrc.json CLAUDE.md next.config.js package.json package-lock.json \
       postcss.config.js tailwind.config.js tsconfig.json src .gitignore \
       expense-tracker-ai/

# 4. Sync the latest local project files into the subfolder
cp -r /c/LocalProject2/ai-experiements/expense-tracker-ai/. expense-tracker-ai/
rm -rf expense-tracker-ai/node_modules expense-tracker-ai/.next

# 5. Create a root-level .gitignore to prevent recurrence
printf '.claude/\n.next/\nnode_modules/\n.DS_Store\nThumbs.db\n' > .gitignore

# 6. Commit and push
git add -A
git commit -m "refactor: move expense-tracker-ai into subdirectory, remove build artifacts"
git push
```

> **Result:** <https://github.com/s1learn/AgenticCourses> — project lives under `expense-tracker-ai/`

---

## Subsequent commits (day-to-day workflow)

```bash
# Check what changed
git status
git diff

# Stage specific files (preferred over 'git add .')
git add src/components/MyComponent.tsx src/hooks/useExpenses.ts

# Commit with a descriptive message
git commit -m "feat: add budget limit warning to dashboard"

# Push
git push
```

---

## Useful commands

```bash
git log --oneline -10       # last 10 commits
git diff HEAD               # all unstaged changes vs last commit
git restore <file>          # discard unstaged changes to a file
git stash                   # temporarily shelve uncommitted work
git stash pop               # restore stashed work
```

---

## Project notes

| | |
|---|---|
| **Stack** | Next.js 14 · TypeScript · Tailwind CSS · Recharts |
| **Dev server** | `npm run dev` → <http://localhost:3000> |
| **Build** | `npm run build` |
| **Lint** | `npm run lint` |
| **Type check** | `npx tsc --noEmit` |

Data is stored entirely in the browser (`localStorage` key: `expense-tracker-v1`).
No backend, database, or `.env` file is required to run this project.
