
"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PhotoAlbumForm, {
  type AlbumFormData,
  makeAlbumSlug,
} from "@/components/dashboard/photo-albums/PhotoAlbumForm";

import PhotoGalleryManager from "@/components/dashboard/photo-albums/PhotoGalleryManager";

import PhotoAlbumLivePreview from "@/components/dashboard/photo-albums/PhotoAlbumLivePreview";

interface PhotoAlbum {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  photos: string[];
  isActive: boolean;
}

export default function EditPhotoAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [form, setForm] = useState<AlbumFormData>({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    photos: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const loadAlbum = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/photo-albums", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load photo albums.");
      }

      const album = (result.data as PhotoAlbum[]).find(
        (item) => item._id === id
      );

      if (!album) {
        throw new Error("Photo album not found.");
      }

      setForm({
        title: album.title,
        slug: album.slug,
        description: album.description || "",
        coverImage: album.coverImage,
        photos: album.photos || [],
        isActive: album.isActive,
      });

      setLoaded(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load photo album."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAlbum() {
      try {
        const response = await fetch("/api/photo-albums", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load photo albums.");
        }

        const album = (result.data as PhotoAlbum[]).find(
          (item) => item._id === id
        );

        if (!album) {
          throw new Error("Photo album not found.");
        }

        if (!cancelled) {
          setForm({
            title: album.title,
            slug: album.slug,
            description: album.description || "",
            coverImage: album.coverImage,
            photos: album.photos || [],
            isActive: album.isActive,
          });

          setLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load photo album."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAlbum();

    return () => {
      cancelled = true;
    };
  }, [id]);

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
      setError("Please select a cover image.");
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
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
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
        throw new Error(result.message || "Failed to update photo album.");
      }

      router.push("/photo-albums");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">
        Loading photo album...
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="space-y-4 p-6">
        <p role="alert" className="text-sm text-red-600">
          {error || "Photo album could not be loaded."}
        </p>

        <Link
          href="/photo-albums"
          className="inline-flex rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to Photo Albums
        </Link>

        <button
          type="button"
          onClick={() => void loadAlbum()}
          className="ml-2 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700"
        >
          Try Again
        </button>
      </div>
    );
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
          Edit Photo Album
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Update the album information, cover image, and gallery photos.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

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

          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/photo-albums"
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>

        <PhotoAlbumLivePreview album={form} />
      </div>
    </div>
  );
}
