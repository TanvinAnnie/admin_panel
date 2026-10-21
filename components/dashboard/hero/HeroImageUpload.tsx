
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  Upload,
  Image as ImageIcon,
  LoaderCircle,
  X,
} from "lucide-react";

interface HeroImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  url?: string;
  publicId?: string;
  data?: {
    url?: string;
    publicId?: string;
  };
}

export default function HeroImageUpload({
  value,
  onChange,
  disabled = false,
}: HeroImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Image size must be greater than 0 and not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // Keep the existing Hero upload destination.
    formData.append("context", "hero");

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let result: UploadResponse;

      try {
        result = (await response.json()) as UploadResponse;
      } catch {
        throw new Error("The server returned an invalid upload response.");
      }

      // Support both the original and updated API response formats.
      const uploadedUrl = result.url ?? result.data?.url;

      if (!response.ok || !result.success || !uploadedUrl) {
        throw new Error(result.message || "Image upload failed.");
      }

      onChange(uploadedUrl);
      setSuccess("Image uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong during upload."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}

          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
        </button>

        {value && (
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => {
              onChange("");
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Remove image
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      <div className="flex items-start gap-2 text-xs text-neutral-500">
        <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>JPG, PNG, or WebP · Maximum size 5 MB.</p>
      </div>

      {value && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
            <img
              src={value}
              alt="Uploaded cover preview"
              className="max-h-64 w-full object-contain"
              onError={() => {
                setError(
                  "The image URL was saved, but the preview could not load."
                );
              }}
              onLoad={() => {
                setError("");
              }}
            />
          </div>

          <p className="break-all text-xs text-neutral-500">
            Image URL: {value}
          </p>
        </div>
      )}

      {success && (
        <p role="status" className="text-sm text-green-700">
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="break-words text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
