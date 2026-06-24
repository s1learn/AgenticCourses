'use client';

export type ActiveView = 'dashboard' | 'expenses';

interface NavigationProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  onAddExpense: () => void;
}

export function Navigation({ activeView, onViewChange, onAddExpense }: NavigationProps) {
  const tabClass = (view: ActiveView) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeView === view
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + desktop tabs */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900">ExpenseTracker</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <button className={tabClass('dashboard')} onClick={() => onViewChange('dashboard')}>
                Dashboard
              </button>
              <button className={tabClass('expenses')} onClick={() => onViewChange('expenses')}>
                Expenses
              </button>
            </div>
          </div>

          <button
            onClick={onAddExpense}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            <span>Add Expense</span>
          </button>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex gap-1 pb-2">
          <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => onViewChange('dashboard')}>
            Dashboard
          </button>
          <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'expenses' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`} onClick={() => onViewChange('expenses')}>
            Expenses
          </button>
        </div>
      </div>
    </nav>
  );
}
