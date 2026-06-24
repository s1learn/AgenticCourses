'use client';

import { useState } from 'react';
import { Expense, Category } from '@/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/utils/categories';
import { formatDateInput } from '@/utils/date';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSave: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

interface FormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

interface FormErrors {
  date?: string;
  amount?: string;
  description?: string;
}

export function ExpenseForm({ expense, onSave, onClose }: ExpenseFormProps) {
  const [form, setForm] = useState<FormData>({
    date: expense?.date ?? formatDateInput(new Date()),
    amount: expense ? expense.amount.toFixed(2) : '',
    category: expense?.category ?? 'Food',
    description: expense?.description ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.date) e.date = 'Date is required';

    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than $0';
    else if (amt > 999999) e.amount = 'Amount is too large';

    const desc = form.description.trim();
    if (!desc) e.description = 'Description is required';
    else if (desc.length < 2) e.description = 'Must be at least 2 characters';
    else if (desc.length > 200) e.description = 'Must be under 200 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));
    onSave({
      date: form.date,
      amount: Math.round(parseFloat(form.amount) * 100) / 100,
      category: form.category,
      description: form.description.trim(),
    });
    setSaving(false);
  };

  const handleAmountInput = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const safe = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;
    setForm((p) => ({ ...p, amount: safe }));
    if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
  };

  const inputCls = (err?: string) =>
    `w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
      err ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {expense ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Date + Amount row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={form.date}
                max={formatDateInput(new Date())}
                onChange={(e) => {
                  setForm((p) => ({ ...p, date: e.target.value }));
                  if (errors.date) setErrors((p) => ({ ...p, date: undefined }));
                }}
                className={inputCls(errors.date)}
              />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Amount</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => handleAmountInput(e.target.value)}
                  className={`${inputCls(errors.amount)} pl-8`}
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const selected = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                      selected
                        ? `${cfg.bgColor} ${cfg.color} border-current`
                        : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{cfg.icon}</span>
                    <span className="text-xs font-medium">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
            <input
              type="text"
              placeholder="What was this expense for?"
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }));
                if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
              }}
              className={inputCls(errors.description)}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
              {saving ? 'Saving…' : expense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
