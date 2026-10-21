
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Hero {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  createdAt?: string;
}

interface HeroApiResponse {
  success: boolean;
  message?: string;
  data?: Hero[];
}

interface ApiMessage {
  success: boolean;
  message?: string;
}

export default function HeroPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch hero banners when the page loads.
  useEffect(() => {
    const controller = new AbortController();

    async function loadHeroes() {
      try {
        const response = await fetch("/api/hero", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result: HeroApiResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load hero banners"
          );
        }

        setHeroes(result.data ?? []);
        setError("");
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadHeroes();

    return () => controller.abort();
  }, []);

  // Refresh hero banners.
  async function handleRefresh() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/hero", {
        cache: "no-store",
      });

      const result: HeroApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load hero banners"
        );
      }

      setHeroes(result.data ?? []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh hero banners"
      );
    } finally {
      setLoading(false);
    }
  }

  // Delete a hero banner.
  async function handleDelete(hero: Hero) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${hero.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(hero._id);
      setError("");

      const response = await fetch(
        `/api/hero?id=${encodeURIComponent(hero._id)}`,
        { method: "DELETE" }
      );

      const result: ApiMessage = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete hero"
        );
      }

      setHeroes((current) =>
        current.filter((item) => item._id !== hero._id)
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete hero"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Website Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Hero Sections
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your website banners, text and call-to-action buttons.
          </p>
        </div>

        <Link
          href="/hero/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
        >
          <span className="text-lg leading-none">+</span>
          Add Hero
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Banners</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {loading ? "—" : heroes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Banners</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {loading
              ? "—"
              : heroes.filter((hero) => hero.isActive).length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inactive Banners</p>
          <p className="mt-2 text-3xl font-bold text-slate-500">
            {loading
              ? "—"
              : heroes.filter((hero) => !hero.isActive).length}
          </p>
        </div>
      </div>

      {/* Hero list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-semibold text-slate-900">
              All Hero Banners
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review and manage your banner content.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading hero banners...
          </div>
        ) : heroes.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
              🖼️
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No hero banners yet
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Create your first banner to manage the main hero section
              of your website.
            </p>

            <Link
              href="/hero/new"
              className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Create First Hero
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Banner</th>
                    <th className="px-6 py-4 font-semibold">Title</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {heroes.map((hero) => (
                    <tr
                      key={hero._id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="relative h-16 w-28 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <Image
                            src={hero.image}
                            alt={hero.title}
                            fill
                            unoptimized
                            sizes="112px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-4">
                        <p className="truncate font-semibold text-slate-900">
                          {hero.title}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {hero.subtitle || "No subtitle"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                            hero.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              hero.isActive
                                ? "bg-emerald-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {hero.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/hero/${hero._id}`}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => void handleDelete(hero)}
                            disabled={deletingId === hero._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === hero._id
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
            <div className="space-y-4 p-4 md:hidden">
              {heroes.map((hero) => (
                <article
                  key={hero._id}
                  className="overflow-hidden rounded-xl border border-slate-200"
                >
                  <div className="relative h-44 w-full bg-slate-100">
                    <Image
                      src={hero.image}
                      alt={hero.title}
                      fill
                      unoptimized
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {hero.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {hero.subtitle || "No subtitle"}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          hero.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {hero.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/hero/${hero._id}`}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => void handleDelete(hero)}
                        disabled={deletingId === hero._id}
                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === hero._id
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
