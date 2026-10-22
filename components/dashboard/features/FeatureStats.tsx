
interface FeatureStatsProps {
  total: number;
  active: number;
  inactive: number;
}

const statsConfig = [
  {
    key: "total",
    label: "Total Features",
    description: "All created features",
  },
  {
    key: "active",
    label: "Active Features",
    description: "Visible on the website",
  },
  {
    key: "inactive",
    label: "Inactive Features",
    description: "Currently hidden",
  },
] as const;

export default function FeatureStats({
  total,
  active,
  inactive,
}: FeatureStatsProps) {
  const values = { total, active, inactive };

  return (
    <section
      aria-label="Feature statistics"
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {statsConfig.map((stat) => (
        <article
          key={stat.key}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
        >
          <p className="text-sm font-medium text-slate-500">
            {stat.label}
          </p>

          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-slate-900">
            {values[stat.key]}
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {stat.description}
          </p>
        </article>
      ))}
    </section>
  );
}
