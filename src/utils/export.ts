import { Expense } from '@/types';
import { formatDate } from './date';
import { CATEGORY_CONFIG } from './categories';
import { formatCurrency } from './currency';

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

export function exportToJSON(expenses: Expense[], filename: string): void {
  const data = expenses.map((e) => ({
    date: e.date,
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `${filename}.json`,
  );
}

export function exportToPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const rows = expenses
    .map((e) => {
      const cfg = CATEGORY_CONFIG[e.category];
      return `<tr>
        <td>${formatDate(e.date)}</td>
        <td><span class="badge" style="background:${cfg.chartColor}20;color:${cfg.chartColor}">${cfg.icon} ${e.category}</span></td>
        <td class="amount">${formatCurrency(e.amount)}</td>
        <td>${e.description}</td>
      </tr>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #111827; padding: 32px; }
    h1 { font-size: 20px; font-weight: 700; color: #1e1b4b; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 11px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5ff; color: #4338ca; font-weight: 600; text-align: left; padding: 8px 12px; border-bottom: 2px solid #e0e7ff; }
    td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .amount { font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
    th.amount { text-align: right; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; }
    .footer { margin-top: 20px; padding-top: 12px; border-top: 2px solid #e0e7ff; display: flex; justify-content: space-between; align-items: center; }
    .total { font-weight: 700; font-size: 14px; color: #1e1b4b; }
    .count { color: #6b7280; font-size: 11px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Expense Report</h1>
  <p class="meta">Generated ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} &middot; ${expenses.length} record${expenses.length !== 1 ? 's' : ''}</p>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Category</th>
        <th class="amount">Amount</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <span class="count">${expenses.length} record${expenses.length !== 1 ? 's' : ''}</span>
    <span class="total">Total: ${formatCurrency(total)}</span>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}
