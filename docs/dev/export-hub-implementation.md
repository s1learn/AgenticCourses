# Export Hub — Technical Reference

> 👤 **End-user guide**: [docs/user/how-to-export-hub.md](../user/how-to-export-hub.md)

> **Type**: Frontend
> **Status**: Experimental — file exports are real; sharing, email, scheduling and integrations are UI simulations
> **Added**: 2026-10-23 (branch `feature-data-export-v3`)
> **Related**: [CLAUDE.md](../../CLAUDE.md) · [code-analysis.md](../../code-analysis.md) · [prompts/feature-data-export-v3.md](../../prompts/feature-data-export-v3.md) · [README.md](../../README.md)

## Overview

The Export Hub is a right-side drawer, opened from the Dashboard, that groups every way of getting data out of the app: one-click template exports (CSV / JSON / print-to-PDF), share links and a QR code, an email form, a backup schedule, an export history, and connect/disconnect cards for third-party services. It was built as the "cloud-integrated SaaS" take on the export feature (version 3 of 3). The app is client-only, so only the file downloads actually do anything. All other tabs are realistic mockups whose state is stored in `localStorage`.

## Architecture

### Component/Module Map

**Frontend**
- [src/components/ExportHub.tsx](../../src/components/ExportHub.tsx): the drawer shell, tab routing and export history state. It also contains every tab sub-component:
  - `TemplatesTab`: template cards, record count per template, the "✓ Exported!" flash, and history entries for each export
  - `ShareTab`: fake share URL with expiry and regenerate, `QrCode` SVG, simulated email send, "Share to Apps" buttons
  - `ScheduleTab`: draft/saved backup schedule and the "Next backup" preview
  - `HistoryTab`: export log with re-download and a two-step "Clear All"
  - `IntegrationsTab`: connect/disconnect state for 6 services, plus a "Coming Soon" list
  - `QrCode`: a deterministic SVG that looks like a QR code. **It cannot be scanned.**
  - Helpers: `relativeTime`, `computeNextBackup`, `generateToken`
- [src/components/Dashboard.tsx](../../src/components/Dashboard.tsx): owns the `showHub` state and renders the "Export" trigger button (line 98) and `<ExportHub>` (line 143)
- [src/components/ExpenseList.tsx](../../src/components/ExpenseList.tsx): call site of `exportToCSV` (its signature changed to take a `filename`)

**Shared**
- [src/utils/export.ts](../../src/utils/export.ts): `EXPORT_TEMPLATES`, `TemplateId`, `ExportFormat`, `exportToCSV` / `exportToJSON` / `exportToPDF`, `runTemplateExport`
- [src/hooks/useLocalStorage.ts](../../src/hooks/useLocalStorage.ts): persists hub state (see [State Management](#state-management))
- `src/utils/date.ts`, `src/utils/currency.ts`, `src/utils/categories.ts`: formatting and category colours used in the PDF output

### Data Flow

Template export (the only path that produces a file):

```
Dashboard "Export" button
  → setShowHub(true) → <ExportHub expenses>
      → TemplatesTab.handleExport(id)
          → runTemplateExport(id, expenses)            (src/utils/export.ts)
              ├─ filter / sort subset per template
              ├─ exportToCSV | exportToJSON  → Blob → <a download> click
              │  exportToPDF                 → window.open → document.write → print()
              └─ return { recordCount, sizeKb }
          → onExported(HistoryEntry)
      → ExportHub.setHistory([entry, ...prev])  → localStorage 'export-hub-history'
```

What each template exports:

| Template ID | Subset | Format | Filename |
|---|---|---|---|
| `tax-report` | `date` starts with current `YYYY-` | CSV | `tax_report_<YYYY>.csv` |
| `monthly-summary` | `date` starts with current `YYYY-MM` | PDF (print dialog) | `monthly_summary_<YYYY-MM>` |
| `category-analysis` | all, sorted by category | CSV | `category_analysis_<YYYY-MM-DD>.csv` |
| `full-backup` | all | JSON | `full_backup_<YYYY-MM-DD>.json` |

`sizeKb` is an estimate based on `JSON.stringify(subset).length`, not on the bytes actually downloaded.

## Component Props

### `ExportHub`

| Prop | Type | Required | Description |
|---|---|---|---|
| `expenses` | `Expense[]` | Yes | Full expense list (from `useExpenses`). Templates apply their own filtering, so pass the unfiltered list. |
| `onClose` | `() => void` | Yes | Called on a backdrop click or the header ✕ button. The parent unmounts the drawer. |

Only `ExportHub` is exported. The tab components and `QrCode` are private to the module.

### Public utilities (`src/utils/export.ts`)

| Export | Signature | Notes |
|---|---|---|
| `EXPORT_TEMPLATES` | `readonly { id, name, icon, description, format, color }[]` | Single source for template cards and history re-download lookups |
| `runTemplateExport` | `(id: TemplateId, expenses: Expense[]) => { recordCount: number; sizeKb: number }` | Triggers the download and returns metadata |
| `exportToCSV` | `(expenses, filename) => void` | `filename` has no extension. Only the description column is quoted. |
| `exportToJSON` | `(expenses, filename) => void` | Exports `date, category, amount, description` (no `id` or timestamps) |
| `exportToPDF` | `(expenses, filename) => void` | Opens a styled HTML report in a new window and calls `print()` after 500 ms |

## Configuration

There are no environment variables or feature flags. Everything that can be configured is a constant in `ExportHub.tsx`:

| Constant | Purpose |
|---|---|
| `SEED_HISTORY` | 4 demo history rows shown until something is written to `export-hub-history` (includes one `failed` row) |
| `DEFAULT_SCHEDULE` | Initial schedule: disabled, weekly, Monday, 09:00, CSV, email |
| `INTEGRATIONS` | The 6 integration cards (Google Sheets, Dropbox, OneDrive, Notion, Slack, Zapier) |
| Share URL base | Hard-coded `https://expsnap.app/share/<token>`. This is a placeholder domain. |

## State Management

All state is client-side. Persisted state uses `useLocalStorage`, and each of these keys is separate from the main `expense-tracker-v1` store:

| localStorage key | Owner(s) | Shape |
|---|---|---|
| `export-hub-history` | `ExportHub` **and** `HistoryTab` (two separate hook instances) | `HistoryEntry[]` |
| `export-hub-schedule` | `ScheduleTab` | `ScheduleConfig` |
| `export-hub-integrations` | `IntegrationsTab` | `Record<integrationId, boolean>` |

State that is only held in memory and is lost when a tab unmounts or the drawer closes: the active tab, template flash flags, the share token and expiry, email form fields and send state, the schedule draft (`local`), and integration `connecting` flags.

Tabs are rendered conditionally, so switching tabs unmounts the previous tab. Each tab then re-reads its localStorage key on mount.

## Edge Cases and Gotchas

- **Saved schedule is not loaded into the form (bug).** `ScheduleTab` initialises its draft with `useState(saved)`. `useLocalStorage` loads the stored value in an effect, so on the first render `saved` is still `DEFAULT_SCHEDULE`, and the draft never picks up the persisted value. If you reopen the tab and click **Save Schedule**, the user's saved schedule is overwritten with the defaults. Fix: sync `local` from `saved` when the hook's `isLoaded` flips, or keep only one state.
- **Cleared history comes back (bug).** `ExportHub` and `HistoryTab` each call `useLocalStorage('export-hub-history')`. When **Clear All** runs in `HistoryTab`, storage is set to `[]`, but `ExportHub` still holds the old array in memory. The next template export writes `[newEntry, ...oldEntries]`, so the cleared rows reappear. Fix: hold history only in `ExportHub` and pass `history` and `setHistory` to `HistoryTab`.
- **Download QR does nothing (bug).** `QrCode` is a plain function component and does not forward refs. The `ref={svgRef}` prop is silenced with `@ts-expect-error`, so `svgRef.current` is always `null` and `downloadQr` returns early.
- **The QR code is decorative.** The pattern is derived from the token and has the three QR corner markers, but it does not encode the URL.
- **Expiry does nothing.** The "Expires in" select only updates local state, and the URL never changes.
- **Popup blockers stop PDF export silently.** If `window.open` returns `null`, `exportToPDF` does nothing. A history entry is still recorded with status `success`.
- **Empty exports still succeed.** Tax Report and Monthly Summary can match 0 records. In that case they produce a header-only CSV or an empty PDF table and are logged as successful.
- **Re-download uses current data.** History re-download looks up the template by `templateName` and runs it against today's expenses and today's date range, not the original snapshot. It also does not add a new history entry.
- **Clipboard needs a secure context.** `navigator.clipboard` works on `https://` and `http://localhost`, but not over plain HTTP on a LAN IP. The promise has no `.catch`, so a failure shows no feedback.
- **`relativeTime` stops at a week.** Anything 7 or more days old shows as "1 week ago".
- **"Sync Now" has no handler**, and the "Share to Apps" buttons only show an "Opening …" message for 2 s.
- **Seed history is shown until the first write.** New users see 4 fake rows, which are never persisted until the user exports or clears the history.
- `ShareTab` accepts an `expenses` prop it never uses.

## Accessibility

Current behaviour, with gaps marked ⚠️:

- **Keyboard:** all controls are native `<button>`, `<input>` and `<select>` elements, so you can Tab to them and activate them. ⚠️ The drawer has no focus trap, does not move focus into itself when it opens, and **Esc does not close it**.
- **ARIA:** ⚠️ The drawer has no `role="dialog"` or `aria-modal`, and it is not labelled by its "Export & Share" heading. The tab bar is made of plain buttons without `role="tablist"`, `role="tab"` or `aria-selected`.
- **Icon-only buttons:** ⚠️ The close ✕ button and the schedule on/off toggle have no `aria-label`. The toggle also needs `role="switch"` and `aria-checked`. The history re-download button only has a `title`.
- **Screen readers:** ⚠️ Status changes ("✓ Exported!", "Copied!", "Sending…", "Connecting…") are in-place text swaps with no `aria-live` region, so they are not announced. The emoji icons are read aloud literally.
- **Labels:** the schedule fields use `<label>` elements that are not associated with their inputs (no `htmlFor`/`id`). The email field in the Share tab relies on its placeholder as a label.

## Testing

The project has no automated test suite (see [CLAUDE.md](../../CLAUDE.md)). The correctness gates are:

```bash
# Type-check (primary gate)
npx tsc --noEmit

# Lint
npm run lint

# Manual verification
npm run dev   # http://localhost:3000 → Dashboard → "Export"
```

Manual checklist:
1. Each template card downloads the expected file and filename, and a matching row appears at the top of **History**.
2. Allow popups and run **Monthly Summary**: a print dialog opens with the report.
3. **Share → Copy Link** shows "Copied!". **Regenerate** changes both the URL and the QR pattern.
4. **Schedule**: enable it, change the fields, and save. Reload the page and reopen the tab (this currently reproduces the schedule bug).
5. **History → Clear All → Yes**, then export a template (this currently reproduces the resurrection bug).
6. **Integrations**: Connect shows "Connecting…" for about 1.5 s, then "Connected". The state survives a reload.
7. Clear the `export-hub-*` keys in DevTools → Application → Local Storage to reset the hub.

Test files: none.

## Security Considerations

- **XSS in the PDF export.** `exportToPDF` interpolates `e.description` (and `filename`) into HTML without escaping, then calls `document.write` in a same-origin window. A description such as `<img src=x onerror=alert(1)>` runs script when the report opens. HTML-escape every interpolated value before relying on this feature.
- **The share token is not secret.** `generateToken` uses `Math.random()` and produces 8 hex characters (32 bits). That is fine for a mockup. A real share link would need server-generated tokens from a CSPRNG and a server-side expiry check.
- **No credentials are handled.** Integration "connections" are boolean flags in localStorage. No OAuth runs, and no tokens are stored.
- **No data leaves the browser.** Email, share, schedule and integration actions make no network calls.

## Performance Notes

- All template filtering is O(n) over the in-memory expense list. `templateCounts` is memoised on `expenses`.
- `QrCode` renders up to about 300 `<rect>` elements each time `ShareTab` renders. This is negligible at this size.
- Tabs mount lazily (conditional rendering), so inactive tabs cost nothing, but each mount re-reads localStorage.
- History grows without limit in localStorage. Consider a cap (for example, the last 50 entries) before production.

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-10-23 | Initial implementation (v3 cloud-integrated export) |
