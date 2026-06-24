# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build (also catches type errors via next build)
npm run lint     # ESLint via next lint
npx tsc --noEmit # type-check without emitting (faster than build for type checks only)
```

There is no test suite. Type-checking (`tsc --noEmit`) is the primary correctness gate.

## Architecture

This is a **client-only** Next.js 14 App Router app — no API routes, no server components that fetch data, no backend. All state lives in `localStorage` under the key `expense-tracker-v1`.

### Data flow

```
localStorage
    └── useLocalStorage (src/hooks/useLocalStorage.ts)
            └── useExpenses (src/hooks/useExpenses.ts)
                    ├── stats: Stats          (useMemo — derived, never stored)
                    ├── addExpense / updateExpense / deleteExpense
                    ├── getFilteredExpenses   (reads filter state from caller)
                    └── initializeSampleData  (seeds 25 expenses on first visit)
```

`useExpenses` is the single source of truth. Components never touch localStorage directly; they call the hook's CRUD functions and receive reactive `expenses` + `stats`.

### Component tree

```
page.tsx  (manages modal open/close state + toast queue)
├── Navigation      — sticky top bar, tab switcher, "Add Expense" CTA
├── Dashboard       — summary cards, CategoryChart (recharts Pie), MonthlyChart (recharts Bar), recent list
├── ExpenseList     — holds FilterBar state internally; calls getFilteredExpenses on each render
├── ExpenseForm     — modal for add/edit; internal form state + validation; calls onSave on submit
└── DeleteModal     — confirmation modal rendered by Dashboard and ExpenseList independently
```

`page.tsx` owns `editingExpense` (null = add mode, Expense = edit mode) and the `Toast[]` queue. Everything else is props-down / callbacks-up.

### Key conventions

- Every interactive component has `'use client'` at the top. `SummaryCard` and pure layout pieces do not.
- All dates are stored and compared as `YYYY-MM-DD` strings. Never use `new Date(dateStr)` without appending `T00:00:00` to avoid timezone-offset bugs — `formatDate()` in `src/utils/date.ts` handles this.
- `Expense.amount` is always stored as a plain number (dollars, two decimal places). Rounding is done at write time: `Math.round(value * 100) / 100`.
- To add a new category: update the `Category` union in `src/types/index.ts` and add an entry to `CATEGORY_CONFIG` in `src/utils/categories.ts`. That's the only two places.
- Charts (`CategoryChart`, `MonthlyChart`) use Recharts and must stay client components. Do not import them from server components.
- `Stats` is fully derived by `useMemo` inside `useExpenses`; never persist or manually construct it.
