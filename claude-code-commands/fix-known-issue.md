# Fix Known Issue Command

Reproduce, fix and close a known issue listed in `CLAUDE.md` §8: **$ARGUMENTS**

Usage: `/fix-known-issue cleared export history comes back`, or `/fix-known-issue all` to list the issues and pick one.

---

## Phase 1: Identify
1. Read `CLAUDE.md` §8 and match `$ARGUMENTS` to exactly one entry.
   - If `$ARGUMENTS` is `all` or matches nothing, list every §8 entry with a one-line impact rating (High / Medium / Low) and **stop** so the user can choose.
   - If it matches more than one entry, list the matches and ask.
2. Find the code by **symbol name** from the entry (e.g. `useLocalStorage`, `HistoryTab`, `exportToPDF`). Don't rely on line numbers.

## Phase 2: Reproduce (before touching code)
Write the reproduction steps as the user would perform them in `npm run dev`. Examples:

| Issue | Reproduction |
|---|---|
| Cleared history returns | Export Hub → export a template → History → Clear All → Templates → export again → History shows old rows |
| Schedule overwritten | Schedule → enable + save → close hub → reopen → Schedule shows defaults → Save → saved config lost |
| PDF XSS | Add expense with description `<img src=x onerror=alert(1)>` → Export Hub → Monthly Summary → alert fires |
| Lost update | Integrations → click Connect on two cards within 1.5s → only one ends up connected |

If you can't reproduce it, **stop**. Report what you tried and suggest removing or rewording the §8 entry.

## Phase 3: Root cause & fix
1. State the root cause in one or two sentences.
2. `git checkout -b fix-<short-name>`.
3. Make the **smallest fix at the root**:
   - Fix shared hooks in the hook itself, not at every call site. For example, `useLocalStorage` should use `setStoredValue(prev => …)` and a `useCallback`-wrapped setter.
   - Fix duplicated state by giving it a single owner and passing it down as props.
   - Fix unescaped HTML with a small `escapeHtml()` in `src/utils/`, applied to *every* interpolated value.
   - Replace silent failures with a visible error. Use the `addToast(message, 'error')` pattern from `page.tsx`, or inline error text.
4. Don't refactor unrelated code in the same change. Note any follow-ups instead.

## Phase 4: Regression check
1. Rerun the Phase 2 steps and confirm the bug is gone.
2. Check every other caller of the code you changed. For a change to `useLocalStorage`, recheck expense add/edit/delete, persistence after reload, and all four Export Hub storage keys.
3. `npm run verify` passes.
4. If a test runner exists, add a test that fails without the fix.

## Phase 5: Close
1. Remove the entry from `CLAUDE.md` §8. If the fix created a new rule (e.g. "always escape PDF values with `escapeHtml`"), add it to §6.
2. Update `docs/dev/*-implementation.md` if that doc lists the issue under "Edge Cases and Gotchas".
3. Commit with `fix: <what was wrong>`, and give the root cause in the commit body.

## Output
```
🐞 Issue:       <§8 entry title>
🔁 Reproduced:  yes — <steps summary>
🎯 Root cause:  <one sentence>
🔧 Fix:         <files changed>
✅ Regression:  original steps ✓  other callers ✓  verify ✓
📝 CLAUDE.md:   §8 entry removed; §6 rule added: <yes/no>
```
