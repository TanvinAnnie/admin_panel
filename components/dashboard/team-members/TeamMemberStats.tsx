
interface TeamMemberStatsProps {
  total: number;
  active: number;
  inactive: number;
}

const stats = [
  {
    key: "total",
    label: "Total Members",
    description: "All registered team members",
  },
  {
    key: "active",
    label: "Active Members",
    description: "Visible on the website",
  },
  {
    key: "inactive",
    label: "Inactive Members",
    description: "Currently hidden",
  },
] as const;

export default function TeamMemberStats({
  total,
  active,
  inactive,
}: TeamMemberStatsProps) {
  const values = { total, active, inactive };

  return (
    <section
      aria-label="Team member statistics"
      className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {stats.map((stat) => (
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
