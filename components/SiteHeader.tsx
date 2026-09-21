"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { NAV_LINKS, SITE, TOPBAR_NOTES } from "@/lib/site";
import { BookingButton, WhatsAppGlyph } from "./BookingModal";
import { WhatsAppLink } from "./WhatsAppLink";
import { cn } from "@/lib/utils";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="In Drive Tours — home">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-900 text-cream-50 shadow-sm">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M3 17.5 9.5 7.5l3.5 5 2.5-3 6 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 20.5h18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3.5 3"
          />
        </svg>
      </span>
      <span className="leading-none">
        <span className="block text-[17px] font-extrabold tracking-tight text-stone-900">
          IN DRIVE <span className="text-forest-800">TOURS</span>
        </span>
        {!compact && (
          <span className="mt-1 block text-[10.5px] font-semibold tracking-[0.08em] text-stone-500 uppercase">
            Wayanad Travel & Transportation
          </span>
        )}
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-[60]">
      {/* Utility bar */}
      <div className="bg-forest-950 text-cream-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-[12px] font-medium sm:px-6">
          <p className="truncate">
            <span className="hidden sm:inline">{TOPBAR_NOTES.join("  ·  ")}</span>
            <span className="sm:hidden">Wayanad Taxi · Airport Transfers · Sightseeing</span>
          </p>
          <a
            href={`tel:${SITE.phoneNumber}`}
            className="flex shrink-0 items-center gap-1.5 font-semibold text-cream-50 transition hover:text-sun-300"
          >
            <Phone className="h-3.5 w-3.5" />
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={cn(
          "border-b bg-cream-50/95 backdrop-blur transition-shadow",
          scrolled ? "border-stone-200 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.25)]" : "border-transparent"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 text-[14.5px] font-semibold text-stone-700 transition hover:bg-forest-50 hover:text-forest-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <WhatsAppLink
              page="header"
              ariaLabel="Chat with In Drive Tours on WhatsApp"
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-wa-700 transition hover:border-wa-600 hover:bg-wa-600 hover:text-white sm:flex"
            >
              <WhatsAppGlyph className="h-5 w-5" />
            </WhatsAppLink>
            <BookingButton
              context={{ page: "header" }}
              ariaLabel="Book now — open booking form"
              className="hidden rounded-full bg-forest-900 px-6 py-2.5 text-[15px] font-bold text-white shadow-md shadow-forest-900/20 transition hover:bg-forest-800 active:scale-[0.98] sm:block"
            >
              Book Now
            </BookingButton>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 text-stone-800 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[104px] z-[55] bg-cream-50 lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-7xl space-y-1 overflow-y-auto px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3.5 text-[17px] font-bold text-stone-900 transition hover:bg-forest-50"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 px-1 pt-4 pb-8">
              <WhatsAppLink
                page="mobile_menu"
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-wa-600 px-4 py-3.5 text-[15px] font-bold text-wa-700"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                WhatsApp
              </WhatsAppLink>
              <BookingButton
                context={{ page: "mobile_menu" }}
                className="flex-1 rounded-full bg-forest-900 px-4 py-3.5 text-[15px] font-bold text-white"
              >
                Book Now
              </BookingButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
