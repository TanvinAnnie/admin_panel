import Link from "next/link";
import PolicyForm from "@/components/dashboard/policies/PolicyForm";

export default function NewPolicyPage() {
  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <Link
          href="/policies"
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← Back to Policies
        </Link>

        <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create Policy
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add a policy to the Maheen Accessories website.
        </p>
      </header>

      <PolicyForm mode="create" />
    </main>
  );
}