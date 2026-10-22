
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface Service {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
}

interface ServicesResponse {
  success: boolean;
  message?: string;
  count?: number;
  data?: Service[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadServices = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch("/api/services", {
        cache: "no-store",
      });

      const result: ServicesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load services.");
      }

      setServices(result.data ?? []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function initialLoad() {
      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result: ServicesResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load services.");
        }

        setServices(result.data ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to load services."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => controller.abort();
  }, []);

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(service._id);
    setError("");

    try {
      const response = await fetch(
        `/api/services?id=${encodeURIComponent(service._id)}`,
        {
          method: "DELETE",
          credentials: "same-origin",
        }
      );

      const result: ServicesResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete service.");
      }

      setServices((previous) =>
        previous.filter((item) => item._id !== service._id)
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete service."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm) ||
      service.slug.toLowerCase().includes(searchTerm) ||
      service.description.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCount = services.filter((service) => service.isActive).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="w-full min-w-0 max-w-full space-y-6">
      {/* Page header */}
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">
            Website Management
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Services
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage the services displayed on your website.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadServices(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span aria-hidden="true">{refreshing ? "…" : "↻"}</span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            href="/services/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            <span aria-hidden="true">+</span>
            Add Service
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <SummaryCard label="Total Services" value={services.length} />
        <SummaryCard label="Active Services" value={activeCount} />
        <SummaryCard label="Inactive Services" value={inactiveCount} />
      </div>

      {/* Search and filter */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <label
              htmlFor="service-search"
              className="text-sm font-semibold text-slate-700"
            >
              Search services
            </label>

            <input
              id="service-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, slug or description..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            />
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="text-sm font-semibold text-slate-700"
            >
              Filter by status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="all">All services</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          Showing {filteredServices.length} of {services.length} services
        </p>
      </section>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={() => void loadServices(true)}
            className="shrink-0 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Services list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-slate-900">
            All Services
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your service content.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading services...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
              ◇
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {services.length === 0
                ? "No services yet"
                : "No matching services"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {services.length === 0
                ? "Create your first service to start managing website content."
                : "Try a different search term or change the status filter."}
            </p>

            {services.length === 0 && (
              <Link
                href="/services/new"
                className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Create First Service
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Service</th>
                    <th className="px-6 py-4 font-semibold">Slug</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((service) => (
                    <tr
                      key={service._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex min-w-[260px] items-center gap-4">
                          {service.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={service.image}
                              alt={service.title}
                              className="h-16 w-20 shrink-0 rounded-xl border border-slate-200 bg-slate-50 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">
                              {service.title}
                            </p>
                            <p className="mt-1 line-clamp-2 max-w-sm text-xs leading-5 text-slate-500">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-mono text-xs text-slate-600">
                          {service.slug}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge active={service.isActive} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/services/${service._id}`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => void handleDelete(service)}
                            disabled={deletingId === service._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === service._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
              {filteredServices.map((service) => (
                <article
                  key={service._id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  {service.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-44 w-full bg-slate-50 object-cover"
                    />
                  ) : (
                    <div className="flex h-36 items-center justify-center bg-slate-100 text-sm text-slate-400">
                      No image
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {service.title}
                      </h3>
                      <StatusBadge active={service.isActive} />
                    </div>

                    <p className="break-all font-mono text-xs text-slate-500">
                      {service.slug}
                    </p>

                    <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>

                    <div className="flex gap-2 border-t border-slate-100 pt-3">
                      <Link
                        href={`/services/${service._id}`}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleDelete(service)}
                        disabled={deletingId === service._id}
                        className="flex-1 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === service._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
