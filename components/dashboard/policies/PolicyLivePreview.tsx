"use client";

export interface PolicyFormData {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
}

interface PolicyLivePreviewProps {
  data: PolicyFormData;
}

export default function PolicyLivePreview({
  data,
}: PolicyLivePreviewProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
          Live Preview
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">
          Policy Card
        </h2>
      </div>

      <div className="p-4 sm:p-6">
        <article className="relative flex min-h-64 min-w-0 flex-col bg-slate-100 p-6 sm:p-8">
          <div className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l border-t border-slate-500" />
          <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r border-t border-slate-500" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b border-l border-slate-500" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b border-r border-slate-500" />

          <div className="flex h-16 items-center text-4xl text-violet-600">
            {data.icon || "✦"}
          </div>

          <p className="mt-5 text-sm text-slate-600">
            {String(data.order + 1).padStart(2, "0")}
          </p>

          <h3 className="mt-3 break-words text-lg font-bold text-slate-900">
            {data.title || "Policy title"}
          </h3>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {data.description || "Your policy description will appear here."}
          </p>

          <span
            className={`mt-4 w-fit rounded-full px-3 py-1 text-xs font-semibold ${
              data.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {data.isActive ? "Active" : "Inactive"}
          </span>
        </article>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Preview of the policy card. The public website can apply its own
          final styling and layout.
        </p>
      </div>
    </section>
  );
}