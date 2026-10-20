
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "OVERVIEW",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "▦" }],
  },
  {
    title: "WEBSITE CONTENT",
    items: [
      { label: "Hero Section", href: "/hero", icon: "▣" },
      { label: "Services", href: "/services", icon: "✳" },
      { label: "Photo Albums", href: "/photo-albums", icon: "▧" },
      { label: "About Us", href: "/about", icon: "ⓘ" },
      { label: "Features", href: "/features", icon: "☆" },
      { label: "Policies", href: "/policies", icon: "▤" },
      { label: "Management", href: "/management", icon: "♙" },
      { label: "Portfolio", href: "/portfolio", icon: "▣" },
      { label: "Testimonials", href: "/testimonials", icon: "☷" },
      { label: "Partners", href: "/partners", icon: "♧" },
      { label: "News & Updates", href: "/news", icon: "▤" },
      { label: "Contact Messages", href: "/contact", icon: "✉" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: "⚙" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-[#111c32] text-white">
      <Link
        href="/dashboard"
        className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-2xl font-bold text-[#111c32]">
          M
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-wide">
            MAHEEN
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-slate-400">
            ACCESSORIES
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="mb-3 px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-500">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center text-lg">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-bold text-slate-900">
            M
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Maheen Accessories
            </p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
