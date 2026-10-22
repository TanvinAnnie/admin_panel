
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PolicyStats from "@/components/dashboard/policies/PolicyStats";
import PolicyCard, {
  type PolicyItem,
} from "@/components/dashboard/policies/PolicyCard";

type StatusFilter = "all" | "active" | "inactive";

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Initial loading: do not synchronously update loading/error here.
  useEffect(() => {
    let cancelled = false;

    async function loadPolicies() {
      try {
        const response = await fetch("/api/policies", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load policies."
          );
        }

        if (!cancelled) {
          setPolicies(result.data ?? []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPolicies();

    return () => {
      cancelled = true;
    };
  }, []);

  // Used for manual retries.
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/policies", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load policies."
        );
      }

      setPolicies(result.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const activeCount = policies.filter(
    (policy) => policy.isActive
  ).length;

  const inactiveCount = policies.length - activeCount;

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const title = (policy.title ?? "").toLowerCase();
      const description = (policy.description ?? "").toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && policy.isActive) ||
        (statusFilter === "inactive" && !policy.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [policies, search, statusFilter]);

  async function handleDelete(policy: PolicyItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${policy.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(policy._id);
    setError("");

    try {
      const response = await fetch(
        `/api/policies?id=${encodeURIComponent(policy._id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete policy."
        );
      }

      setPolicies((current) =>
        current.filter((item) => item._id !== policy._id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete policy."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-violet-600">
            Website Management
          </p>

          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Policies
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage website policies, descriptions, icons, and display order.
          </p>
        </div>

        <Link
          href="/policies/new"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
        >
          + Add Policy
        </Link>
      </header>

      <PolicyStats
        total={policies.length}
        active={activeCount}
        inactive={inactiveCount}
      />

      <section className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="policy-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search policies
            </label>

            <input
              id="policy-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description..."
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="w-full min-w-0 md:w-52 md:shrink-0">
            <label
              htmlFor="policy-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="policy-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="all">All policies</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredPolicies.length}
            </span>{" "}
            of {policies.length} policies
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="min-h-9 rounded-lg px-3 py-2 text-sm font-medium text-violet-600 transition hover:bg-violet-50"
          >
            Clear filters
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex min-w-0 flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="break-words">{error}</p>

          <button
            type="button"
            onClick={() => void fetchPolicies()}
            disabled={loading}
            className="shrink-0 self-start font-semibold underline disabled:opacity-50 sm:self-auto"
          >
            {loading ? "Loading..." : "Try again"}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : filteredPolicies.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-2xl text-violet-600">
            ✦
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {policies.length === 0
              ? "No policies yet"
              : "No matching policies"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {policies.length === 0
              ? "Create your first policy to manage the content displayed on your website."
              : "Try another search term or change the status filter."}
          </p>

          {policies.length === 0 ? (
            <Link
              href="/policies/new"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Add your first policy
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-violet-600 hover:bg-violet-50"
            >
              Reset filters
            </button>
          )}
        </section>
      ) : (
        <section
          aria-label="Policy list"
          className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
        >
          {filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy._id}
              policy={policy}
              deleting={deletingId === policy._id}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </main>
  );
}
