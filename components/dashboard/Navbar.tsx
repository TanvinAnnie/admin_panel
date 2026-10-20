
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const routes: Record<string, string> = {
      dashboard: "/dashboard",
      hero: "/hero",
      services: "/services",
      albums: "/photo-albums",
      "photo albums": "/photo-albums",
      about: "/about",
      features: "/features",
      policies: "/policies",
      management: "/management",
      portfolio: "/portfolio",
      testimonials: "/testimonials",
      partners: "/partners",
      news: "/news",
      contact: "/contact",
      settings: "/settings",
    };

    const destination = routes[search.trim().toLowerCase()];

    if (destination) router.push(destination);
  }

  return (
    <header className="fixed left-64 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
      <form onSubmit={handleSearch} className="w-full max-w-lg">
        <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500">
          <span className="text-lg text-slate-400">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a section, e.g. Services..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search dashboard sections"
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </div>
      </form>

      <div className="ml-4 flex shrink-0 items-center gap-4 sm:gap-6">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">
            Maheen Admin
          </p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ring-2 ring-white">
          M
        </div>
      </div>
    </header>
  );
}
