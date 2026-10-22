
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import FeatureForm, {
  type FeatureFormData,
} from "@/components/dashboard/features/FeatureForm";

export default function EditFeaturePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [feature, setFeature] = useState<FeatureFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadFeature() {
      if (!id) {
        setError("Feature ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/features", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load features."
          );
        }

        const found = (result.data ?? []).find(
          (item: FeatureFormData) => item._id === id
        );

        if (!found) {
          throw new Error("Feature not found.");
        }

        if (!cancelled) {
          setFeature({
            _id: found._id,
            title: found.title ?? "",
            description: found.description ?? "",
            icon: found.icon ?? "",
            image: found.image ?? "",
            order: found.order ?? 0,
            isActive: found.isActive ?? true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load feature."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFeature();

    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  if (error || !feature) {
    return (
      <main className="w-full min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
        <Link
          href="/features"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          ← Back to Features
        </Link>

        <div
          role="alert"
          className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "Unable to load this feature."}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="min-h-10 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>

          <button
            type="button"
            onClick={() => router.push("/features")}
            className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Features
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <Link
          href="/features"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          ← Back to Features
        </Link>

        <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Feature
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update the feature information, image, display order, and status.
        </p>
      </header>

      <FeatureForm
        key={feature._id}
        mode="edit"
        initialData={feature}
      />
    </main>
  );
}
