"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PolicyLivePreview, {
  type PolicyFormData,
} from "@/components/dashboard/policies/PolicyLivePreview";

interface PolicyFormProps {
  mode: "create" | "edit";
  initialData?: PolicyFormData;
}

const defaultData: PolicyFormData = {
  title: "",
  description: "",
  icon: "",
  order: 0,
  isActive: true,
};

export default function PolicyForm({
  mode,
  initialData,
}: PolicyFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<PolicyFormData>({
    ...defaultData,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField<K extends keyof PolicyFormData>(
    field: K,
    value: PolicyFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    if (title.length > 150) {
      setError("Title cannot exceed 150 characters.");
      return;
    }

    if (description.length > 1000) {
      setError("Description cannot exceed 1000 characters.");
      return;
    }

    if (!Number.isInteger(Number(form.order)) || Number(form.order) < 0) {
      setError("Display order must be a non-negative integer.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...(mode === "edit" ? { _id: form._id } : {}),
        title,
        description,
        icon: form.icon.trim(),
        order: Number(form.order),
        isActive: form.isActive,
      };

      const response = await fetch("/api/policies", {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${mode === "create" ? "create" : "update"} policy.`
        );
      }

      setSuccess(
        mode === "create"
          ? "Policy created successfully."
          : "Policy updated successfully."
      );

      router.push("/policies");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Policy Information
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Enter the policy content and configure how it is displayed.
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
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <div>
          <label
            htmlFor="policy-title"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Policy Title <span className="text-red-500">*</span>
          </label>
          <input
            id="policy-title"
            type="text"
            required
            maxLength={150}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="e.g. Product Safety and Quality Policy"
            className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.title.length}/150
          </p>
        </div>

        <div>
          <label
            htmlFor="policy-description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="policy-description"
            required
            maxLength={1000}
            rows={5}
            value={form.description}
            onChange={(event) =>
              updateField("description", event.target.value)
            }
            placeholder="Write a short description of this policy..."
            className="w-full min-w-0 resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {form.description.length}/1000
          </p>
        </div>

        <div>
          <label
            htmlFor="policy-icon"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Icon
          </label>
          <input
            id="policy-icon"
            type="text"
            value={form.icon}
            onChange={(event) => updateField("icon", event.target.value)}
            placeholder="e.g. 🛡️ or ✦"
            className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Enter an emoji or symbol. This field does not upload an image or
            SVG file.
          </p>
        </div>

        <div>
          <label
            htmlFor="policy-order"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Display Order
          </label>
          <input
            id="policy-order"
            type="number"
            min={0}
            step={1}
            required
            value={form.order}
            onChange={(event) =>
              updateField(
                "order",
                event.target.value === "" ? 0 : Number(event.target.value)
              )
            }
            className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Policies are sorted by display order in the API.
          </p>
        </div>

        <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              updateField("isActive", event.target.checked)
            }
            className="mt-1 h-4 w-4 shrink-0 accent-violet-600"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">
              Active Policy
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Active policies can be displayed on the public website.
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={() => router.push("/policies")}
            className="min-h-11 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="min-h-11 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Policy"
                : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="min-w-0 xl:sticky xl:top-6">
        <PolicyLivePreview data={form} />
      </div>
    </div>
  );
}