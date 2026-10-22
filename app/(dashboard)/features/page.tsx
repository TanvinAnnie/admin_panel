
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import FeatureStats from "@/components/dashboard/features/FeatureStats";
import FeatureCard, {
  type FeatureItem,
} from "@/components/dashboard/features/FeatureCard";

type StatusFilter = "all" | "active" | "inactive";

export default function FeaturesPage() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Fetch features whenever the page loads or retry is requested.
  useEffect(() => {
    let cancelled = false;

    async function loadFeatures() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/features", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load features."
          );
        }

        if (!cancelled) {
          setFeatures(result.data ?? []);
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

    void loadFeatures();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const activeCount = features.filter(
    (item) => item.isActive
  ).length;

  const inactiveCount = features.length - activeCount;

  const filteredFeatures = useMemo(() => {
    const query = search.trim().toLowerCase();

    return features.filter((feature) => {
      const matchesSearch =
        !query ||
        feature.title.toLowerCase().includes(query) ||
        feature.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && feature.isActive) ||
        (statusFilter === "inactive" && !feature.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [features, search, statusFilter]);

  async function handleDelete(feature: FeatureItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${feature.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(feature._id);
    setError("");

    try {
      const response = await fetch(
        `/api/features?id=${encodeURIComponent(feature._id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete feature."
        );
      }

      setFeatures((current) =>
        current.filter((item) => item._id !== feature._id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete feature."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-blue-600">
            Website Management
          </p>

          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Features
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage the features displayed on your website.
          </p>
        </div>

        <Link
          href="/features/new"
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
        >
          + Add Feature
        </Link>
      </header>

      {/* Statistics */}
      <FeatureStats
        total={features.length}
        active={activeCount}
        inactive={inactiveCount}
      />

      {/* Search and filters */}
      <section className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="feature-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Search features
            </label>

            <input
              id="feature-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description..."
              className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="w-full min-w-0 md:w-52 md:shrink-0">
            <label
              htmlFor="feature-status"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="feature-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as StatusFilter
                )
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All features</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredFeatures.length}
            </span>{" "}
            of {features.length} features
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="min-h-9 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Clear filters
          </button>
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="break-words">{error}</p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setReloadKey((current) => current + 1);
            }}
            className="shrink-0 self-start font-semibold underline sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : filteredFeatures.length === 0 ? (
        /* Empty state */
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
            ✦
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {features.length === 0
              ? "No features yet"
              : "No matching features"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {features.length === 0
              ? "Add your first feature to start managing the website content."
              : "Try another search term or change the status filter."}
          </p>

          {features.length === 0 ? (
            <Link
              href="/features/new"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add your first feature
            </Link>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-lg px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Reset filters
            </button>
          )}
        </section>
      ) : (
        /* Feature cards */
        <section
          aria-label="Feature list"
          className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3"
        >
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature._id}
              feature={feature}
              deleting={deletingId === feature._id}
              onDelete={handleDelete}
            />
          ))}
        </section>
      )}
    </main>
  );
}
