interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, trend, trendPositive, icon }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 p-6 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-mono uppercase tracking-widest text-gray-400">{title}</p>
          <p className="mt-2 text-2xl font-bold text-black">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="ml-4 text-gray-400">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3">
          <span className={`text-sm font-medium ${trendPositive ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </span>
          <span className="text-xs text-gray-400 ml-1">vs previous year</span>
        </div>
      )}
    </div>
  );
}
