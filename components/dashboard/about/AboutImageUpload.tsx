
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

interface AboutImageUploadProps {
  image: string;
  onChange: (image: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

export default function AboutImageUpload({
  image,
  onChange,
  onUploadingChange,
}: AboutImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must not exceed 5MB");
      input.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", "about");

    setUploading(true);
    onUploadingChange(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(
          result.message || "Image upload failed"
        );
      }

      onChange(result.url);

      toast.success("About image uploaded successfully");
    } catch (error) {
      console.error("About image upload error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      onUploadingChange(false);

      // Allow selecting the same file again.
      input.value = "";
    }
  }

  function handleRemove() {
    if (uploading) return;

    onChange("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          About Us Image
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Upload a brand image. JPG, PNG, or WebP, maximum 5MB.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Upload controls */}
        <div className="flex flex-col items-start justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:font-medium file:text-gray-800 hover:file:bg-gray-200 disabled:opacity-50"
          />

          {uploading && (
            <p
              role="status"
              className="mt-3 text-sm text-gray-500"
            >
              Uploading image to Cloudinary...
            </p>
          )}

          {image && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="mt-4 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
            >
              Remove image
            </button>
          )}
        </div>

        {/* Image preview */}
        <div className="relative min-h-52 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt="About Us image preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-2"
            />
          ) : (
            <div className="flex min-h-52 items-center justify-center px-4 text-center text-sm text-gray-400">
              No image selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
