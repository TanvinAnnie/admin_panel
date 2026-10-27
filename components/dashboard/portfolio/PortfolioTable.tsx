
"use client";

import Image from "next/image";

export interface PortfolioItem {
  _id: string;
  title: string;
  author: string;
  image: string;
  imagePublicId: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioTableProps {
  portfolios: PortfolioItem[];
  loading: boolean;
  deletingId: string | null;
  updatingId: string | null;
  onEdit: (item: PortfolioItem) => void;
  onDelete: (item: PortfolioItem) => void;
  onToggleStatus: (item: PortfolioItem) => void;
}

export default function PortfolioTable({
  portfolios,
  loading,
  deletingId,
  updatingId,
  onEdit,
  onDelete,
  onToggleStatus,
}: PortfolioTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
          <p className="mt-3 text-sm text-gray-500">
            Loading portfolio items...
          </p>
        </div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-16 text-center">
        <div className="text-4xl text-gray-300" aria-hidden="true">
          ▧
        </div>

        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          No portfolio items yet
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Add your first portfolio item to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-gray-900">
          All Portfolio Items
        </h2>

        <p className="text-sm text-gray-500">
          {portfolios.length}{" "}
          {portfolios.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-4">Project</th>
              <th className="px-5 py-4">Author</th>
              <th className="px-5 py-4">Order</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {portfolios.map((item) => (
              <tr
                key={item._id}
                className="transition hover:bg-gray-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    <span className="max-w-xs truncate font-medium text-gray-900">
                      {item.title}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {item.author}
                </td>

                <td className="px-5 py-4 text-gray-600">
                  {item.order}
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled={updatingId === item._id}
                    onClick={() => onToggleStatus(item)}
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                      item.isActive
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {updatingId === item._id
                      ? "Updating..."
                      : item.isActive
                        ? "Active"
                        : "Inactive"}
                  </button>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === item._id}
                      onClick={() => onDelete(item)}
                      className="font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      {deletingId === item._id
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
    </div>
  );
}
