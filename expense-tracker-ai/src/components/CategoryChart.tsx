'use client';

import { CategoryStats } from '@/types';
import { CATEGORY_CONFIG } from '@/utils/categories';
import { formatCurrency } from '@/utils/currency';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryChartProps {
  data: CategoryStats[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-52 text-gray-400">
        <span className="text-4xl mb-2">📊</span>
        <p className="text-sm">No data yet</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total,
    color: CATEGORY_CONFIG[d.category].chartColor,
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => [formatCurrency(v), 'Spent']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-2">
        {data.map((item) => {
          const cfg = CATEGORY_CONFIG[item.category];
          return (
            <div key={item.category} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.chartColor }} />
                <span className="text-sm text-gray-700 truncate">{item.category}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.count}×</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-20 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                  <div className="h-1.5 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: cfg.chartColor }} />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
