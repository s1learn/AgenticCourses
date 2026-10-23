'use client';

import { useState, useMemo } from 'react';
import { Expense, Category } from '@/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/utils/categories';
import { formatDate } from '@/utils/date';
import { formatCurrency } from '@/utils/currency';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/export';

type ExportFormat = 'csv' | 'json' | 'pdf';

const FORMAT_LABELS: Record<ExportFormat, { label: string; sub: string }> = {
  csv: { label: 'CSV', sub: 'Spreadsheet' },
  json: { label: 'JSON', sub: 'Raw Data' },
  pdf: { label: 'PDF', sub: 'Printable' },
};

const PREVIEW_LIMIT = 8;

interface Props {
  expenses: Expense[];
  onClose: () => void;
}

export function ExportModal({ expenses, onClose }: Props) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [filename, setFilename] = useState(`expenses_${new Date().toISOString().split('T')[0]}`);
  const [isExporting, setIsExporting] = useState(false);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => {
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        if (selectedCategories.size > 0 && !selectedCategories.has(e.category)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, dateFrom, dateTo, selectedCategories]);

  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleExport = async () => {
    if (filtered.length === 0) return;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 600));
    if (format === 'csv') exportToCSV(filtered, filename);
    else if (format === 'json') exportToJSON(filtered, filename);
    else exportToPDF(filtered, filename);
    setIsExporting(false);
    onClose();
  };

  const preview = filtered.slice(0, PREVIEW_LIMIT);
  const remaining = filtered.length - PREVIEW_LIMIT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
            <p className="text-xs text-gray-400 mt-0.5">Configure and download your expense data</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Format */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Format</label>
            <div className="mt-2 flex gap-2">
              {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    format === f
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {FORMAT_LABELS[f].label}
                  <span className="block text-xs font-normal opacity-70 mt-0.5">{FORMAT_LABELS[f].sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date Range</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Categories{' '}
              <span className="normal-case font-normal text-gray-400">(empty = all)</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = selectedCategories.has(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      active
                        ? `${cfg.bgColor} ${cfg.color} border-transparent`
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filename</label>
            <div className="mt-2 flex items-center">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
              />
              <span className="px-3 py-2 text-sm bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg text-gray-400 select-none">
                .{format}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</label>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  filtered.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {filtered.length} record{filtered.length !== 1 ? 's' : ''} will be exported
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
                No records match the current filters
              </div>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-left">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Category</th>
                      <th className="px-3 py-2 font-medium text-right">Amount</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {preview.map((e) => {
                      const cfg = CATEGORY_CONFIG[e.category];
                      return (
                        <tr key={e.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{formatDate(e.date)}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs ${cfg.bgColor} ${cfg.color}`}
                            >
                              {cfg.icon} {e.category}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-900 font-medium text-right tabular-nums whitespace-nowrap">
                            {formatCurrency(e.amount)}
                          </td>
                          <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate">{e.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {remaining > 0 && (
                  <div className="text-center py-2 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                    + {remaining} more record{remaining !== 1 ? 's' : ''} not shown
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0 || isExporting}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {isExporting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Exporting…
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Export {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
