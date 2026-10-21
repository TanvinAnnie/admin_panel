
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface PhotoAlbum {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  photos: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

type StatusFilter = "all" | "active" | "inactive";

export default function PhotoAlbumsPage() {
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/photo-albums", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load photo albums");
      }

      setAlbums(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  async function fetchAlbums() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/photo-albums", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load photo albums"
        );
      }

      if (!cancelled) {
        setAlbums(result.data);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void fetchAlbums();

  return () => {
    cancelled = true;
  };
}, []);

  const handleDelete = async (album: PhotoAlbum) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${album.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(album._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/photo-albums?id=${encodeURIComponent(album._id)}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete album");
      }

      setAlbums((current) =>
        current.filter((item) => item._id !== album._id)
      );
      setNotice("Photo album deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete album"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAlbums = albums.filter((album) => {
    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      album.title.toLowerCase().includes(searchTerm) ||
      album.slug.toLowerCase().includes(searchTerm) ||
      album.description.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && album.isActive) ||
      (statusFilter === "inactive" && !album.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCount = albums.filter((album) => album.isActive).length;
  const inactiveCount = albums.length - activeCount;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-pink-600">
            Content Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Photo Albums
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage your albums, cover images, and gallery photos.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadAlbums()}
            disabled={loading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            href="/photo-albums/new"
            className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700"
          >
            + Add Photo Album
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Albums" value={albums.length} />
        <StatCard label="Active Albums" value={activeCount} />
        <StatCard label="Inactive Albums" value={inactiveCount} />
      </div>

      {/* Messages */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {notice}
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="album-search" className="sr-only">
            Search albums
          </label>
          <input
            id="album-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by album title, slug, or description..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <label className="sr-only" htmlFor="album-status">
          Filter by status
        </label>
        <select
          id="album-status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as StatusFilter)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-pink-400"
        >
          <option value="all">All statuses</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </div>

      {/* Album list */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">All Photo Albums</h2>
          <span className="text-sm text-gray-500">
            {filteredAlbums.length} result
            {filteredAlbums.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading photo albums...
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-2xl">
              📸
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">
              {albums.length === 0
                ? "No photo albums yet"
                : "No matching albums"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {albums.length === 0
                ? "Create your first album to get started."
                : "Try another search term or status filter."}
            </p>
            {albums.length === 0 && (
              <Link
                href="/photo-albums/new"
                className="mt-5 inline-flex rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
              >
                Create your first album
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Album</th>
                    <th className="px-5 py-4 font-semibold">Photos</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Created</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAlbums.map((album) => (
                    <tr
                      key={album._id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={album.coverImage}
                            alt={album.title}
                            className="h-14 w-16 rounded-lg border border-gray-100 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {album.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              /{album.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {album.photos.length} photos
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge active={album.isActive} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(album.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/photo-albums/${album._id}`}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void handleDelete(album)}
                            disabled={deletingId === album._id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === album._id
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
            <div className="grid gap-4 p-4 md:hidden">
              {filteredAlbums.map((album) => (
                <article
                  key={album._id}
                  className="overflow-hidden rounded-xl border border-gray-200"
                >
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="h-48 w-full bg-gray-100 object-cover"
                  />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {album.title}
                        </h3>
                        <p className="mt-1 break-all text-xs text-gray-500">
                          /{album.slug}
                        </p>
                      </div>
                      <StatusBadge active={album.isActive} />
                    </div>

                    <p className="text-sm text-gray-500">
                      {album.photos.length} photos · Created{" "}
                      {formatDate(album.createdAt)}
                    </p>

                    <div className="flex gap-2">
                      <Link
                        href={`/photo-albums/${album._id}`}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleDelete(album)}
                        disabled={deletingId === album._id}
                        className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === album._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
