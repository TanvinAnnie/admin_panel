
"use client";

import Link from "next/link";
import TeamMemberForm from "@/components/dashboard/team-members/TeamMemberForm";

export default function NewTeamMemberPage() {
  return (
    <main className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <Link
          href="/team-members"
          className="text-sm font-semibold text-violet-600 hover:text-violet-700"
        >
          ← Back to Team Members
        </Link>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Add Team Member
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Add a team profile, upload a photo and provide social media links.
        </p>
      </header>

      <TeamMemberForm mode="create" />
    </main>
  );
}
