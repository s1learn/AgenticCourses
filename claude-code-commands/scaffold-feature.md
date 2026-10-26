# Scaffold Feature Command

Plan and build a new expense tracker feature: **$ARGUMENTS**

Usage: `/scaffold-feature budget alerts when a category passes its monthly limit`

---

## Phase 1: Context (read before planning)
1. Read `CLAUDE.md`, especially §4 (repository map), §5 (architecture and the localStorage key registry), §6 (conventions) and §7 (extension recipes).
2. Read the files this feature will touch. Start with `src/types/index.ts`, `src/hooks/useExpenses.ts` and `src/app/page.tsx`.
3. Check whether a §7 recipe already covers this, e.g. a new category, export template, view or Export Hub tab. If one does, follow it exactly.
4. Check §8 (known issues). If the feature touches one of those areas, say so in the plan.

## Phase 2: Plan (stop for approval)
Think hard, then write `docs/dev/<feature-slug>-plan.md`:

```markdown
# <Feature Name> — Plan
> Requested: $ARGUMENTS
> Date: <YYYY-MM-DD>

## Goal
<1–2 sentences: the user-visible outcome>

## Approach
<chosen design + one alternative considered and why it was rejected>

## Changes
| File | New/Modified | What changes |
|---|---|---|

## State & storage
- Owner component: <which component holds the state; only page.tsx calls useExpenses()>
- New localStorage keys: <`<feature>-<thing>` or "none">
- Changes to `Expense` shape: <none | describe and run /migrate-storage instead>

## Real vs simulated
<Is anything mocked? Say so explicitly.>

## Manual test plan
<numbered browser steps, including empty-data and mobile width>
```

**Stop here and show the plan.** Don't write code until the user approves.

## Phase 3: Implement
1. `git checkout -b feature-<feature-slug>` from an up-to-date `main`.
2. Build in this order: **types → utils (pure) → hooks (state) → components → wiring in the parent**.
3. Follow the §6 conventions:
   - `YYYY-MM-DD` dates through `src/utils/date.ts`
   - `formatCurrency()` for money
   - `'use client'` where needed
   - `@/` imports
   - Tailwind only, with the indigo primary colour
4. A new component file over ~300 lines becomes a folder: `src/components/<feature>/` with an `index.ts` barrel.
5. New overlays must have `role="dialog"`, `aria-modal="true"`, and close on `Escape`.
6. Don't add npm dependencies without asking.

## Phase 4: Verify
1. `npm run verify` passes with zero errors and zero warnings. If the build step can't reach Google Fonts, follow the CLAUDE.md §2 note and report it.
2. Walk through the plan's manual test plan in `npm run dev` and record the result of each step.

## Phase 5: Document & commit
1. Update `CLAUDE.md`: the §4 tree and table if you added folders, the §5 component tree and key registry, and §7 if this feature creates a new extension point.
2. Create the doc pair `docs/dev/<feature-slug>-implementation.md` and `docs/user/how-to-<feature-slug>.md`. Use `docs/dev/export-hub-implementation.md` as the model.
3. Save the original request to `prompts/<feature-slug>.md`.
4. Commit with `feat: <summary>`, one logical change per commit.

## Output
```
✅ Plan:      docs/dev/<slug>-plan.md (approved)
✅ Branch:    feature-<slug>
✅ Files:     <n> created, <n> modified
✅ Storage:   <new keys or "none">
✅ Verify:    typecheck ✓  lint ✓  build ✓/skipped(<reason>)
✅ Manual:    <n>/<n> steps passed
✅ Docs:      CLAUDE.md sections updated: <list>; dev + user docs created
```

## Edge cases
- **Feature needs a backend** (real email, sharing, sync): stop. The app is client-only, so propose either a simulated UI clearly labelled as simulated or an architecture change, and let the user decide.
- **Feature duplicates something on the `feature-data-export-v*` branches**: those branches use the old root layout. Port the code by hand, and never merge them.
