
"use client";

import { useState } from "react";
import HeroImageUpload from "@/components/dashboard/hero/HeroImageUpload";

export interface AlbumFormData {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  photos: string[];
  isActive: boolean;
}

interface PhotoAlbumFormProps {
  value: AlbumFormData;
  onChange: (updates: Partial<AlbumFormData>) => void;
  disabled?: boolean;
}

export function makeAlbumSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PhotoAlbumForm({
  value,
  onChange,
  disabled = false,
}: PhotoAlbumFormProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  return (
    <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Album Information
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Add the album details and choose its cover image.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="album-title" className="text-sm font-medium text-gray-700">
          Album Title <span className="text-red-500">*</span>
        </label>
        <input
          id="album-title"
          required
          maxLength={150}
          disabled={disabled}
          value={value.title}
          onChange={(event) => {
            const title = event.target.value;
            onChange({
              title,
              ...(!slugManuallyEdited
                ? { slug: makeAlbumSlug(title) }
                : {}),
            });
          }}
          placeholder="e.g. New Collection 2026"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="album-slug" className="text-sm font-medium text-gray-700">
          Album Slug
        </label>
        <input
          id="album-slug"
          disabled={disabled}
          value={value.slug}
          onChange={(event) => {
            setSlugManuallyEdited(true);
            onChange({ slug: makeAlbumSlug(event.target.value) });
          }}
          placeholder="new-collection-2026"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100"
        />
        <p className="break-all text-xs text-gray-500">
          URL slug: /photo-albums/{value.slug || "your-album-slug"}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="album-description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="album-description"
          rows={4}
          maxLength={2000}
          disabled={disabled}
          value={value.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Write a short description about this album..."
          className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 disabled:bg-gray-100"
        />
        <p className="text-right text-xs text-gray-400">
          {value.description.length}/2000
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">
          Cover Image <span className="text-red-500">*</span>
        </label>
        <HeroImageUpload
          value={value.coverImage}
          onChange={(url) => onChange({ coverImage: url })}
          disabled={disabled}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">Publish Album</p>
          <p className="mt-1 text-xs text-gray-500">
            Active albums can be displayed on the public website.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-label="Publish album"
          aria-checked={value.isActive}
          disabled={disabled}
          onClick={() => onChange({ isActive: !value.isActive })}
          className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
            value.isActive ? "bg-pink-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
              value.isActive ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </section>
  );
}
