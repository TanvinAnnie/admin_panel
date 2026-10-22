
interface FeatureLivePreviewProps {
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

export default function FeatureLivePreview({
  title,
  description,
  icon,
  order,
  isActive,
}: FeatureLivePreviewProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm font-semibold text-slate-900">
          Live Preview
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Preview your feature before saving.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700">
            {icon.trim() || "✦"}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-base font-bold text-slate-900">
                {title.trim() || "Feature title"}
              </h3>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
              {description.trim() ||
                "Your feature description will appear here."}
            </p>

            <p className="mt-3 text-xs text-slate-400">
              Display order: {order}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
