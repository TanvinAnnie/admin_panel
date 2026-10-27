
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import type { PortfolioItem } from "./PortfolioTable";

interface PortfolioFormProps {
  mode: "create" | "edit";
  initialData?: PortfolioItem;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  url?: string;
  publicId?: string;
}

export default function PortfolioForm({
  mode,
  initialData,
}: PortfolioFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [author, setAuthor] = useState(initialData?.author ?? "");
  const [order, setOrder] = useState(
    String(initialData?.order ?? 0)
  );
  const [isActive, setIsActive] = useState(
    initialData?.isActive ?? true
  );

  const [image, setImage] = useState(initialData?.image ?? "");
  const [imagePublicId, setImagePublicId] = useState(
    initialData?.imagePublicId ?? ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialData?.image ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
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
      setError("Only JPG, PNG, and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Image size must be between 1 byte and 5 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function uploadImage(): Promise<{
    url: string;
    publicId: string;
  }> {
    if (!selectedFile) {
      if (image && imagePublicId) {
        return { url: image, publicId: imagePublicId };
      }

      throw new Error("Please select a portfolio image.");
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("context", "portfolio");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const result = (await response.json()) as ApiResponse;

    if (!response.ok || !result.success || !result.url || !result.publicId) {
      throw new Error(result.message || "Image upload failed.");
    }

    return {
      url: result.url,
      publicId: result.publicId,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !author.trim()) {
      setError("Please enter both the project title and author.");
      return;
    }

    if (mode === "edit" && !initialData?._id) {
      setError("Portfolio item information is missing.");
      return;
    }

    if (!selectedFile && (!image || !imagePublicId)) {
      setError("Please select a portfolio image.");
      return;
    }

    const parsedOrder = Number(order);

    if (
      !Number.isInteger(parsedOrder) ||
      !Number.isFinite(parsedOrder) ||
      parsedOrder < 0
    ) {
      setError("Display order must be a non-negative whole number.");
      return;
    }

    setLoading(true);

    try {
      const uploadedImage = await uploadImage();

      const payload = {
        title: title.trim(),
        author: author.trim(),
        image: uploadedImage.url,
        imagePublicId: uploadedImage.publicId,
        order: parsedOrder,
        isActive,
      };

      const endpoint =
        mode === "create"
          ? "/api/portfolio"
          : `/api/portfolio/${initialData!._id}`;

      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${mode === "create" ? "create" : "update"} portfolio item.`
        );
      }

      setSuccess(
        mode === "create"
          ? "Portfolio item created successfully."
          : "Portfolio item updated successfully."
      );

      router.push("/portfolio");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Project Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the details displayed with this portfolio project.
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="portfolio-title"
                className="block text-sm font-medium text-gray-700"
              >
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                id="portfolio-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter project title"
                maxLength={200}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="portfolio-author"
                className="block text-sm font-medium text-gray-700"
              >
                Author <span className="text-red-500">*</span>
              </label>
              <input
                id="portfolio-author"
                type="text"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                placeholder="Enter author name"
                maxLength={120}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="portfolio-order"
                className="block text-sm font-medium text-gray-700"
              >
                Display Order
              </label>
              <input
                id="portfolio-order"
                type="number"
                min={0}
                step={1}
                value={order}
                onChange={(event) => setOrder(event.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500">
                Smaller numbers appear first.
              </p>
            </div>
          </section>

          <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Portfolio Image
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload a JPG, PNG, or WebP image up to 5 MB.
              </p>
            </div>

            {preview ? (
              <div className="space-y-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-video">
                  <Image
                    src={preview}
                    alt="Portfolio image preview"
                    fill
                    unoptimized={Boolean(selectedFile)}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex min-h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center transition hover:border-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="text-sm font-medium text-gray-800">
                  Click to upload an image
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  JPG, PNG or WebP · Maximum 5 MB
                </span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Publishing
            </h2>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={loading}
                className="mt-1 size-4 rounded border-gray-300 accent-gray-900"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">
                  Active
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  Active projects can be displayed on the client website.
                </span>
              </span>
            </label>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Before publishing
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-2 text-xs leading-5 text-gray-500">
              <li>Check the project title and author.</li>
              <li>Use a clear, high-quality image.</li>
              <li>Confirm the display order.</li>
            </ul>
          </section>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/portfolio")}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {loading
            ? "Saving..."
            : mode === "create"
              ? "Create Portfolio"
              : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
