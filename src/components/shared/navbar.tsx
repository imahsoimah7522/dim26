// ===========================================
// DataInsight Mini — Navbar Component
// ===========================================

"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/pricing", label: "Harga" },
  { href: "/upload", label: "Upload Data" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-navy-800 transition-colors hover:text-navy-600"
        >
          <BarChart3 className="h-6 w-6 text-accent-600" />
          <span className="text-lg">DataInsight Mini</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/demo"
            className="ml-3 inline-flex h-9 items-center rounded-md bg-navy-800 px-4 text-sm font-medium text-white transition-colors hover:bg-navy-700"
          >
            Coba Gratis
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border bg-white px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/demo"
              className="mt-3 inline-flex h-11 items-center justify-center rounded-md bg-navy-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
              onClick={() => setMobileOpen(false)}
            >
              Coba Gratis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
