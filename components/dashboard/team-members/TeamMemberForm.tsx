
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TeamMemberLivePreview from "./TeamMemberLivePreview";

export interface TeamMemberFormData {
  _id?: string;
  name: string;
  position: string;
  image: string;
  imagePublicId: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  order: number;
  isActive: boolean;
}

interface TeamMemberFormProps {
  mode: "create" | "edit";
  initialData?: TeamMemberFormData;
}

const emptyForm: TeamMemberFormData = {
  name: "",
  position: "",
  image: "",
  imagePublicId: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  order: 0,
  isActive: true,
};

const inputClass =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

function isValidOptionalUrl(value: string) {
  if (!value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export default function TeamMemberForm({
  mode,
  initialData,
}: TeamMemberFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<TeamMemberFormData>(() => ({
    ...emptyForm,
    ...initialData,
  }));

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof TeamMemberFormData>(
    field: K,
    value: TeamMemberFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    // Allow choosing the same file again after an upload.
    event.target.value = "";

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("Image size must be between 1 byte and 5 MB.");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("context", "team-members");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.message || "Image upload failed.");
      }

      setForm((current) => ({
        ...current,
        image: result.url,
        imagePublicId: result.publicId || "",
      }));

      setSuccess("Profile image uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = form.name.trim();
    const position = form.position.trim();

    if (!name || !position || !form.image.trim()) {
      setError("Name, position, and profile image are required.");
      return;
    }

    if (name.length > 150 || position.length > 150) {
      setError("Name and position must not exceed 150 characters.");
      return;
    }

    if (!Number.isInteger(Number(form.order)) || Number(form.order) < 0) {
      setError("Display order must be a non-negative integer.");
      return;
    }

    const socialFields = [
      { label: "Facebook", value: form.facebook },
      { label: "Instagram", value: form.instagram },
      { label: "LinkedIn", value: form.linkedin },
    ];

    for (const field of socialFields) {
      if (!isValidOptionalUrl(field.value)) {
        setError(`${field.label} must be a valid HTTP or HTTPS URL.`);
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        name,
        position,
        facebook: form.facebook.trim(),
        instagram: form.instagram.trim(),
        linkedin: form.linkedin.trim(),
        order: Number(form.order),
      };

      const response = await fetch("/api/team-members", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save team member."
        );
      }

      setSuccess(
        mode === "create"
          ? "Team member created successfully."
          : "Team member updated successfully."
      );

      router.push("/team-members");
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
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Member Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {"Add the team member's details and profile links."}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="break-words rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="break-words rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <div className="grid min-w-0 grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="member-name"
              className="text-sm font-semibold text-slate-700"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="member-name"
              value={form.name}
              onChange={(event) =>
                updateField("name", event.target.value)
              }
              maxLength={150}
              required
              placeholder="e.g. Jahangir Saiful Islam"
              className={inputClass}
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="member-position"
              className="text-sm font-semibold text-slate-700"
            >
              Position <span className="text-red-500">*</span>
            </label>
            <input
              id="member-position"
              value={form.position}
              onChange={(event) =>
                updateField("position", event.target.value)
              }
              maxLength={150}
              required
              placeholder="e.g. Managing Director"
              className={inputClass}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="member-image"
            className="text-sm font-semibold text-slate-700"
          >
            Profile Image <span className="text-red-500">*</span>
          </label>

          <input
            id="member-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            disabled={uploading || saving}
            className="mt-2 block min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:min-h-11 file:border-0 file:bg-slate-50 file:px-4 file:font-semibold file:text-slate-700 hover:file:bg-slate-100 disabled:opacity-60"
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            JPG, PNG, or WebP. Maximum 5 MB.
          </p>

          {uploading && (
            <p className="mt-2 text-sm font-medium text-violet-600">
              Uploading image to Cloudinary...
            </p>
          )}

          {form.image && (
            <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={form.image}
                  alt="Selected team member"
                  fill
                  sizes="96px"
                  className="object-cover object-top"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-all text-sm font-medium text-slate-700">
                  Profile image selected
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      image: "",
                      imagePublicId: "",
                    }));
                    setSuccess("");
                  }}
                  className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Remove image
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-base font-bold text-slate-900">
            Social Media Links
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Leave a field empty if the member does not have that profile.
          </p>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-5">
            <div className="min-w-0">
              <label
                htmlFor="member-facebook"
                className="text-sm font-semibold text-slate-700"
              >
                Facebook URL
              </label>
              <input
                id="member-facebook"
                type="url"
                value={form.facebook}
                onChange={(event) =>
                  updateField("facebook", event.target.value)
                }
                placeholder="https://facebook.com/..."
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="member-instagram"
                className="text-sm font-semibold text-slate-700"
              >
                Instagram URL
              </label>
              <input
                id="member-instagram"
                type="url"
                value={form.instagram}
                onChange={(event) =>
                  updateField("instagram", event.target.value)
                }
                placeholder="https://instagram.com/..."
                className={inputClass}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="member-linkedin"
                className="text-sm font-semibold text-slate-700"
              >
                LinkedIn URL
              </label>
              <input
                id="member-linkedin"
                type="url"
                value={form.linkedin}
                onChange={(event) =>
                  updateField("linkedin", event.target.value)
                }
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label
              htmlFor="member-order"
              className="text-sm font-semibold text-slate-700"
            >
              Display Order
            </label>
            <input
              id="member-order"
              type="number"
              min={0}
              step={1}
              value={form.order}
              onChange={(event) =>
                updateField(
                  "order",
                  event.target.value === ""
                    ? 0
                    : Number(event.target.value)
                )
              }
              className={inputClass}
            />
            <p className="mt-2 text-xs text-slate-500">
              Lower numbers appear first.
            </p>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <label
              htmlFor="member-active"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3"
            >
              <input
                id="member-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
                className="h-4 w-4 accent-violet-600"
              />
              <span className="text-sm font-medium text-slate-700">
                Active on website
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.push("/team-members")}
            disabled={saving || uploading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading
              ? "Uploading image..."
              : saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Team Member"
                  : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="min-w-0 xl:sticky xl:top-6">
        <TeamMemberLivePreview
          name={form.name}
          position={form.position}
          image={form.image}
          facebook={form.facebook}
          instagram={form.instagram}
          linkedin={form.linkedin}
          order={form.order}
          isActive={form.isActive}
        />
      </div>
    </div>
  );
}
