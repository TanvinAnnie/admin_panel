
import Link from "next/link";
import PortfolioForm from "@/components/dashboard/portfolio/PortfolioForm";

export default function NewPortfolioPage() {
  return (
    <main className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/portfolio"
              className="transition hover:text-gray-900"
            >
              Portfolio
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-gray-900">Add New</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
            Add New Portfolio
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Add a new project to your portfolio with its title,
            author, image, and display settings.
          </p>
        </div>

        <Link
          href="/portfolio"
          className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
        >
          Back to Portfolio
        </Link>
      </div>

      <PortfolioForm mode="create" />
    </main>
  );
}
