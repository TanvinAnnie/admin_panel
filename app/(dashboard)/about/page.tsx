
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AboutForm, {
  type AboutFormData,
} from "@/components/dashboard/about/AboutForm";

import AboutLivePreview from "@/components/dashboard/about/AboutLivePreview";

const initialData: AboutFormData = {
  title: "",
  subtitle: "",
  story: "",
  image: "",
  mission: "",
  vision: "",
  isActive: true,
};

type AboutApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  data?: AboutFormData | null;
};

async function parseApiResponse(
  response: Response
): Promise<AboutApiResponse> {
  const responseText = await response.text();

  if (!responseText.trim()) {
    throw new Error(
      `The API returned an empty response (HTTP ${response.status}). Check app/api/about/admin/route.ts and the terminal logs.`
    );
  }

  let result: AboutApiResponse;

  try {
    result = JSON.parse(responseText) as AboutApiResponse;
  } catch {
    throw new Error(
      `The API returned invalid JSON (HTTP ${response.status}). Check the API route and terminal logs.`
    );
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        result.error ||
        `Request failed with status ${response.status}.`
    );
  }

  return result;
}

export default function AboutPage() {
  const [form, setForm] = useState<AboutFormData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAbout() {
      try {
        const response = await fetch("/api/about/admin", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await parseApiResponse(response);

        if (controller.signal.aborted) return;

        if (result.data) {
          setForm({
            ...initialData,
            ...result.data,
          });
          setExists(true);
        } else {
          setForm(initialData);
          setExists(false);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Fetch About error:", error);

        if (!controller.signal.aborted) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load About Us content."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAbout();

    return () => {
      controller.abort();
    };
  }, []);

  function handleChange(
    field: keyof AboutFormData,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (uploading) {
      toast.error("Please wait until the image upload finishes.");
      return;
    }

    if (saving) return;

    if (!form.title.trim() || !form.story.trim()) {
      toast.error("Title and brand story are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/about/admin", {
        method: exists ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          story: form.story.trim(),
          image: form.image,
          mission: form.mission.trim(),
          vision: form.vision.trim(),
          isActive: form.isActive,
        }),
      });

      const result = await parseApiResponse(response);

      if (!result.data) {
        throw new Error(
          "The API did not return the saved About Us data."
        );
      }

      setForm((previous) => ({
        ...previous,
        ...result.data,
      }));

      setExists(true);

      toast.success(
        result.message || "About Us saved successfully."
      );
    } catch (error) {
      console.error("Save About error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save About Us."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading About Us content...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          About Us
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your brand story, image, mission, and vision.
        </p>
      </header>

      <AboutForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        saving={saving}
        uploading={uploading}
        onUploadingChange={setUploading}
        exists={exists}
      />

      <AboutLivePreview form={form} />
    </div>
  );
}
