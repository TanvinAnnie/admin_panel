
import Link from "next/link";

export interface PolicyItem {
  _id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

interface PolicyCardProps {
  policy: PolicyItem;
  deleting: boolean;
  onDelete: (policy: PolicyItem) => void;
}

export default function PolicyCard({
  policy,
  deleting,
  onDelete,
}: PolicyCardProps) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xl font-bold text-violet-700">
          {policy.icon || "✦"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words text-base font-bold text-slate-900">
              {policy.title}
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                policy.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {policy.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {policy.description}
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Display order: {policy.order}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <Link
          href={`/policies/${policy._id}/edit`}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() => onDelete(policy)}
          disabled={deleting}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
