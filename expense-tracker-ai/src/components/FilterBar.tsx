'use client';

import { ExpenseFilter } from '@/types';
import { CATEGORIES } from '@/utils/categories';

interface FilterBarProps {
  filter: ExpenseFilter;
  onChange: (patch: Partial<ExpenseFilter>) => void;
  onReset: () => void;
}

export function FilterBar({ filter, onChange, onReset }: FilterBarProps) {
  const active = filter.search || filter.category !== 'All' || filter.dateFrom || filter.dateTo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      {/* Row 1: search + category */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search expenses…"
            value={filter.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <select
          value={filter.category}
          onChange={(e) => onChange({ category: e.target.value as ExpenseFilter['category'] })}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Row 2: date range + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="date"
            value={filter.dateFrom}
            onChange={(e) => onChange({ dateFrom: e.target.value })}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-gray-400 text-xs flex-shrink-0">to</span>
          <input
            type="date"
            value={filter.dateTo}
            onChange={(e) => onChange({ dateTo: e.target.value })}
            className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <select
            value={filter.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as ExpenseFilter['sortBy'] })}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
          >
            <option value="date">Sort: Date</option>
            <option value="amount">Sort: Amount</option>
            <option value="category">Sort: Category</option>
            <option value="description">Sort: Description</option>
          </select>

          <button
            onClick={() => onChange({ sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
            title={filter.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {filter.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>

          {active && (
            <button onClick={onReset} className="px-3 py-2 border border-red-200 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
