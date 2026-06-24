import { Category } from '@/types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_CONFIG: Record<
  Category,
  { color: string; bgColor: string; icon: string; chartColor: string }
> = {
  Food:           { color: 'text-amber-700',  bgColor: 'bg-amber-100',  icon: '🍽️', chartColor: '#f59e0b' },
  Transportation: { color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: '🚗', chartColor: '#3b82f6' },
  Entertainment:  { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🎬', chartColor: '#8b5cf6' },
  Shopping:       { color: 'text-pink-700',   bgColor: 'bg-pink-100',   icon: '🛍️', chartColor: '#ec4899' },
  Bills:          { color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '📄', chartColor: '#ef4444' },
  Other:          { color: 'text-gray-700',   bgColor: 'bg-gray-100',   icon: '💼', chartColor: '#6b7280' },
};
