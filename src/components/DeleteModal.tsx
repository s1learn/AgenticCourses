'use client';

import { Expense } from '@/types';
import { CATEGORY_CONFIG } from '@/utils/categories';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';

interface DeleteModalProps {
  expense: Expense;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ expense, onConfirm, onCancel }: DeleteModalProps) {
  const cfg = CATEGORY_CONFIG[expense.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Expense</h3>
        <p className="text-sm text-gray-500 mb-5">This action cannot be undone.</p>

        <div className="bg-gray-50 rounded-xl p-3 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className={`${cfg.bgColor} p-2 rounded-lg`}>
              <span className="text-base">{cfg.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
              <p className="text-xs text-gray-500">
                {formatCurrency(expense.amount)} · {formatDate(expense.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
