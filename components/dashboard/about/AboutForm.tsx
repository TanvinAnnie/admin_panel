
"use client";

import AboutImageUpload from "./AboutImageUpload";

export interface AboutFormData {
  _id?: string;
  title: string;
  subtitle: string;
  story: string;
  image: string;
  mission: string;
  vision: string;
  isActive: boolean;
}

interface AboutFormProps {
  form: AboutFormData;
  onChange: (
    field: keyof AboutFormData,
    value: string | boolean
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  uploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  exists: boolean;
}

export default function AboutForm({
  form,
  onChange,
  onSubmit,
  saving,
  uploading,
  onUploadingChange,
  exists,
}: AboutFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* General Information */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-gray-900">
          General Information
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Introduce Maheen Accessories to your customers.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="about-title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>

            <input
              id="about-title"
              required
              maxLength={150}
              value={form.title}
              onChange={(event) =>
                onChange("title", event.target.value)
              }
              placeholder="Our Story"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="about-subtitle"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Subtitle
            </label>

            <input
              id="about-subtitle"
              maxLength={250}
              value={form.subtitle}
              onChange={(event) =>
                onChange("subtitle", event.target.value)
              }
              placeholder="Discover the story behind our brand"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="about-story"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Brand Story <span className="text-red-500">*</span>
            </label>

            <textarea
              id="about-story"
              required
              rows={6}
              maxLength={5000}
              value={form.story}
              onChange={(event) =>
                onChange("story", event.target.value)
              }
              placeholder="Tell your customers about Maheen Accessories..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {form.story.length}/5000 characters
            </p>
          </div>
        </div>
      </section>

      {/* Image Upload */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <AboutImageUpload
          image={form.image}
          onChange={(image) => onChange("image", image)}
          onUploadingChange={onUploadingChange}
        />
      </section>

      {/* Mission and Vision */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-semibold text-gray-900">
          Mission &amp; Vision
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="about-mission"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Our Mission
            </label>

            <textarea
              id="about-mission"
              rows={5}
              maxLength={2000}
              value={form.mission}
              onChange={(event) =>
                onChange("mission", event.target.value)
              }
              placeholder="Describe your brand's mission..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label
              htmlFor="about-vision"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Our Vision
            </label>

            <textarea
              id="about-vision"
              rows={5}
              maxLength={2000}
              value={form.vision}
              onChange={(event) =>
                onChange("vision", event.target.value)
              }
              placeholder="Describe your brand's vision..."
              className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Section Visibility
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Control whether this section appears on the public website.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={form.isActive}
            onClick={() =>
              onChange("isActive", !form.isActive)
            }
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              form.isActive ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                form.isActive ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          {form.isActive ? "Currently active" : "Currently hidden"}
        </p>
      </section>

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          {exists
            ? "Editing existing content"
            : "Creating new content"}
        </p>

        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Waiting for image upload..."
            : saving
              ? "Saving..."
              : exists
                ? "Save Changes"
                : "Create About Us"}
        </button>
      </div>
    </form>
  );
}
