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
    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="ml-4 text-blue-600">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3">
          <span className={`text-sm font-medium ${trendPositive ? 'text-red-600' : 'text-green-600'}`}>
            {trend}
          </span>
          <span className="text-sm text-gray-500 ml-1">vs previous year</span>
        </div>
      )}
    </div>
  );
}
