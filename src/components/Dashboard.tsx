'use client';

import { useState, useMemo } from 'react';
import { Expense, Stats } from '@/types';
import { SummaryCard } from './SummaryCard';
import { CategoryChart } from './CategoryChart';
import { MonthlyChart } from './MonthlyChart';
import { ExpenseItem } from './ExpenseItem';
import { DeleteModal } from './DeleteModal';
import { formatCurrency } from '@/utils/currency';
import { CATEGORY_CONFIG } from '@/utils/categories';
import { exportToCSV } from '@/utils/export';

interface DashboardProps {
  expenses: Expense[];
  stats: Stats;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onAddExpense: () => void;
}

export function Dashboard({ expenses, stats, onEdit, onDelete, onAddExpense }: DashboardProps) {
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const recent = useMemo(() => expenses.slice(0, 6), [expenses]);

  const avgLabel =
    stats.count > 0 ? formatCurrency(stats.total / stats.count) : '$0.00';

  const topCatCfg = stats.topCategory ? CATEGORY_CONFIG[stats.topCategory.category] : null;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(stats.total)}
          subtitle={`${stats.count} transaction${stats.count !== 1 ? 's' : ''} total`}
          icon="💰"
          color="indigo"
        />
        <SummaryCard
          title="This Month"
          value={formatCurrency(stats.monthlyTotal)}
          subtitle={`${stats.monthlyCount} transaction${stats.monthlyCount !== 1 ? 's' : ''}`}
          icon="📅"
          color="blue"
        />
        <SummaryCard
          title="Top Category"
          value={stats.topCategory?.category ?? '—'}
          subtitle={stats.topCategory ? formatCurrency(stats.topCategory.total) : 'No data yet'}
          icon={topCatCfg?.icon ?? '📊'}
          color="amber"
        />
        <SummaryCard
          title="Avg per Transaction"
          value={avgLabel}
          subtitle="Across all expenses"
          icon="📐"
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Spending by Category</h3>
              <p className="text-xs text-gray-400 mt-0.5">All time</p>
            </div>
          </div>
          <CategoryChart data={stats.categoryStats} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Monthly Spending</h3>
              <p className="text-xs text-gray-400 mt-0.5">Last 6 months</p>
            </div>
          </div>
          <MonthlyChart data={stats.monthlyStats} />
        </div>
      </div>

      {/* Recent expenses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Expenses</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest {Math.min(6, expenses.length)} transactions</p>
          </div>
          {expenses.length > 0 && (
            <button
              onClick={() => exportToCSV(expenses)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export CSV
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
            <span className="text-5xl mb-4">💸</span>
            <p className="text-base font-semibold text-gray-700">No expenses yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-5">Start tracking your spending today</p>
            <button
              onClick={onAddExpense}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((e) => (
              <ExpenseItem
                key={e.id}
                expense={e}
                onEdit={onEdit}
                onDelete={setDeleteTarget}
              />
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
