# Migrate Storage Command

Safely change the shape of data persisted in `localStorage`: **$ARGUMENTS**

Usage: `/migrate-storage add optional "notes" and "tags: string[]" to Expense`

Users' data lives only in their own browser. Nothing is backed up, so a bad migration destroys their data permanently. Treat this command as high-risk.

---

## Phase 1: Impact analysis
1. Read the key registry in `CLAUDE.md` §5 and find the key that `$ARGUMENTS` affects (usually `expense-tracker-v1` → `Expense[]`).
2. Search for every reader and writer of the affected type or key (`grep -rn "Expense\b" src`, `grep -rn "<key>" src`) and list them:
   - Type: `src/types/index.ts`
   - Persistence: `useLocalStorage` / owning hook (e.g. `useExpenses`)
   - Creation: `ExpenseForm`, `addExpense`, `updateExpense`, `buildSampleExpenses`
   - Reading: filters/sort (`getFilteredExpenses`), `stats` memo, components that render the field
   - Output: `exportToCSV`, `exportToJSON`, `exportToPDF`, `runTemplateExport`
3. Classify the change:
   - **Additive and optional** (new optional field): no data rewrite is needed. Readers must handle `undefined`.
   - **Additive and required / renamed / retyped / removed**: needs a migration.

## Phase 2: Choose a strategy (stop for approval)
Present one recommendation:

| Strategy | When | How |
|---|---|---|
| **A. Tolerant read** | New optional field | Mark it `?:` in the type and give a default at the read site. No version change. |
| **B. Versioned migration** | Required, renamed or retyped field | Read the old key, transform it, write the new key (`expense-tracker-v2`), and keep the old key for one release as a backup |
| **C. In-place normalise** | Small fix-ups to existing records | `normalize(record)` applied on load inside the owning hook |

**Stop and wait for approval.**

## Phase 3: Implement
1. `git checkout -b feature-storage-<short-name>`.
2. Put migration logic in a pure, side-effect-free module, `src/utils/migrations.ts`:
   ```ts
   export function migrateExpensesV1toV2(raw: unknown): Expense[] { /* validate + transform */ }
   ```
   - Validate the input (`Array.isArray`, field types). **Never throw on bad records.** Skip them and count them.
   - The migration must be idempotent: running it twice gives the same result.
3. Run it in the owning hook after load and before first use. Respect `isLoaded`, so UI that depends on the data waits for the migration.
4. Update every reader and writer from Phase 1. Pay attention to these:
   - **CSV**: add the column at the end so existing spreadsheets don't break, and escape quotes.
   - **JSON backup**: include the new field. Consider adding a `version` field to the backup.
   - **PDF**: HTML-escape any new text field.
   - **Sample data**: `buildSampleExpenses` must produce valid new-shape records.
5. Update `CLAUDE.md` §5 (registry: key, shape, migration note) and §6/§7 if the "Change the `Expense` shape" recipe changes.

## Phase 4: Verify with real old data
1. Before changing code, on `main`, run the app and copy the current value: DevTools → Application → Local Storage → `expense-tracker-v1` → save to `docs/dev/fixtures/storage-<short-name>-before.json`.
2. On the branch, reload and check that:
   - every pre-existing expense is still there with its amount, date and category unchanged
   - new and edited expenses save with the new shape
   - the old key is still present as a backup (strategy B)
   - a reload after migration doesn't re-migrate or duplicate records
3. Edge inputs: empty storage (gets sample data), corrupted JSON (falls back without crashing), and a record missing a field (skipped or defaulted).
4. Run all three export formats and confirm the new field appears correctly.
5. `npm run verify` passes.

## Output
```
🗄️  Key:         <old key> → <new key or "unchanged">
📐 Strategy:    A / B / C — <why>
🔎 Touchpoints: <n> files updated (types, hook, form, filters, exports, sample data)
🧪 Old data:    <n> records migrated, <n> skipped, 0 lost
📤 Exports:     CSV ✓  JSON ✓  PDF ✓
✅ Verify:      typecheck ✓  lint ✓  build ✓/skipped(<reason>)
📝 CLAUDE.md:   §5 registry updated
```

## Never
- Delete or overwrite the old key in the same release that introduces the new one.
- Use `new Date(dateStr)` on stored dates while transforming them. Use `src/utils/date.ts`.
- Ship a migration that can throw during app load.
