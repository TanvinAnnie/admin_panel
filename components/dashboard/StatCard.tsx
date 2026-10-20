
type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: string;
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  color,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
