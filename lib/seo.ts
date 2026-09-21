/**
 * SEO helpers: metadata builder, canonical URLs and JSON-LD generators.
 *
 * Only factual information is included in structured data —
 * no ratings, review counts, prices or opening hours are fabricated.
 */

import type { Metadata } from "next";
import { SITE } from "./site";

type PageMeta = {
  title: string;
  description: string;
  /** Path with leading and trailing slash, e.g. "/wayanad-taxi/" */
  path: string;
  image?: string;
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  image = "/images/hero.jpg",
  noIndex = false,
}: PageMeta): Metadata {
  const url = `${SITE.siteUrl}${path}`;
  const imageUrl = `${SITE.siteUrl}${image}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: `${SITE.siteUrl}/`,
    slogan: SITE.statement,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Wayanad, Kerala, India",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${SITE.phoneNumber}`,
      contactType: "reservations",
      areaServed: "IN",
      availableLanguage: ["English", "Malayalam", "Hindi"],
    },
  };
}

export function travelAgencyJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: SITE.name,
    url: `${SITE.siteUrl}/`,
    description: `${SITE.name} — ${SITE.tagline}. ${SITE.statement}`,
    telephone: `+${SITE.phoneNumber}`,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kalpetta",
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    areaServed: [
      "Wayanad",
      "Kalpetta",
      "Vythiri",
      "Meppadi",
      "Sulthan Bathery",
      "Mananthavady",
      "Ambalavayal",
      "Pulpally",
      "Muttil",
    ].map((name) => ({ "@type": "City", name })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: `${SITE.siteUrl}/`,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE.siteUrl}${item.path}`,
    })),
  };
}

export function serviceJsonLd(args: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: args.name,
    description: args.description,
    url: `${SITE.siteUrl}${args.path}`,
    provider: {
      "@type": "TravelAgency",
      name: SITE.name,
      url: `${SITE.siteUrl}/`,
      telephone: `+${SITE.phoneNumber}`,
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Wayanad, Kerala, India",
    },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
