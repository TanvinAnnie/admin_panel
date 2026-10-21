
"use client";

import {
  use,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HeroImageUpload from "@/components/dashboard/hero/HeroImageUpload";
import ServiceLivePreview, {
  type ServicePreviewData,
} from "@/components/dashboard/services/ServiceLivePreview";

interface Service extends ServicePreviewData {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServicesResponse {
  success: boolean;
  message?: string;
  data?: Service | Service[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

const emptyService: ServicePreviewData = {
  title: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
};

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<ServicePreviewData>(emptyService);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadService() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ServicesResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load service.");
        }

        const services = Array.isArray(result.data)
          ? result.data
          : result.data
            ? [result.data]
            : [];

        const service = services.find((item) => item._id === id);

        if (!service) {
          throw new Error("Service not found.");
        }

        setForm({
          title: service.title ?? "",
          slug: service.slug ?? "",
          description: service.description ?? "",
          image: service.image ?? "",
          isActive: service.isActive ?? true,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load service."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadService();

    return () => controller.abort();
  }, [id]);

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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          id,
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
          result.message || "Failed to update service."
        );
      }

      router.push("/services");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the service."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100";

  const labelClass = "text-sm font-semibold text-slate-700";

  if (loading) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500"
      >
        Loading service...
      </div>
    );
  }

  if (error && !form.title && !form.image) {
    return (
      <div className="space-y-4 rounded-2xl border border-red-200 bg-white p-6">
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>

        <Link
          href="/services"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/services"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            ← All Services
          </Link>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Website Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Edit Service
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Update the service information and preview your changes.
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

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
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
                  Edit the title, URL slug and description.
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

              <p className="mt-2 text-xs text-slate-500">
                The slug is used to identify the service in website URLs.
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
                  Keep the current image or upload a replacement.
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
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mt-1 h-4 w-4 accent-amber-500"
              />

              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  Activate this service
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Active services can appear on the client website.
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
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="min-w-0 xl:sticky xl:top-24">
          <ServiceLivePreview service={form} />
        </div>
      </div>
    </div>
  );
}
