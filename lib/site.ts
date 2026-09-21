/**
 * Central site configuration for In Drive Tours.
 *
 * The business WhatsApp / phone numbers live ONLY here (sourced from env).
 * Every component must import from this file — never hard-code numbers.
 */

const digitsOnly = (value: string | undefined, fallback: string) => {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length >= 10 ? digits : fallback;
};

const FALLBACK_NUMBER = "919999999999";

export const SITE = {
  name: "In Drive Tours",
  tagline: "Wayanad Travel & Transportation",
  statement:
    "Cabs, airport transfers, sightseeing, Tempo Travellers and buses across Wayanad.",
  area: "Wayanad, Kerala, India",

  /** WhatsApp number in international format, digits only (used for wa.me links). */
  whatsappNumber: digitsOnly(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    FALLBACK_NUMBER
  ),
  /** tel: link target, digits only. */
  phoneNumber: digitsOnly(
    process.env.NEXT_PUBLIC_PHONE_NUMBER,
    FALLBACK_NUMBER
  ),
  phoneDisplay:
    process.env.NEXT_PUBLIC_PHONE_DISPLAY || "+91 99999 99999",
  email: process.env.NEXT_PUBLIC_EMAIL || "hello@indrivetours.in",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.indrivetours.in").replace(
    /\/$/,
    ""
  ),
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
} as const;

export const NAV_LINKS = [
  { label: "Taxi", href: "/wayanad-taxi/" },
  { label: "Airport Transfers", href: "/airport-transfers/" },
  { label: "Sightseeing", href: "/wayanad-sightseeing/" },
  { label: "Tempo Traveller", href: "/tempo-traveller/" },
  { label: "Bus", href: "/bus-rental/" },
  { label: "Wayanad", href: "/locations/" },
  { label: "Contact", href: "/contact/" },
] as const;

export const TOPBAR_NOTES = [
  "Local Wayanad service",
  "Airport transfers",
  "Sightseeing & group travel",
] as const;
