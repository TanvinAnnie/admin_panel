"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PolicyForm from "@/components/dashboard/policies/PolicyForm";
import type { PolicyFormData } from "@/components/dashboard/policies/PolicyLivePreview";

interface ApiPolicy extends PolicyFormData {
  _id: string;
}

export default function EditPolicyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [policy, setPolicy] = useState<PolicyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPolicy() {
      if (!id) {
        setError("Policy ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/policies", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load policies.");
        }

        const policies: ApiPolicy[] = result.data ?? [];
        const found = policies.find((item) => item._id === id);

        if (!found) {
          throw new Error("Policy not found. It may have been deleted.");
        }

        if (!cancelled) {
          setPolicy({
            _id: found._id,
            title: found.title ?? "",
            description: found.description ?? "",
            icon: found.icon ?? "",
            order: found.order ?? 0,
            isActive: found.isActive ?? true,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load policy."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPolicy();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  if (error || !policy) {
    return (
      <main className="w-full min-w-0 space-y-5 p-4 sm:p-6 lg:p-8">
        <Link
          href="/policies"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to Policies
        </Link>

        <div
          role="alert"
          className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "Unable to load this policy."}
        </div>

        <button
          type="button"
          onClick={() => router.refresh()}
          className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Refresh Page
        </button>
      </main>
    );
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <Link
          href="/policies"
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to Policies
        </Link>

        <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Policy
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Update the policy title, description, icon, display order, and status.
        </p>
      </header>

      <PolicyForm key={policy._id} mode="edit" initialData={policy} />
    </main>
  );
}