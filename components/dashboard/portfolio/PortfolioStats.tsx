
interface PortfolioStatsProps {
  total: number;
  active: number;
  inactive: number;
}

export default function PortfolioStats({
  total,
  active,
  inactive,
}: PortfolioStatsProps) {
  const stats = [
    {
      label: "Total Projects",
      value: total,
      description: "All portfolio items",
      icon: "▦",
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active Projects",
      value: active,
      description: "Visible on the website",
      icon: "✓",
      style: "bg-green-50 text-green-600",
    },
    {
      label: "Inactive Projects",
      value: inactive,
      description: "Hidden from the website",
      icon: "◷",
      style: "bg-gray-100 text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {stat.label}
              </p>

              <p className="mt-3 text-3xl font-semibold text-gray-900">
                {stat.value}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {stat.description}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl font-semibold ${stat.style}`}
              aria-hidden="true"
            >
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
