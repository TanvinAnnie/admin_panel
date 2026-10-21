
"use client";

export interface HeroPreviewData {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

interface HeroLivePreviewProps {
  hero: HeroPreviewData;
}

export default function HeroLivePreview({
  hero,
}: HeroLivePreviewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Live Preview
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Updates as you type
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            hero.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {hero.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="relative isolate flex min-h-[360px] items-center overflow-hidden rounded-xl bg-slate-900 sm:min-h-[440px]">
          {hero.image.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hero.image}
              alt="Hero preview background"
              className="absolute inset-0 -z-20 h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.opacity = "0";
              }}
              onLoad={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
            />
          ) : (
            <div className="absolute inset-0 -z-20 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-700 to-amber-900">
              <div className="text-center text-white/60">
                <span className="text-5xl">✦</span>
                <p className="mt-3 text-sm">Your banner image</p>
                <p className="mt-1 text-xs">Add an image URL</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

          <div className="w-full px-6 py-10 text-white sm:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
              {hero.subtitle || "MAHEEN ACCESSORIES"}
            </p>

            <h3 className="max-w-md break-words text-3xl font-bold leading-tight sm:text-4xl">
              {hero.title || "Discover Your Style"}
            </h3>

            <p className="mt-4 max-w-sm whitespace-pre-wrap break-words text-sm leading-6 text-white/80">
              {hero.description ||
                "Your banner description will appear here."}
            </p>

            {hero.buttonText.trim() && (
              <span className="mt-7 inline-flex max-w-full items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950">
                <span className="break-words">
                  {hero.buttonText}
                </span>
                <span aria-hidden="true">↗</span>
              </span>
            )}
          </div>

          {!hero.isActive && (
            <div className="absolute right-3 top-3 rounded-md bg-black/70 px-3 py-1.5 text-xs font-medium text-white">
              Preview only · Inactive
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Button destination
          </p>
          <p className="mt-1 break-all text-sm font-medium text-slate-800">
            {hero.buttonLink || "Not specified"}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Preview only. The button is not clickable, and this is not
            the final client website rendering.
          </p>
        </div>
      </div>
    </section>
  );
}
