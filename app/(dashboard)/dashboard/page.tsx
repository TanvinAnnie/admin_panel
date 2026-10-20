
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";

const quickLinks = [
  {
    title: "Hero Section",
    description: "Manage homepage banners",
    href: "/hero",
    icon: "▣",
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Services",
    description: "Manage your services",
    href: "/services",
    icon: "✳",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Photo Albums",
    description: "Manage image galleries",
    href: "/photo-albums",
    icon: "▧",
    color: "bg-pink-50 text-pink-600",
  },
  {
    title: "About Us",
    description: "Edit company information",
    href: "/about",
    icon: "ⓘ",
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Features",
    description: "Manage website features",
    href: "/features",
    icon: "☆",
    color: "bg-violet-50 text-violet-600",
  },
  {
    title: "Portfolio",
    description: "Manage portfolio items",
    href: "/portfolio",
    icon: "▣",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    title: "Testimonials",
    description: "Manage customer reviews",
    href: "/testimonials",
    icon: "☷",
    color: "bg-orange-50 text-orange-600",
  },
  {
    title: "News & Updates",
    description: "Publish latest news",
    href: "/news",
    icon: "▤",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Contact Messages",
    description: "View contact inquiries",
    href: "/contact",
    icon: "✉",
    color: "bg-rose-50 text-rose-600",
  },
];

const activities = [
  {
    title: "Welcome to your admin panel",
    description: "Your dashboard is ready to use.",
    time: "Getting started",
  },
  {
    title: "Manage website content",
    description: "Choose a section below to get started.",
    time: "Quick access",
  },
  {
    title: "Keep your content updated",
    description: "Review your website information regularly.",
    time: "Reminder",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8">
      {/* Page heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
            Overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Manage your Maheen Accessories website from one place.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500">Your workspace</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            Maheen Accessories
          </p>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Content Sections"
          value="14"
          description="Available in the sidebar"
          icon="▦"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Content Modules"
          value="12"
          description="Website management areas"
          icon="▤"
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Admin Access"
          value="Active"
          description="Your authenticated session"
          icon="✓"
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="Quick Actions"
          value={String(quickLinks.length)}
          description="Shortcuts to website sections"
          icon="↗"
          color="bg-amber-50 text-amber-600"
        />
      </section>

      {/* Quick access */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quick Access
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Open a section to manage its content.
            </p>
          </div>
          <span className="hidden rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 sm:inline">
            Website management
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow-sm"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${item.color}`}
              >
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-800">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>

              <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">
            Recent Activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Getting started with your website management.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {activities.map((activity, index) => (
            <div
              key={activity.title}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {activity.title}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {activity.description}
                </p>
              </div>

              <span className="text-xs text-slate-400">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
