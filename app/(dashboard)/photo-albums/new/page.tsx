
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PhotoAlbumForm, {
  type AlbumFormData,
  makeAlbumSlug,
} from "@/components/dashboard/photo-albums/PhotoAlbumForm";

import PhotoGalleryManager from "@/components/dashboard/photo-albums/PhotoGalleryManager";

import PhotoAlbumLivePreview from "@/components/dashboard/photo-albums/PhotoAlbumLivePreview";

export default function NewPhotoAlbumPage() {
  const router = useRouter();

  const [form, setForm] = useState<AlbumFormData>({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    photos: [],
    isActive: true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateForm(updates: Partial<AlbumFormData>) {
    setForm((current) => ({ ...current, ...updates }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Album title is required.");
      return;
    }

    if (!form.coverImage.trim()) {
      setError("Please upload a cover image.");
      return;
    }

    if (form.title.trim().length > 150) {
      setError("Album title cannot exceed 150 characters.");
      return;
    }

    if (form.description.trim().length > 2000) {
      setError("Description cannot exceed 2000 characters.");
      return;
    }

    const slug = makeAlbumSlug(form.slug || form.title);

    if (!slug) {
      setError("Please enter a valid album title or slug.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/photo-albums", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          slug,
          description: form.description.trim(),
          coverImage: form.coverImage.trim(),
          photos: form.photos,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create photo album."
        );
      }

      router.push("/photo-albums");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div>
        <Link
          href="/photo-albums"
          className="text-sm font-medium text-pink-600 hover:text-pink-700"
        >
          ← Back to Photo Albums
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Add Photo Album
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Create an album and organize its gallery photos.
        </p>
      </div>

      {/* Error Message */}
      {error && (
  <div
    role="alert"
    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
  >
    {error}
  </div>
)}

      {/* Responsive Content */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
          <PhotoAlbumForm
            value={form}
            onChange={updateForm}
            disabled={saving}
          />

          <PhotoGalleryManager
            photos={form.photos}
            onChange={(photos) => updateForm({ photos })}
            disabled={saving}
          />

          {/* Form Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/photo-albums"
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating Album..." : "Create Photo Album"}
            </button>
          </div>
        </form>

        {/* Shared Live Preview */}
        <PhotoAlbumLivePreview album={form} />
      </div>
    </div>
  );
}
