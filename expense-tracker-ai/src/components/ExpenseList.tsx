'use client';

import { useState } from 'react';
import { Expense, ExpenseFilter } from '@/types';
import { ExpenseItem } from './ExpenseItem';
import { FilterBar } from './FilterBar';
import { DeleteModal } from './DeleteModal';
import { formatCurrency } from '@/utils/currency';
import { exportToCSV } from '@/utils/export';

interface ExpenseListProps {
  expenses: Expense[];
  getFilteredExpenses: (filter: ExpenseFilter) => Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const DEFAULT_FILTER: ExpenseFilter = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export function ExpenseList({ expenses, getFilteredExpenses, onEdit, onDelete }: ExpenseListProps) {
  const [filter, setFilter] = useState<ExpenseFilter>(DEFAULT_FILTER);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const filtered = getFilteredExpenses(filter);
  const filteredTotal = filtered.reduce((s, e) => s + e.amount, 0);
  const isFiltered = filtered.length !== expenses.length;

  const patch = (p: Partial<ExpenseFilter>) => setFilter((prev) => ({ ...prev, ...p }));

  return (
    <div className="space-y-4">
      <FilterBar filter={filter} onChange={patch} onReset={() => setFilter(DEFAULT_FILTER)} />

      {/* Result bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-medium text-gray-800">{filtered.length}</span>{' '}
          expense{filtered.length !== 1 ? 's' : ''}
          {isFiltered && <span className="text-gray-400"> (filtered from {expenses.length})</span>}
          {filtered.length > 0 && (
            <> &mdash; total <span className="font-semibold text-gray-900">{formatCurrency(filteredTotal)}</span></>
          )}
        </p>
        <button
          onClick={() => exportToCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-base font-semibold text-gray-700">No expenses found</p>
            <p className="text-sm text-gray-400 mt-1">
              {isFiltered ? 'Try adjusting your filters' : 'Add your first expense above'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((e) => (
              <ExpenseItem key={e.id} expense={e} onEdit={onEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          expense={deleteTarget}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
