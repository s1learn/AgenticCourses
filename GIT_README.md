GIT SETUP & COMMIT GUIDE — expense-tracker-ai
==============================================

These are the exact steps used to initialise a local git repository and push
the project to a remote (GitHub / GitLab / Azure DevOps, etc.).

All commands are run from the project root:
  cd C:\LocalProject2\ai-experiements\expense-tracker-ai


── STEP 1 · Initialise the local repository ──────────────────────────────────

  git init
  git branch -M main          # rename default branch to 'main'


── STEP 2 · Stage all files ──────────────────────────────────────────────────

  git add .

  Files excluded by .gitignore (not staged):
    node_modules/   – npm packages (restored via npm install)
    .next/          – Next.js build cache
    .env*.local     – local environment variables


── STEP 3 · Create the initial commit ────────────────────────────────────────

  git commit -m "Initial commit: Next.js 14 expense tracker app"


── STEP 4 · Create a remote repository ──────────────────────────────────────

  On GitHub:
    1. Go to https://github.com/new
    2. Name the repo (e.g. expense-tracker-ai)
    3. Set to Public or Private
    4. Do NOT initialise with README / .gitignore / licence (repo must be empty)
    5. Click "Create repository" and copy the HTTPS or SSH URL shown


── STEP 5 · Connect local repo to remote ─────────────────────────────────────

  git remote add origin <REMOTE_URL>

  Example (HTTPS):
    git remote add origin https://github.com/<your-username>/expense-tracker-ai.git

  Example (SSH):
    git remote add origin git@github.com:<your-username>/expense-tracker-ai.git

  Verify the remote was added:
    git remote -v


── STEP 6 · Push to remote ───────────────────────────────────────────────────

  git push -u origin main

  The -u flag sets 'origin main' as the upstream, so future pushes only
  need: git push


── REORGANISING FILES INTO A SUBFOLDER (done for this repo) ─────────────────

  Use this when you want to nest a project under a subfolder inside an
  existing remote repo (e.g. adding expense-tracker-ai/ to AgenticCourses).

  # 1. Clone the existing remote repo to a temp location
  git clone https://github.com/s1learn/AgenticCourses /tmp/AgenticCourses
  cd /tmp/AgenticCourses

  # 2. Remove any build artifacts / sensitive files that were committed by mistake
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

  Remote repo after this: https://github.com/s1learn/AgenticCourses
  Project subfolder:       expense-tracker-ai/


── SUBSEQUENT COMMITS (day-to-day workflow) ──────────────────────────────────

  # Check what changed
  git status
  git diff

  # Stage specific files (preferred over 'git add .')
  git add src/components/MyComponent.tsx src/hooks/useExpenses.ts

  # Commit with a descriptive message
  git commit -m "feat: add budget limit warning to dashboard"

  # Push
  git push


── USEFUL COMMANDS ───────────────────────────────────────────────────────────

  git log --oneline -10       # last 10 commits
  git diff HEAD               # all unstaged changes vs last commit
  git restore <file>          # discard unstaged changes to a file
  git stash                   # temporarily shelve uncommitted work
  git stash pop               # restore stashed work


── PROJECT NOTES ─────────────────────────────────────────────────────────────

  Stack      : Next.js 14 · TypeScript · Tailwind CSS · Recharts
  Dev server : npm run dev  →  http://localhost:3000
  Build      : npm run build
  Lint       : npm run lint
  Type check : npx tsc --noEmit

  Data is stored entirely in the browser (localStorage key: expense-tracker-v1).
  There is no backend, database, or .env file required to run this project.
