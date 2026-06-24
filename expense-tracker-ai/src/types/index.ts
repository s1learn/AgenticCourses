export type Category = 'Food' | 'Transportation' | 'Entertainment' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'date' | 'amount' | 'category' | 'description';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFilter {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface CategoryStats {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyStats {
  month: string;   // YYYY-MM
  label: string;   // "Jan 2024"
  total: number;
  count: number;
}

export interface Stats {
  total: number;
  monthlyTotal: number;
  count: number;
  monthlyCount: number;
  categoryStats: CategoryStats[];
  topCategory: CategoryStats | null;
  monthlyStats: MonthlyStats[];
}
