
"use client";

import { useRef, useState } from "react";

interface PhotoGalleryManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  disabled?: boolean;
}

const MAX_PHOTOS = 100;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PhotoGalleryManager({
  photos,
  onChange,
  disabled = false,
}: PhotoGalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleFilesSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.currentTarget;
    const selectedFiles = Array.from(input.files ?? []);

    // Allow selecting the same files again later.
    input.value = "";

    if (selectedFiles.length === 0) return;

    setError("");
    setNotice("");

    const remainingSlots = MAX_PHOTOS - photos.length;

    if (remainingSlots <= 0) {
      setError(`You can add a maximum of ${MAX_PHOTOS} gallery photos.`);
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can select up to ${remainingSlots} more photo(s).`
      );
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size === 0 ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setError(
        `"${invalidFile.name}" is invalid. Select JPG, PNG, or WebP images up to 5 MB each.`
      );
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: selectedFiles.length });

    const uploadedUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      // Upload sequentially so we can report reliable progress.
      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const body = new FormData();

        body.append("file", file);
        body.append("context", "photo-albums");

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body,
          });

          const result = await response.json();

          if (!response.ok || !result.success || !result.url) {
            throw new Error(
              result.message || "Upload failed."
            );
          }

          uploadedUrls.push(result.url);
        } catch {
          failedFiles.push(file.name);
        }

        setProgress({
          current: index + 1,
          total: selectedFiles.length,
        });
      }

      if (uploadedUrls.length > 0) {
        onChange([...photos, ...uploadedUrls]);
      }

      if (failedFiles.length > 0) {
        setError(
          `Could not upload ${failedFiles.length} file(s): ${failedFiles.join(", ")}.`
        );
      }

      if (uploadedUrls.length > 0) {
        setNotice(
          `${uploadedUrls.length} photo(s) uploaded successfully.`
        );
      }
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
    setNotice("");
    setError("");
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Gallery Photos
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Select photos from your device to upload to Cloudinary.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
          {photos.length}/{MAX_PHOTOS} photos
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled || uploading || photos.length >= MAX_PHOTOS}
        onChange={handleFilesSelected}
        className="hidden"
      />

      <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-5 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" />
          </svg>
        </div>

        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          Upload gallery photos
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          JPG, PNG or WebP · Up to 5 MB per image · Maximum 100 photos
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={
            disabled || uploading || photos.length >= MAX_PHOTOS
          }
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading photos..." : "Choose Photos"}
        </button>

        {uploading && (
          <div
            className="mx-auto mt-4 max-w-sm space-y-2"
            role="status"
            aria-live="polite"
          >
            <div className="h-2 overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-pink-600 transition-all"
                style={{
                  width: `${
                    progress.total
                      ? (progress.current / progress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-600">
              Uploading {progress.current} of {progress.total}...
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {notice}
        </div>
      )}

      {photos.length === 0 ? (
        <div className="rounded-xl border border-gray-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            No gallery photos yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Choose photos above to build your gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={`${photo}-${index}`}
              className="group relative min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <img
                src={photo}
                alt={`Gallery photo ${index + 1}`}
                loading="lazy"
                className="h-32 w-full object-cover sm:h-36"
              />

              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                Photo {index + 1}
              </span>

              <button
                type="button"
                onClick={() => removePhoto(index)}
                disabled={disabled || uploading}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-2 top-2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
