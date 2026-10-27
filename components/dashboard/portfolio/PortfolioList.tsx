
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PortfolioStats from "@/components/dashboard/portfolio/PortfolioStats";
import PortfolioTable, {
  type PortfolioItem,
} from "@/components/dashboard/portfolio/PortfolioTable";

interface PortfolioApiResponse {
  success: boolean;
  message?: string;
  data?: PortfolioItem[];
}

interface PortfolioUpdateResponse {
  success: boolean;
  message?: string;
  data?: {
    isActive: boolean;
  };
}

export default function PortfolioList() {
  const router = useRouter();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleLoadError = useCallback((message: string) => {
    setError(message);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchPortfolios() {
      try {
        const response = await fetch("/api/portfolio", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result =
          (await response.json()) as PortfolioApiResponse;

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load portfolio items."
          );
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid portfolio data received from the server.");
        }

        if (!cancelled) {
          setPortfolios(result.data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          handleLoadError(
            err instanceof Error
              ? err.message
              : "Failed to load portfolio items."
          );
        }
      }
    }

    void fetchPortfolios();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, handleLoadError]);

  function handleRetry() {
    setError("");
    setLoading(true);
    setReloadKey((current) => current + 1);
  }

  async function handleToggleStatus(item: PortfolioItem) {
    try {
      setUpdatingId(item._id);
      setError("");

      const response = await fetch(`/api/portfolio/${item._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      });

      const result =
        (await response.json()) as PortfolioUpdateResponse;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.message || "Failed to update portfolio status."
        );
      }

      setPortfolios((current) =>
        current.map((portfolio) =>
          portfolio._id === item._id
            ? {
                ...portfolio,
                isActive: result.data!.isActive,
              }
            : portfolio
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update portfolio status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: PortfolioItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item._id);
      setError("");

      const response = await fetch(`/api/portfolio/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete portfolio item."
        );
      }

      setPortfolios((current) =>
        current.filter((portfolio) => portfolio._id !== item._id)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete portfolio item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(item: PortfolioItem) {
    router.push(`/portfolio/${item._id}/edit`);
  }

  return (
    <div className="min-w-0 space-y-6">
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>

          <button
            type="button"
            onClick={handleRetry}
            className="self-start font-medium underline sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <PortfolioStats
          total={portfolios.length}
          active={portfolios.filter((item) => item.isActive).length}
          inactive={portfolios.filter((item) => !item.isActive).length}
        />
      )}

      <PortfolioTable
        portfolios={portfolios}
        loading={loading}
        deletingId={deletingId}
        updatingId={updatingId}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
