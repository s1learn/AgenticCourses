'use client';

import { useState, useEffect, useRef } from 'react';
import { Expense } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { Navigation, ActiveView } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseForm } from '@/components/ExpenseForm';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const {
    expenses,
    stats,
    isLoaded,
    addExpense,
    updateExpense,
    deleteExpense,
    getFilteredExpenses,
    initializeSampleData,
  } = useExpenses();

  useEffect(() => {
    if (isLoaded) initializeSampleData();
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const openAdd = () => { setEditingExpense(null); setShowForm(true); };
  const openEdit = (expense: Expense) => { setEditingExpense(expense); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingExpense(null); };

  const handleSave = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      addToast('Expense updated');
    } else {
      addExpense(data);
      addToast('Expense added');
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    addToast('Expense deleted');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">💰</div>
          <p className="text-gray-500 text-sm">Loading your expenses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeView={activeView} onViewChange={setActiveView} onAddExpense={openAdd} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'dashboard' ? (
          <Dashboard
            expenses={expenses}
            stats={stats}
            onEdit={openEdit}
            onDelete={handleDelete}
            onAddExpense={openAdd}
          />
        ) : (
          <ExpenseList
            expenses={expenses}
            getFilteredExpenses={getFilteredExpenses}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Expense form modal */}
      {showForm && (
        <ExpenseForm expense={editingExpense} onSave={handleSave} onClose={closeForm} />
      )}

      {/* Toast stack */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
              t.type === 'success' ? 'bg-gray-900' : 'bg-red-600'
            }`}
          >
            {t.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
