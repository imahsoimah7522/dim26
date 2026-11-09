// ===========================================
// DataInsight Mini — Footer Component
// ===========================================

import Link from "next/link";
import { BarChart3 } from "lucide-react";

const footerLinks = {
  produk: [
    { href: "/demo", label: "Demo Gratis" },
    { href: "/upload", label: "Upload Data" },
    { href: "/pricing", label: "Harga" },
  ],
  perusahaan: [
    { href: "#", label: "Tentang Kami" },
    { href: "#", label: "Kontak" },
  ],
  legal: [
    { href: "#", label: "Kebijakan Privasi" },
    { href: "#", label: "Syarat & Ketentuan" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-navy-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-accent-400" />
              <span className="text-lg font-bold">DataInsight Mini</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-navy-300">
              Analisis data bisnis yang mudah dipahami untuk UMKM dan pemilik
              usaha Indonesia.
            </p>
          </div>

          {/* Produk */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
              Produk
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.produk.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Perusahaan */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
              Perusahaan
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.perusahaan.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-navy-400">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-navy-800 pt-6 text-center text-xs text-navy-500">
          &copy; {new Date().getFullYear()} DataInsight Mini. Hak cipta
          dilindungi.
        </div>
      </div>
    </footer>
  );
}
