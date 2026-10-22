
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import TeamMemberCard, {
  type TeamMemberItem,
} from "@/components/dashboard/team-members/TeamMemberCard";
import TeamMemberStats from "@/components/dashboard/team-members/TeamMemberStats";

type StatusFilter = "all" | "active" | "inactive";

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: TeamMemberItem[];
};

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch members directly in the effect.
  // State updates happen only after the asynchronous request completes.
  useEffect(() => {
    const controller = new AbortController();

    async function loadMembers() {
      try {
        const response = await fetch("/api/team-members", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ApiResponse = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to fetch team members."
          );
        }

        if (controller.signal.aborted) return;

        setMembers(Array.isArray(result.data) ? result.data : []);
        setError("");
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
            : "Failed to fetch team members."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  const activeCount = useMemo(
    () => members.filter((member) => member.isActive).length,
    [members]
  );

  const inactiveCount = members.length - activeCount;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        (member.name ?? "").toLowerCase().includes(query) ||
        (member.position ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && member.isActive) ||
        (statusFilter === "inactive" && !member.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  async function handleDelete(member: TeamMemberItem) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${member.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(member._id);
    setError("");

    try {
      const response = await fetch(
        `/api/team-members?id=${encodeURIComponent(member._id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to delete team member."
        );
      }

      setMembers((currentMembers) =>
        currentMembers.filter(
          (item) => item._id !== member._id
        )
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete team member."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleRetry() {
    // This runs from a button click, not synchronously in an effect.
    setError("");
    setLoading(true);
    setRetryCount((current) => current + 1);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-violet-600">
            Website Management
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Team Members
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your team profiles, photos and social media links.
          </p>
        </div>

        <Link
          href="/team-members/new"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
        >
          + Add Member
        </Link>
      </header>

      {/* Statistics */}
      <TeamMemberStats
        total={members.length}
        active={activeCount}
        inactive={inactiveCount}
      />

      {/* Search and filters */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="min-w-0">
            <label
              htmlFor="member-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search members
            </label>

            <input
              id="member-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or position..."
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="member-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="member-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="all">All members</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <strong className="text-slate-800">
              {filteredMembers.length}
            </strong>{" "}
            of {members.length} members
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="min-h-9 rounded-lg px-3 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="break-words">{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            className="shrink-0 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Members */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <div className="text-3xl text-violet-600">♙</div>

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            {members.length === 0
              ? "No team members yet"
              : "No matching members"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {members.length === 0
              ? "Add your first team member to get started."
              : "Try changing the search or status filter."}
          </p>

          {members.length === 0 ? (
            <Link
              href="/team-members/new"
              className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Add your first member
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 min-h-10 rounded-xl border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </section>
      ) : (
        <section
          aria-label="Team members"
          className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
        >
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member._id}
              member={member}
              deleting={deletingId === member._id}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </main>
  );
}
