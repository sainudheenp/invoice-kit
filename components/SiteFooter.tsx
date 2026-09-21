import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { LOCATIONS, SERVICES } from "@/lib/content";
import { WhatsAppGlyph } from "./BookingModal";
import { WhatsAppLink } from "./WhatsAppLink";

const LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy/" },
  { label: "Terms & Conditions", href: "/terms-and-conditions/" },
  { label: "Cancellation Policy", href: "/cancellation-policy/" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-forest-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="text-[19px] font-extrabold tracking-tight text-cream-50">
              IN DRIVE <span className="text-sun-300">TOURS</span>
            </p>
            <p className="mt-1 text-[12px] font-semibold tracking-[0.1em] uppercase text-stone-400">
              {SITE.tagline}
            </p>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-stone-400">
              {SITE.statement} Share your trip details and our team confirms
              availability and price on WhatsApp.
            </p>
            <div className="mt-5 space-y-2.5 text-[14.5px]">
              <a
                href={`tel:${SITE.phoneNumber}`}
                className="flex items-center gap-2.5 font-semibold text-cream-50 transition hover:text-sun-300"
              >
                <Phone className="h-4 w-4 text-sun-300" /> {SITE.phoneDisplay}
              </a>
              <WhatsAppLink
                page="footer"
                className="flex items-center gap-2.5 font-semibold text-cream-50 transition hover:text-sun-300"
              >
                <WhatsAppGlyph className="h-4 w-4 text-sun-300" /> WhatsApp In Drive Tours
              </WhatsAppLink>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-2.5 transition hover:text-cream-50"
              >
                <Mail className="h-4 w-4 text-sun-300" /> {SITE.email}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-sun-300" /> {SITE.area}
              </p>
            </div>
          </div>

          {/* Services */}
          <nav aria-label="Services">
            <p className="text-[13px] font-bold tracking-[0.12em] text-cream-50 uppercase">
              Services
            </p>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              <li>
                <Link href="/wayanad-taxi/" className="transition hover:text-cream-50">Taxi</Link>
              </li>
              <li>
                <Link href="/wayanad-cab/" className="transition hover:text-cream-50">Cab</Link>
              </li>
              {SERVICES.filter((s) => s.slug !== "wayanad-taxi").map((service) => (
                <li key={service.slug}>
                  <Link href={service.href} className="transition hover:text-cream-50">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Locations */}
          <nav aria-label="Locations">
            <p className="text-[13px] font-bold tracking-[0.12em] text-cream-50 uppercase">
              Locations
            </p>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              {LOCATIONS.slice(0, 5).map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/locations/${location.slug}/`}
                    className="transition hover:text-cream-50"
                  >
                    {location.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/locations/" className="font-semibold text-sun-300 transition hover:text-cream-50">
                  All Wayanad locations →
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <p className="text-[13px] font-bold tracking-[0.12em] text-cream-50 uppercase">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-[14.5px]">
              <li>
                <Link href="/contact/" className="transition hover:text-cream-50">Contact</Link>
              </li>
              {LEGAL.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-cream-50">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-stone-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>{SITE.tagline} · {SITE.area}</p>
        </div>
      </div>
      {/* Spacer so the mobile sticky bar never covers footer content */}
      <div className="h-[76px] md:hidden" aria-hidden="true" />
    </footer>
  );
}
