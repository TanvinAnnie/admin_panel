
"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Upload, Image as ImageIcon, LoaderCircle, X } from "lucide-react";

interface HeroImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  data?: {
    url: string;
    publicId: string;
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

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      onChange(result.data.url);
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

          {uploading ? "Uploading..." : "Upload image"}
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
            className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
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
        <p className="break-all text-xs text-neutral-500">
          Uploaded image URL: {value}
        </p>
      )}

      {success && (
        <p role="status" className="text-sm text-green-700">
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
