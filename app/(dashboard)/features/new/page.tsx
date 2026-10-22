
import Link from "next/link";
import FeatureForm from "@/components/dashboard/features/FeatureForm";

export default function NewFeaturePage() {
  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Add Feature
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a feature for your website.
        </p>
      </div>

      <FeatureForm mode="create" />
    </main>
  );
}