'use client';

import { useMemo, useCallback } from 'react';
import { Expense, Category, Stats, CategoryStats, MonthlyStats, ExpenseFilter } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { getYearMonth, getMonthLabel, isDateInRange, formatDateInput } from '@/utils/date';

const STORAGE_KEY = 'expense-tracker-v1';

function generateId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function offsetDate(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return formatDateInput(d);
}

function monthDate(base: Date, monthOffset: number, day: number): string {
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, day);
  return formatDateInput(d);
}

function buildSampleExpenses(): Expense[] {
  const now = new Date();
  const ts = now.toISOString();

  const raw: Array<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>> = [
    // Current month
    { date: offsetDate(now, 0),   amount: 52.40,  category: 'Food',           description: 'Grocery run – weekly shop' },
    { date: offsetDate(now, -2),  amount: 14.99,  category: 'Food',           description: 'Lunch at the cafe' },
    { date: offsetDate(now, -3),  amount: 89.00,  category: 'Bills',          description: 'Internet & cable bill' },
    { date: offsetDate(now, -4),  amount: 38.50,  category: 'Transportation', description: 'Uber rides this week' },
    { date: offsetDate(now, -6),  amount: 135.00, category: 'Shopping',       description: 'New running shoes' },
    { date: offsetDate(now, -7),  amount: 15.99,  category: 'Entertainment',  description: 'Netflix subscription' },
    { date: offsetDate(now, -9),  amount: 24.00,  category: 'Food',           description: 'Pizza night delivery' },
    // Previous month
    { date: monthDate(now, -1, 25), amount: 210.00, category: 'Bills',          description: 'Electricity bill' },
    { date: monthDate(now, -1, 18), amount: 72.00,  category: 'Food',           description: 'Restaurant dinner' },
    { date: monthDate(now, -1, 15), amount: 48.00,  category: 'Transportation', description: 'Gas fill-up' },
    { date: monthDate(now, -1, 12), amount: 299.00, category: 'Shopping',       description: 'Laptop stand & accessories' },
    { date: monthDate(now, -1, 10), amount: 32.00,  category: 'Entertainment',  description: 'Movie tickets × 2' },
    { date: monthDate(now, -1, 5),  amount: 91.50,  category: 'Food',           description: 'Weekly groceries' },
    { date: monthDate(now, -1, 3),  amount: 55.00,  category: 'Bills',          description: 'Phone bill' },
    // Two months ago
    { date: monthDate(now, -2, 22), amount: 175.00, category: 'Bills',          description: 'Rent utilities share' },
    { date: monthDate(now, -2, 17), amount: 63.00,  category: 'Food',           description: 'Dinner party groceries' },
    { date: monthDate(now, -2, 14), amount: 45.00,  category: 'Transportation', description: 'Train tickets' },
    { date: monthDate(now, -2, 10), amount: 180.00, category: 'Shopping',       description: 'Winter clothing' },
    { date: monthDate(now, -2, 8),  amount: 19.99,  category: 'Entertainment',  description: 'Spotify & streaming' },
    { date: monthDate(now, -2, 4),  amount: 78.30,  category: 'Food',           description: 'Supermarket weekly' },
    // Three months ago
    { date: monthDate(now, -3, 20), amount: 120.00, category: 'Bills',          description: 'Water & gas bill' },
    { date: monthDate(now, -3, 16), amount: 44.00,  category: 'Food',           description: 'Sushi restaurant' },
    { date: monthDate(now, -3, 12), amount: 60.00,  category: 'Transportation', description: 'Monthly transit pass' },
    { date: monthDate(now, -3, 7),  amount: 85.00,  category: 'Entertainment',  description: 'Concert tickets' },
    { date: monthDate(now, -3, 2),  amount: 95.40,  category: 'Food',           description: 'Grocery & household' },
  ];

  return raw.map((r) => ({
    ...r,
    id: generateId(),
    createdAt: ts,
    updatedAt: ts,
  })).sort((a, b) => b.date.localeCompare(a.date));
}

export function useExpenses() {
  const [expenses, setExpenses, isLoaded] = useLocalStorage<Expense[]>(STORAGE_KEY, []);

  const initializeSampleData = useCallback(() => {
    setExpenses((prev) => (prev.length === 0 ? buildSampleExpenses() : prev));
  }, [setExpenses]);

  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const entry: Expense = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      setExpenses((prev) =>
        [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date))
      );
      return entry;
    },
    [setExpenses]
  );

  const updateExpense = useCallback(
    (id: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      setExpenses((prev) =>
        prev
          .map((e) => (e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e))
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    },
    [setExpenses]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    },
    [setExpenses]
  );

  const getFilteredExpenses = useCallback(
    (filter: ExpenseFilter): Expense[] => {
      return expenses
        .filter((e) => {
          if (filter.category !== 'All' && e.category !== filter.category) return false;
          if (filter.search) {
            const q = filter.search.toLowerCase();
            if (!e.description.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q))
              return false;
          }
          if (!isDateInRange(e.date, filter.dateFrom, filter.dateTo)) return false;
          return true;
        })
        .sort((a, b) => {
          let cmp = 0;
          if (filter.sortBy === 'date') cmp = a.date.localeCompare(b.date);
          else if (filter.sortBy === 'amount') cmp = a.amount - b.amount;
          else if (filter.sortBy === 'category') cmp = a.category.localeCompare(b.category);
          else cmp = a.description.localeCompare(b.description);
          return filter.sortOrder === 'asc' ? cmp : -cmp;
        });
    },
    [expenses]
  );

  const stats = useMemo((): Stats => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthExpenses = expenses.filter((e) => getYearMonth(e.date) === currentMonth);
    const monthlyTotal = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

    // Category breakdown
    const catMap = new Map<Category, { total: number; count: number }>();
    for (const e of expenses) {
      const prev = catMap.get(e.category) ?? { total: 0, count: 0 };
      catMap.set(e.category, { total: prev.total + e.amount, count: prev.count + 1 });
    }
    const categoryStats: CategoryStats[] = Array.from(catMap.entries())
      .map(([category, d]) => ({
        category,
        total: d.total,
        count: d.count,
        percentage: total > 0 ? (d.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // Monthly breakdown — last 6 months
    const monthlyMap = new Map<string, { total: number; count: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, { total: 0, count: 0 });
    }
    for (const e of expenses) {
      const key = getYearMonth(e.date);
      if (monthlyMap.has(key)) {
        const prev = monthlyMap.get(key)!;
        monthlyMap.set(key, { total: prev.total + e.amount, count: prev.count + 1 });
      }
    }
    const monthlyStats: MonthlyStats[] = Array.from(monthlyMap.entries()).map(([month, d]) => ({
      month,
      label: getMonthLabel(month),
      total: d.total,
      count: d.count,
    }));

    return {
      total,
      monthlyTotal,
      count: expenses.length,
      monthlyCount: thisMonthExpenses.length,
      categoryStats,
      topCategory: categoryStats[0] ?? null,
      monthlyStats,
    };
  }, [expenses]);

  return {
    expenses,
    stats,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    initializeSampleData,
  };
}
