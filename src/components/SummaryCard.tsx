interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'indigo' | 'green' | 'amber' | 'blue';
}

const colors = {
  indigo: { icon: 'bg-indigo-100', accent: 'text-indigo-600' },
  green:  { icon: 'bg-green-100',  accent: 'text-green-600'  },
  amber:  { icon: 'bg-amber-100',  accent: 'text-amber-600'  },
  blue:   { icon: 'bg-blue-100',   accent: 'text-blue-600'   },
};

export function SummaryCard({ title, value, subtitle, icon, color }: SummaryCardProps) {
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 truncate">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`${c.icon} p-3 rounded-xl flex-shrink-0 ml-3`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
