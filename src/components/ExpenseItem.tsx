'use client';

import { Expense } from '@/types';
import { CATEGORY_CONFIG } from '@/utils/categories';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const cfg = CATEGORY_CONFIG[expense.category];

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors rounded-xl group">
      <div className={`${cfg.bgColor} p-2.5 rounded-xl flex-shrink-0`}>
        <span className="text-lg">{cfg.icon}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.color}`}>
            {expense.category}
          </span>
          <span className="text-xs text-gray-400">{formatDate(expense.date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
        {/* Always visible on mobile, hover on desktop */}
        <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Edit expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(expense)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete expense"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
