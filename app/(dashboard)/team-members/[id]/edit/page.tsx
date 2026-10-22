
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import TeamMemberForm, {
  type TeamMemberFormData,
} from "@/components/dashboard/team-members/TeamMemberForm";

type TeamMemberApiResponse = {
  success?: boolean;
  message?: string;
  data?: TeamMemberFormData | TeamMemberFormData[] | null;
};

export default function EditTeamMemberPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [member, setMember] = useState<TeamMemberFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMember() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/team-members", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result: TeamMemberApiResponse = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to load team members."
          );
        }

        const data = result.data;

        const found = Array.isArray(data)
          ? data.find((item) => String(item._id) === id)
          : data && String(data._id) === id
            ? data
            : null;

        if (!found) {
          throw new Error("Team member not found.");
        }

        if (controller.signal.aborted) return;

        setMember({
          _id: found._id,
          name: found.name ?? "",
          position: found.position ?? "",
          image: found.image ?? "",
          imagePublicId: found.imagePublicId ?? "",
          facebook: found.facebook ?? "",
          instagram: found.instagram ?? "",
          linkedin: found.linkedin ?? "",
          order: found.order ?? 0,
          isActive: found.isActive ?? true,
        });
      } catch (err: unknown) {
        if (
          controller.signal.aborted ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load team member."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      void loadMember();
    }

    return () => controller.abort();
  }, [id, retryCount]);

  function handleRetry() {
    setMember(null);
    setError("");
    setLoading(true);
    setRetryCount((count) => count + 1);
  }

  if (loading && id) {
    return (
      <main className="min-h-[60vh] space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6">
          <LoaderCircle className="h-8 w-8 animate-spin text-violet-600" />
          <p className="mt-4 text-sm font-medium text-slate-700">
            Loading team member...
          </p>
        </div>
      </main>
    );
  }

  if (error || !member || !id) {
    return (
      <main className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
        <Link
          href="/team-members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team Members
        </Link>

        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">
              Unable to load team member
            </p>
            <p className="mt-1 break-words">
              {error ||
                (!id
                  ? "Team member ID is missing."
                  : "This team member could not be found.")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <Link
          href="/team-members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team Members
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Team Member
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Update the team member&apos;s profile, photo, position,
          and social media links.
        </p>
      </header>

      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <TeamMemberForm
          key={member._id}
          mode="edit"
          initialData={member}
        />
      </section>
    </main>
  );
}
