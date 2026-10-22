
"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export interface FeatureFormData {
  _id?: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  order: number;
  isActive: boolean;
}

interface FeatureFormProps {
  initialData?: Partial<FeatureFormData>;
  mode?: "create" | "edit";
}

const defaultData: FeatureFormData = {
  title: "",
  description: "",
  icon: "",
  image: "",
  order: 0,
  isActive: true,
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function FeatureForm({
  initialData,
  mode = "create",
}: FeatureFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FeatureFormData>({
    ...defaultData,
    ...initialData,
    order: initialData?.order ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusy = uploading || saving;

  function updateField<K extends keyof FeatureFormData>(
    field: K,
    value: FeatureFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Image size must be between 1 byte and 5 MB.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const uploadData = new FormData();

      uploadData.append("file", file);
      uploadData.append("context", "features");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(
          result.message || "Failed to upload image."
        );
      }

      updateField("image", result.url);
      setSuccess("Image uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image."
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    if (title.length > 150) {
      setError("Title cannot exceed 150 characters.");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (formData.icon.trim().length > 50) {
      setError("Icon cannot exceed 50 characters.");
      return;
    }

    if (
      !Number.isInteger(Number(formData.order)) ||
      Number(formData.order) < 0
    ) {
      setError("Display order must be a non-negative integer.");
      return;
    }

    if (mode === "edit" && !formData._id) {
      setError("Feature ID is missing. Please reload the page.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...(mode === "edit" ? { _id: formData._id } : {}),
        title,
        description,
        icon: formData.icon.trim(),
        image: formData.image.trim(),
        order: Number(formData.order),
        isActive: formData.isActive,
      };

      const response = await fetch("/api/features", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${mode === "create" ? "create" : "update"} feature.`
        );
      }

      setSuccess(
        mode === "create"
          ? "Feature created successfully."
          : "Feature updated successfully."
      );

      router.push("/features");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-6"
    >
      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        {/* Form fields */}
        <section className="min-w-0 space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Feature Information
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Enter the content you want to display on your website.
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="feature-title"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Feature Title <span className="text-red-500">*</span>
            </label>

            <input
              id="feature-title"
              type="text"
              required
              maxLength={150}
              value={formData.title}
              onChange={(event) =>
                updateField("title", event.target.value)
              }
              placeholder="e.g. Creative Custom Design"
              disabled={isBusy}
              className={inputClass}
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {formData.title.length}/150
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="feature-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description <span className="text-red-500">*</span>
            </label>

            <textarea
              id="feature-description"
              required
              rows={5}
              maxLength={1000}
              value={formData.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Describe this feature..."
              disabled={isBusy}
              className={`${inputClass} resize-y`}
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {formData.description.length}/1000
            </p>
          </div>

          {/* Icon */}
          <div>
            <label
              htmlFor="feature-icon"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Icon or Symbol
            </label>

            <input
              id="feature-icon"
              type="text"
              maxLength={50}
              value={formData.icon}
              onChange={(event) =>
                updateField("icon", event.target.value)
              }
              placeholder="e.g. ✦ or ↗"
              disabled={isBusy}
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-500">
              Optional. Used as a fallback when no image is provided.
            </p>
          </div>

          {/* Image upload */}
          <div className="min-w-0">
            <label
              htmlFor="feature-image"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Feature Image
            </label>

            <div className="rounded-xl border border-dashed border-slate-300 p-4 transition hover:border-blue-400 sm:p-5">
              <input
                ref={fileInputRef}
                id="feature-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageUpload}
                disabled={isBusy}
                className="block w-full min-w-0 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Supported formats: JPG, PNG, WebP. Maximum size: 5 MB.
              </p>

              {uploading && (
                <div
                  role="status"
                  className="mt-4 flex items-center gap-3 text-sm text-blue-600"
                >
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                  Uploading image to Cloudinary...
                </div>
              )}
            </div>

            {formData.image && (
              <div className="mt-4 min-w-0 space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Image Preview
                </p>

                <div className="relative aspect-video w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <Image
                    src={formData.image}
                    alt={formData.title || "Feature image preview"}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 512px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => fileInputRef.current?.click()}
                    className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Replace Image
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => updateField("image", "")}
                    className="min-h-10 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Display order */}
          <div>
            <label
              htmlFor="feature-order"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Display Order
            </label>

            <input
              id="feature-order"
              type="number"
              min={0}
              step={1}
              value={formData.order}
              onChange={(event) =>
                updateField(
                  "order",
                  event.target.value === ""
                    ? ("" as unknown as number)
                    : Number(event.target.value)
                )
              }
              disabled={isBusy}
              className={inputClass}
            />

            <p className="mt-1 text-xs text-slate-500">
              Smaller numbers appear first.
            </p>
          </div>

          {/* Active status */}
          <div className="flex min-w-0 items-center justify-between gap-4 rounded-xl border border-slate-200 p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Active Feature
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Active features can be displayed on the website.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={formData.isActive}
              aria-label="Toggle active feature"
              disabled={isBusy}
              onClick={() =>
                updateField("isActive", !formData.isActive)
              }
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                formData.isActive ? "bg-blue-600" : "bg-slate-300"
              } disabled:opacity-50`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  formData.isActive ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </section>

        {/* Live preview */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Live Preview
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Preview your feature card as you edit it.
            </p>
          </div>

          <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            {formData.image ? (
              <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={formData.image}
                  alt={formData.title || "Feature preview"}
                  fill
                  unoptimized
                  sizes="(max-width: 1280px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mb-5 flex aspect-video w-full items-center justify-center rounded-xl bg-slate-50 text-4xl text-slate-300">
                {formData.icon || "✦"}
              </div>
            )}

            <div className="flex min-w-0 items-start gap-3">
              {!formData.image && (
                <span className="shrink-0 text-xl text-blue-600">
                  {formData.icon || "↗"}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-lg font-bold text-slate-900">
                  {formData.title.trim() || "Feature Title"}
                </h3>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                  {formData.description.trim() ||
                    "Your feature description will appear here."}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  formData.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>

              <span className="text-xs text-slate-400">
                Order: {formData.order === ("" as unknown as number) ? 0 : formData.order}
              </span>
            </div>
          </article>

          <p className="rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-800">
            This is an admin preview. The final appearance on your public
            website depends on the website&apos;s Features section layout.
          </p>
        </aside>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isBusy}
          onClick={() => router.push("/features")}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}

          {uploading
            ? "Uploading Image..."
            : saving
              ? "Saving..."
              : mode === "create"
                ? "Create Feature"
                : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
