
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
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
    <header className="fixed inset-x-0 top-0 z-30 flex h-20 min-w-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-3 backdrop-blur sm:gap-4 sm:px-6 lg:left-64 lg:px-8">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
        aria-label="Open navigation menu"
        aria-controls="admin-sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="min-w-0 flex-1"
      >
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-3 transition focus-within:ring-2 focus-within:ring-blue-500 sm:gap-3 sm:px-4">
          <span className="shrink-0 text-lg text-slate-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sections..."
            className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            aria-label="Search dashboard sections"
          />

          <button type="submit" className="sr-only">
            Search
          </button>
        </div>
      </form>

      {/* Admin information */}
      <div className="hidden shrink-0 text-right md:block">
        <p className="text-sm font-semibold text-slate-800">
          Maheen Admin
        </p>
        <p className="text-xs text-slate-500">
          Administrator
        </p>
      </div>

      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 ring-2 ring-white sm:flex">
        M
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
        aria-label="Log out of admin dashboard"
      >
        {loggingOut ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
            <span className="hidden sm:inline">
              Logging out...
            </span>
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

      {logoutError && (
        <p
          role="alert"
          className="absolute right-3 top-20 max-w-[calc(100vw-1.5rem)] rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-600 shadow-lg sm:right-8"
        >
          {logoutError}
        </p>
      )}
    </header>
  );
}
