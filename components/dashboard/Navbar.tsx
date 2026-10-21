
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
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

    if (destination) {
      router.push(destination);
      setSearch("");
    }
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutError("Logout failed. Please try again.");
      setLoggingOut(false);
    }
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

      <div className="ml-4 flex shrink-0 items-center gap-3 sm:gap-5">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-800">
            Maheen Admin
          </p>
          <p className="text-xs text-slate-500">Administrator</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ring-2 ring-white">
          M
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          aria-label="Log out of admin dashboard"
        >
          {loggingOut ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
              <span className="hidden sm:inline">Logging out...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 8.25V5.625A1.875 1.875 0 0 0 13.875 3.75h-7.5A1.875 1.875 0 0 0 4.5 5.625v12.75a1.875 1.875 0 0 0 1.875 1.875h7.5a1.875 1.875 0 0 0 1.875-1.875V15.75M9.75 12h10.5m0 0-3.75-3.75M20.25 12l-3.75 3.75"
                />
              </svg>
              <span>Logout</span>
            </>
          )}
        </button>
      </div>

      {logoutError && (
        <p
          role="alert"
          className="absolute right-5 top-20 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-lg sm:right-8"
        >
          {logoutError}
        </p>
      )}
    </header>
  );
}
