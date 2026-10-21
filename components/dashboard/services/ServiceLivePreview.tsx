
"use client";

export interface ServicePreviewData {
  title: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
}

interface ServiceLivePreviewProps {
  service: ServicePreviewData;
}

export default function ServiceLivePreview({
  service,
}: ServiceLivePreviewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">
            Website Preview
          </p>
          <h2 className="mt-1 font-semibold text-slate-900">
            Service Card
          </h2>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            service.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              service.isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {service.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="bg-[#faf9f6] p-4 sm:p-6">
        <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#f1eee8]">
            {service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.title || "Service preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  className="h-12 w-12"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <span className="text-sm">Service image preview</span>
              </div>
            )}

            {!service.isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55">
                <span className="rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                  Inactive Preview
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Maheen Accessories
            </p>

            <h3 className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900">
              {service.title || "Your Service Title"}
            </h3>

            <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
              {service.description ||
                "Your service description will appear here. Add a short, clear description to help visitors understand this service."}
            </p>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-sm font-medium text-slate-700">
                Discover more
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Preview updates as you edit the service details.
        </p>
      </div>

      <div className="space-y-2 border-t border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          URL Slug
        </p>
        <p className="break-all rounded-lg bg-slate-50 px-3 py-2.5 font-mono text-sm text-slate-700">
          {service.slug || "your-service-slug"}
        </p>
      </div>
    </section>
  );
}
