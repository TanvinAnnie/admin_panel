
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroImageUpload from "@/components/dashboard/hero/HeroImageUpload";
import ServiceLivePreview, {
  type ServicePreviewData,
} from "@/components/dashboard/services/ServiceLivePreview";

interface ApiResponse {
  success: boolean;
  message?: string;
}

export default function NewServicePage() {
  const router = useRouter();

  const [form, setForm] = useState<ServicePreviewData>({
    title: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function makeSlug(value: string) {
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

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

    if (name === "title") {
      setForm((previous) => ({
        ...previous,
        title: value,
        slug: slugManuallyEdited ? previous.slug : makeSlug(value),
      }));

      return;
    }

    if (name === "slug") {
      setSlugManuallyEdited(true);

      setForm((previous) => ({
        ...previous,
        slug: makeSlug(value),
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
      setError("Please enter a service title.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a valid service slug.");
      return;
    }

    if (!form.description.trim()) {
      setError("Please enter a service description.");
      return;
    }

    if (!form.image.trim()) {
      setError("Please upload a service image.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
        }),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create service."
        );
      }

      router.push("/services");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the service."
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
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden="true">←</span>
            All Services
          </Link>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Website Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Create Service
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Create a service for Maheen Accessories and preview its
            appearance before publishing.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              form.isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          <span className="text-sm font-medium text-slate-700">
            {form.isActive ? "Active service" : "Inactive service"}
          </span>
        </div>
      </div>

      {/* Form + live preview */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
          {/* Service information */}
          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 font-bold text-amber-700">
                01
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Service Information
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add the title, URL slug and description.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="title" className={labelClass}>
                Service title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Custom Jewelry Design"
                className={inputClass}
                maxLength={150}
                required
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {form.title.length}/150
              </p>
            </div>

            <div>
              <label htmlFor="slug" className={labelClass}>
                URL slug <span className="text-red-500">*</span>
              </label>
              <input
                id="slug"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="custom-jewelry-design"
                className={inputClass}
                maxLength={180}
                required
              />
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Automatically generated from the title. You can edit it.
              </p>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe this service..."
                rows={5}
                className={inputClass}
                maxLength={2000}
                required
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {form.description.length}/2000
              </p>
            </div>
          </section>

          {/* Image upload */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 font-bold text-violet-700">
                02
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Service Image
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload an image to Cloudinary; preview updates automatically.
                </p>
              </div>
            </div>

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
                Upload an image to complete the service card preview.
              </p>
            )}
          </section>

          {/* Status */}
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
                  Activate this service
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  Choose whether this service should be active on the website.
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
              href="/services"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || !form.image.trim()}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Service"}
            </button>
          </div>
        </form>

        {/* Live preview */}
        <div className="min-w-0 xl:sticky xl:top-24">
          <ServiceLivePreview service={form} />
        </div>
      </div>
    </div>
  );
}
