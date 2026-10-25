# CLAUDE.md

Guidance for Claude Code when working in `expense-tracker-ai/`.
Maintained with the playbook in [docs/ai/claude-md-playbook.md](docs/ai/claude-md-playbook.md). Keep this file accurate. If you change something it describes, update it in the same change.

**What this is:** a client-only personal expense tracker. It is a Next.js 14 App Router app with React 18, TypeScript (strict), Tailwind 3 and Recharts 2. It has no backend, no API routes and no auth. All data lives in the browser's `localStorage`.

---

## 1. Where you are (read first)

- **The git root is the parent folder** (`ai-experiements/`), not this one. Run every `npm`/`npx` command from `expense-tracker-ai/`. Git paths are shown relative to the parent, e.g. `expense-tracker-ai/src/...`.
- **On `main`, the app lives in `expense-tracker-ai/`.** The `feature-data-export-v1/v2/v3` branches still have the old layout, with the app at the repo root. Do not merge or cherry-pick from them blindly, because paths won't line up. Port changes by hand.
- `.claude/` is gitignored at the repo root, so slash commands and settings here are local-only. Anything the team must share goes in `docs/`.

## 2. Commands

```bash
npm run dev        # dev server → http://localhost:3000
npm run typecheck  # tsc --noEmit (fastest correctness check)
npm run lint       # next lint (eslint-config-next / core-web-vitals)
npm run build      # production build; also type-checks
npm run verify     # typecheck + lint + build: the gate before any commit
```

There is **no test runner yet**. `npm run verify` is the automated gate, and manual checks in the browser cover behaviour (see §3).

`npm run build` needs network access, because `next/font/google` downloads Inter at build time (`src/app/layout.tsx`). Behind a TLS-intercepting proxy it fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. Point `NODE_EXTRA_CA_CERTS` at the proxy's root CA, or run `typecheck` + `lint` and report that the build was skipped. Don't remove the font to make the build pass.

## 3. Definition of done (every change)

1. **Branch first.** Never commit to `main` directly. Use `feature-<short-name>` or `fix-<short-name>`.
2. **Plan first for anything beyond one file.** State the files you'll touch and the approach. For a large feature, save the plan to `docs/dev/<feature>-plan.md` before coding.
3. **`npm run verify` passes** with zero type errors and zero lint warnings. Don't silence errors with `any`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` unless you add a one-line reason.
4. **Check it in the browser** (`npm run dev`):
   - Dashboard and Expenses views both render.
   - Add, edit and delete an expense, and the toast appears.
   - Reload the page and confirm the data persists.
   - Check at mobile width (~375px).
   - If you touched the code path, check with empty data too: DevTools → Application → Local Storage → clear the `expense-tracker-v1` key.
5. **Tests.** If you add a test runner (preferred: Vitest + React Testing Library), add `npm test` to §2, make it part of `verify`, and cover pure logic in `src/utils/` and `src/hooks/` first.
6. **Docs.** For a user-visible feature, add `docs/dev/<feature>-implementation.md` and `docs/user/how-to-<feature>.md` (format in §9). Update this file if you changed structure, storage keys, conventions or known issues.
7. **Commit messages** use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`). Each commit is one logical change.

## 4. Repository map

```text
expense-tracker-ai/
├── CLAUDE.md                  ← this file (auto-loaded by Claude Code)
├── README.md                  ← how to try the v1/v2/v3 export branches + doc links
├── code-analysis.md           ← comparison of the three export implementations
├── prompts/                   ← prompts used to generate features (keep one per feature)
├── docs/
│   ├── ai/                    ← how we work with Claude (CLAUDE.md playbook)
│   ├── dev/                   ← technical references:  <feature>-implementation.md
│   └── user/                  ← end-user guides:       how-to-<feature>.md
└── src/
    ├── app/                   ← Next.js App Router: layout.tsx, page.tsx (app shell), globals.css
    ├── components/            ← one PascalCase component per file, named export
    ├── hooks/                 ← stateful logic: useExpenses (domain), useLocalStorage (persistence)
    ├── types/index.ts         ← all shared domain types
    └── utils/                 ← pure functions only: categories, currency, date, export
```

### Where new code goes

| You're adding… | Put it in | Notes |
| --- | --- | --- |
| A domain type | `src/types/index.ts` | One shared file. Component-private types stay in the component. |
| Pure logic (formatting, calculation, file generation) | `src/utils/<topic>.ts` | No React and no `window` access at module top level |
| Stateful or persisted logic | `src/hooks/use<Thing>.ts` | Build on `useLocalStorage`; never call `localStorage` directly |
| A UI component | `src/components/<Name>.tsx` | Named export, `'use client'` if it has state, events or browser APIs |
| A feature with several components (>~300 lines) | `src/components/<feature>/` with an `index.ts` barrel | `ExportHub.tsx` (665 lines) is the candidate to split this way |

## 5. Architecture

### Data flow

```text
localStorage['expense-tracker-v1']
  └─ useLocalStorage<Expense[]>        (src/hooks/useLocalStorage.ts) returns [value, setValue, isLoaded]
       └─ useExpenses()                 (src/hooks/useExpenses.ts): the single source of truth
            ├─ expenses                 always sorted by date desc
            ├─ stats: Stats             useMemo, derived only, never stored
            ├─ addExpense / updateExpense / deleteExpense
            ├─ getFilteredExpenses(filter)
            └─ initializeSampleData()   seeds 25 expenses if storage is empty
```

### Component tree and state ownership

```text
app/page.tsx  "Home"              owns: activeView, showForm, editingExpense, toasts[]; calls useExpenses()
├── Navigation                    tabs (ActiveView = 'dashboard' | 'expenses') + "Add Expense"
├── Dashboard                     owns: deleteTarget, showHub
│   ├── SummaryCard ×4            (server-safe: no 'use client')
│   ├── CategoryChart             Recharts Pie
│   ├── MonthlyChart              Recharts Bar (last 6 months)
│   ├── ExpenseItem ×6 (recent)
│   ├── DeleteModal
│   └── ExportHub (drawer)        owns: activeTab, history; tabs = Templates | Share | Schedule | History | Integrations
├── ExpenseList                   owns: filter (ExpenseFilter), deleteTarget; "Export CSV" of the filtered rows
│   ├── FilterBar
│   ├── ExpenseItem ×n
│   └── DeleteModal
└── ExpenseForm (modal)           add/edit; owns form state + validation
```

Rules: props go down and callbacks go up. Only `page.tsx` calls `useExpenses()`. Children get `expenses`, `stats` and callbacks as props. Don't add a second `useExpenses()` call or a context without a plan, because each hook instance holds its own copy of state (see §8).

### localStorage keys (registry)

| Key | Shape | Owner |
| --- | --- | --- |
| `expense-tracker-v1` | `Expense[]` | `useExpenses` |
| `export-hub-history` | `HistoryEntry[]` | `ExportHub` + `HistoryTab` (duplicated, see §8) |
| `export-hub-schedule` | `ScheduleConfig` | `ScheduleTab` |
| `export-hub-integrations` | `Record<string, boolean>` | `IntegrationsTab` |

New keys must be added here. Name them `<feature>-<thing>`. If you change the stored shape of an existing key, either write a migration in the hook's read path or bump the version suffix (`-v2`). There is no migration layer today, so old data is just parsed as-is.

### Real vs simulated

Only **file downloads** are real: CSV/JSON via a Blob + `<a download>`, and PDF via `window.open` + `print()`. Share links (`expsnap.app` is fake), the QR code (not scannable), email sending, scheduling and integrations are **UI simulations** built on `setTimeout` and localStorage flags. No network calls exist. Don't describe simulated features as working in docs or UI copy, and don't add real network calls without a design decision.

## 6. Conventions and invariants

- **Dates** are `YYYY-MM-DD` strings, compared lexically (`localeCompare`, `<`/`>`). Never call `new Date(dateStr)` on them, because it parses as UTC and shifts the day. Use `formatDate()` (which appends `T00:00:00`), `formatDateInput(date)`, `getYearMonth()` and `isDateInRange()` from `src/utils/date.ts`. Month keys are `YYYY-MM`.
- **Amounts** are plain `number` dollars, rounded at write time: `Math.round(v * 100) / 100`. Display them only through `formatCurrency()` (USD, `en-US`). Validation in `ExpenseForm` allows `0 < amount ≤ 999,999`, and the description must be 2–200 chars after trimming.
- **IDs** come from `generateId()` → `exp_<timestamp>_<random>`. `createdAt`/`updatedAt` are ISO timestamps set by the hook, never by components.
- **CRUD payloads** use the type `Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>`.
- **Categories**: add or change them only through `Category` (`src/types/index.ts`) and `CATEGORIES` + `CATEGORY_CONFIG` (`src/utils/categories.ts`). `Record<Category, …>` makes the compiler flag any missing config.
- **`Stats` is derived.** Compute it in `useExpenses`'s `useMemo`. Never persist it or build it by hand.
- **Client boundary**: put `'use client'` on any component with state, effects, handlers, Recharts or browser APIs. `SummaryCard` is the only component without it. Guard `window`/`document` use inside effects or handlers so it never runs during SSR or prerender.
- **Hydration**: `useLocalStorage` reads storage in an effect. The first render always sees `initialValue`. Gate UI on `isLoaded` (as `page.tsx` does), and don't seed `useState` from a stored value (see the ScheduleTab bug in §8).
- **Imports**: use the `@/` alias for cross-folder imports (`@/types`, `@/utils/...`) and `./X` for sibling components.
- **Styling**: Tailwind utility classes only. Indigo is the primary colour (`indigo-600` buttons, `indigo-50` active tabs). Cards are `bg-white rounded-2xl shadow-sm border border-gray-100`. The only custom CSS is the `animate-slide-up` / `animate-fade-in` keyframes in `globals.css`.
- **Dependencies**: the runtime deps are `next`, `react`, `react-dom` and `recharts`. Ask before adding any others.
- **Comments**: use them sparingly. Long components use `// ─── Section ───` dividers (see `ExportHub.tsx`). Match the surrounding style.
- **Accessibility gap**: the modals and drawer don't trap focus or handle `Escape`, and they have no ARIA roles. New overlays should add `role="dialog"`, `aria-modal`, `Escape` to close, and a visible focus outline.

## 7. Extension recipes

**Add a category.** Add it to the `Category` union, then add it to `CATEGORIES` and `CATEGORY_CONFIG` (text and background Tailwind classes, an emoji icon and a hex `chartColor`). Nothing else is needed: the charts, filters, form and exports read from these.

**Add an export template.** Add an entry to `EXPORT_TEMPLATES` in `src/utils/export.ts` (`id`, `name`, `icon`, `description`, `format`, `color`). Then add a branch in `runTemplateExport` that picks the subset and the filename. `TemplateId` updates automatically. Update the template table in `docs/dev/export-hub-implementation.md`.

**Add an export format.** Extend `ExportFormat`, write `exportTo<Format>(expenses, filename)` using `downloadBlob`, and add a badge colour in `HistoryTab.formatBadge`. The `Record<ExportFormat, string>` type there will fail to compile until you do.

**Add a top-level view.** Extend `ActiveView` in `Navigation.tsx`, add both desktop and mobile tab buttons, and replace the ternary in `page.tsx` with a switch or lookup once there are more than two views. Pass data down from `page.tsx`. Don't call `useExpenses()` again.

**Add an Export Hub tab.** Add it to the `Tab` union and the `tabs` array, add a `function <Name>Tab()` sub-component, and add a conditional render. If this pushes `ExportHub.tsx` further past ~700 lines, split it into `src/components/export-hub/` first, with one file per tab and shared types in `types.ts`.

**Add an integration card.** Add one entry to the `INTEGRATIONS` array.

**Persist new state.** Use `useLocalStorage<T>('<feature>-<thing>', default)`, register the key in §5, and hold it in **one** component. Pass it down rather than calling the hook twice with the same key.

**Change the `Expense` shape.** Update the type, `buildSampleExpenses`, `ExpenseForm`, the CSV/JSON/PDF exporters, and any filter or sort logic. Then decide between a migration and a key bump (§5).

## 8. Known issues (verified on `main`)

Fix these only when a task covers them, or note them in your summary. **Don't copy these patterns.**

- **`useLocalStorage` updater isn't truly functional.** `setValue(fn)` calls `fn(storedValue)` with the render-time value, not the latest one, and `setValue` isn't memoized. Two updates in one tick lose one, e.g. clicking two integration "Connect" buttons within 1.5s, whose `setTimeout` callbacks then use a stale closure. The fix belongs in the hook: use `setStoredValue(prev => …)` plus a ref or effect for the write, and wrap it in `useCallback`.
- **Cleared export history comes back.** `ExportHub` and `HistoryTab` each call `useLocalStorage('export-hub-history')`. Run Clear All, then export, and the old rows reappear. Fix: keep history in `ExportHub` and pass it down as props.
- **The saved schedule isn't loaded into the form.** `ScheduleTab` does `useState(saved)` before storage has loaded, so pressing Save again overwrites the saved schedule with the defaults.
- **XSS in the PDF export.** `exportToPDF` puts `description` and `filename` into HTML without escaping, then calls `document.write`. Escape every interpolated value.
- **"Download QR" does nothing.** `QrCode` doesn't forward its ref, and `@ts-expect-error` hides this, so `svgRef` is always null.
- **Silent failures.** `window.open` returning null (popup blocked) and a rejected `navigator.clipboard.writeText` both fail without telling the user. Report errors with a toast.
- **Empty template exports.** Tax Report and Monthly Summary can produce a header-only file when no rows match the current year or month.

## 9. Docs, prompts and generated content

- Feature docs follow the existing pair: `docs/dev/export-hub-implementation.md` (technical reference with a component map, data flow, storage, edge cases and security) and `docs/user/how-to-export-hub.md` (second person, one action per step). The two files link to each other.
- Save the prompt that produced each feature in `prompts/<feature>.md`.
- Dates in docs are absolute (`2026-10-25`), never relative.
- Don't commit `.next/`, `node_modules/` or `*.tsbuildinfo`. They are already gitignored.
