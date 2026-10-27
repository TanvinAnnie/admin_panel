
import Link from "next/link";
import PortfolioList from "@/components/dashboard/portfolio/PortfolioList";

export default function PortfolioPage() {
  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Portfolio
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the portfolio projects displayed on your website.
          </p>
        </div>

        <Link
          href="/portfolio/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700 sm:w-auto"
        >
          <span className="mr-2 text-lg" aria-hidden="true">
            +
          </span>
          Add Portfolio
        </Link>
      </div>

      {/* Portfolio Statistics and Table */}
      <PortfolioList />
    </main>
  );
}
