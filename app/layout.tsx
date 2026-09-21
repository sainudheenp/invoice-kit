import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "./globals.css";
import { SITE } from "@/lib/site";
import { organizationJsonLd, travelAgencyJsonLd, websiteJsonLd } from "@/lib/seo";
import { BookingProvider } from "@/components/BookingModal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingWhatsApp, StickyMobileBar } from "@/components/StickyMobileBar";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.siteUrl),
  title: "Wayanad Taxi & Cab Booking | Airport Transfers & Travellers | In Drive Tours",
  description:
    "Book Wayanad taxis, airport transfers, sightseeing cars and group vehicles with In Drive Tours. Enquire through WhatsApp for availability and pricing.",
  alternates: { canonical: `${SITE.siteUrl}/` },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Wayanad Taxi & Cab Booking | Airport Transfers & Travellers | In Drive Tours",
    description:
      "Cabs, airport transfers, sightseeing, Tempo Travellers and buses across Wayanad. Enquire on WhatsApp.",
    url: `${SITE.siteUrl}/`,
    images: [{ url: `${SITE.siteUrl}/images/hero.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wayanad Taxi & Cab Booking | In Drive Tours",
    description:
      "Cabs, airport transfers, sightseeing, Tempo Travellers and buses across Wayanad.",
    images: [`${SITE.siteUrl}/images/hero.jpg`],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e1e15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream-50">
        <JsonLd data={[organizationJsonLd(), travelAgencyJsonLd(), websiteJsonLd()]} />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-forest-950 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        <BookingProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <StickyMobileBar />
          <FloatingWhatsApp />
        </BookingProvider>
        <Analytics />
      </body>
    </html>
  );
}
