
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PortfolioForm from "@/components/dashboard/portfolio/PortfolioForm";
import type { PortfolioItem } from "@/components/dashboard/portfolio/PortfolioTable";

interface PortfolioApiResponse {
  success: boolean;
  message?: string;
  data?: PortfolioItem;
}

export default function EditPortfolioPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchPortfolio() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/portfolio/${id}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const responseText = await response.text();

        let result: PortfolioApiResponse;

        try {
          result = JSON.parse(responseText) as PortfolioApiResponse;
        } catch {
          throw new Error(
            `Portfolio API returned an invalid or empty response (HTTP ${response.status}). Check app/api/portfolio/[id]/route.ts.`
          );
        }

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message || `Failed to load portfolio item (HTTP ${response.status}).`
          );
        }

        if (!cancelled) {
          setPortfolio(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load portfolio item."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      void fetchPortfolio();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/portfolio" className="transition hover:text-gray-900">
            Portfolio
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-gray-900">Edit</span>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
          Edit Portfolio
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Update the project details, image, and publishing settings.
        </p>
      </div>

      {loading ? (
        <div
          role="status"
          className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500"
        >
          Loading portfolio details...
        </div>
      ) : error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <p className="break-words text-sm text-red-700">{error}</p>

          <Link
            href="/portfolio"
            className="mt-4 inline-flex text-sm font-medium text-gray-900 underline"
          >
            Back to Portfolio
          </Link>
        </div>
      ) : portfolio ? (
        <PortfolioForm
          key={portfolio._id}
          mode="edit"
          initialData={portfolio}
        />
      ) : null}
    </main>
  );
}
