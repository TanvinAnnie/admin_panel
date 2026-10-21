
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroLivePreview, {
  type HeroPreviewData,
} from "@/components/dashboard/hero/HeroLivePreview";
import HeroImageUpload from "@/components/dashboard/hero/HeroImageUpload";

interface ApiResponse {
  success: boolean;
  message?: string;
}

export default function NewHeroPage() {
  const router = useRouter();

  const [form, setForm] = useState<HeroPreviewData>({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    buttonText: "Explore Now",
    buttonLink: "/collections",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;

    if (type === "checkbox" && event.target instanceof HTMLInputElement) {
      const checked = event.target.checked;

      setForm((previous) => ({
        ...previous,
        [name]: checked,
      }));
      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Please enter a hero banner title.");
      return;
    }

    if (!form.image.trim()) {
      setError("Please upload a hero banner image.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          buttonText: form.buttonText.trim(),
          buttonLink: form.buttonLink.trim(),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create hero banner."
        );
      }

      router.push("/hero");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the hero banner."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100";

  const labelClass = "text-sm font-semibold text-slate-700";

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/hero"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            All Hero Sections
          </Link>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
              Website Management
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Create Hero Banner
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create your website banner, upload an image, and see
              your changes in the live preview.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:self-auto">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              form.isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          <span className="text-sm font-medium text-slate-700">
            {form.isActive ? "Active banner" : "Inactive banner"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 font-bold text-amber-700">
                01
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Banner Content
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add your heading and supporting text.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Main title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Discover Your Style"
                  className={inputClass}
                  required
                  maxLength={150}
                />
                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {form.title.length}/150
                </p>
              </div>

              <div>
                <label htmlFor="subtitle" className={labelClass}>
                  Subtitle
                </label>
                <input
                  id="subtitle"
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="MAHEEN ACCESSORIES"
                  className={inputClass}
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write a short, engaging description..."
                  rows={4}
                  className={inputClass}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 font-bold text-violet-700">
                02
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Banner Image
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a banner image directly to Cloudinary.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className={labelClass}>
                Hero Banner Image{" "}
                <span className="text-red-500">*</span>
              </label>

              <HeroImageUpload
                value={form.image}
                onChange={(url) =>
                  setForm((previous) => ({
                    ...previous,
                    image: url,
                  }))
                }
                disabled={saving}
              />

              {!form.image && (
                <p className="text-xs text-slate-500">
                  Upload an image to enable a complete banner preview.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                03
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Call-to-Action
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure the button displayed on your banner.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="buttonText" className={labelClass}>
                  Button text
                </label>
                <input
                  id="buttonText"
                  name="buttonText"
                  value={form.buttonText}
                  onChange={handleChange}
                  placeholder="Explore Now"
                  className={inputClass}
                  maxLength={60}
                />
              </div>

              <div>
                <label htmlFor="buttonLink" className={labelClass}>
                  Button link
                </label>
                <input
                  id="buttonLink"
                  name="buttonLink"
                  value={form.buttonLink}
                  onChange={handleChange}
                  placeholder="/collections"
                  className={inputClass}
                  maxLength={500}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-amber-500"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Activate this banner
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  Mark this banner as active for the client website.
                </span>
              </span>
            </label>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/hero"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || !form.image.trim()}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Hero Banner"}
            </button>
          </div>
        </form>

        <div className="min-w-0 xl:sticky xl:top-24">
          <HeroLivePreview hero={form} />
        </div>
      </div>
    </div>
  );
}
