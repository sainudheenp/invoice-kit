import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Milestone,
  Plane,
} from "lucide-react";
import type { Faq as FaqItem, LocationInfo, RouteInfo, Vehicle } from "@/lib/content";
import { LOCATIONS, ROUTES, SERVICES, locationBySlug, routeBySlug, vehicleBySlug } from "@/lib/content";
import { BookingButton, WhatsAppGlyph } from "./BookingModal";
import { WhatsAppLink } from "./WhatsAppLink";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { SectionHeading } from "./SectionHeading";
import { LocationCard, VehicleCard } from "./Cards";
import { Faq } from "./Faq";
import { FinalCta } from "./FinalCta";
import { JsonLd } from "./JsonLd";
import { Reveal } from "./Reveal";
import { breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo";

/* ------------------------------------------------------------------ */
/* PageHero                                                            */
/* ------------------------------------------------------------------ */

export function PageHero({
  crumbs,
  eyebrow,
  title,
  lede,
  image,
  alt,
  bookingContext,
  bookingLabel = "Book a Ride",
  event,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  lede: string;
  image: string;
  alt: string;
  bookingContext: Record<string, string | undefined>;
  bookingLabel?: string;
  event?: string;
}) {
  return (
    <section className="border-b border-stone-200/70 bg-cream-100">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-10 sm:pb-12">
        <Breadcrumbs items={crumbs} />
        <div className="mt-6 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <p className="text-[12.5px] font-bold tracking-[0.16em] text-forest-700 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-balance text-stone-900 sm:text-[44px]">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-stone-600 sm:text-[17.5px]">
              {lede}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <BookingButton
                context={bookingContext}
                event={event}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-[15.5px] font-bold text-white shadow-lg shadow-forest-900/20 transition hover:bg-forest-800"
              >
                {bookingLabel} <ArrowRight className="h-4 w-4" />
              </BookingButton>
              <WhatsAppLink
                page={bookingContext.page}
                topic={bookingContext.service}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-forest-900 px-7 py-3 text-[15.5px] font-bold text-forest-900 transition hover:bg-forest-900 hover:text-white"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                WhatsApp Us
              </WhatsAppLink>
            </div>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={image}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* RelatedLinks                                                        */
/* ------------------------------------------------------------------ */

export function RelatedLinks({
  groups,
}: {
  groups: { title: string; links: { label: string; href: string }[] }[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6" aria-label="Related pages">
      <Reveal>
        <div className="grid gap-8 rounded-3xl border border-stone-200/80 bg-white p-6 sm:grid-cols-3 sm:p-8">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-[13px] font-bold tracking-[0.12em] text-forest-800 uppercase">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[15px] font-semibold text-stone-700 underline decoration-stone-300 decoration-1 underline-offset-4 transition hover:text-forest-800 hover:decoration-forest-700"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* ServicePage                                                         */
/* ------------------------------------------------------------------ */

export function ServicePage({
  crumbs,
  jsonLdPath,
  eyebrow,
  title,
  lede,
  image,
  alt,
  paragraphs,
  points,
  bookingService,
  bookingLabel,
  page,
  event,
  vehicles,
  faqs,
  children,
}: {
  crumbs: Crumb[];
  jsonLdPath: string;
  eyebrow: string;
  title: string;
  lede: string;
  image: string;
  alt: string;
  paragraphs: string[];
  points: string[];
  bookingService: string;
  bookingLabel?: string;
  page: string;
  event?: string;
  vehicles: Vehicle[];
  faqs: FaqItem[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs.filter((c) => c.path).map((c) => ({ name: c.name, path: c.path as string }))),
          serviceJsonLd({ name: title, description: lede, path: jsonLdPath }),
          faqJsonLd(faqs),
        ]}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        image={image}
        alt={alt}
        bookingContext={{ service: bookingService, page }}
        bookingLabel={bookingLabel}
        event={event}
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <Reveal>
            <div className="space-y-4 text-[16px] leading-relaxed text-stone-700">
              {paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <aside className="h-fit rounded-3xl border border-forest-800/15 bg-forest-50 p-6">
              <p className="text-[13px] font-bold tracking-[0.12em] text-forest-800 uppercase">
                What&apos;s included in your enquiry
              </p>
              <ul className="mt-4 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[15px] font-medium text-stone-800">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" />
                    {point}
                  </li>
                ))}
              </ul>
              <BookingButton
                context={{ service: bookingService, page }}
                event={event}
                className="mt-6 w-full rounded-full bg-forest-900 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-forest-800"
              >
                Get a Quote
              </BookingButton>
            </aside>
          </Reveal>
        </div>
      </section>

      {children}

      {vehicles.length > 0 && (
        <section className="bg-white py-14" aria-label="Recommended vehicles">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                eyebrow="Vehicle options"
                title="Vehicles for This Trip"
                lede="Availability and pricing are confirmed with you on WhatsApp before the trip."
              />
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vehicles.map((vehicle, i) => (
                <Reveal key={vehicle.slug} delay={(i % 4) * 60}>
                  <VehicleCard vehicle={vehicle} page={page} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6" aria-label="FAQs">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Good to know"
            title="Frequently Asked Questions"
          />
        </Reveal>
        <Reveal className="mt-8">
          <Faq items={faqs} />
        </Reveal>
      </section>

      <RelatedLinks
        groups={[
          {
            title: "Services",
            links: SERVICES.filter((s) => s.name !== bookingService)
              .slice(0, 5)
              .map((s) => ({ label: s.name, href: s.href })),
          },
          {
            title: "Popular locations",
            links: LOCATIONS.slice(0, 5).map((l) => ({
              label: `${l.name} Taxi`,
              href: `/locations/${l.slug}/`,
            })),
          },
          {
            title: "Popular routes",
            links: ROUTES.slice(0, 5).map((r) => ({
              label: `${r.from} to ${r.to}`,
              href: `/routes/${r.slug}/`,
            })),
          },
        ]}
      />

      <FinalCta page={page} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* LocationPage                                                        */
/* ------------------------------------------------------------------ */

export function LocationPage({ slug }: { slug: string }) {
  const location = locationBySlug(slug);
  if (!location) return null;
  const page = `location_${slug}`;
  const path = `/locations/${slug}/` as const;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Wayanad Locations", path: "/locations/" },
    { name: location.name },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Wayanad Locations", path: "/locations/" },
            { name: location.name, path },
          ]),
          serviceJsonLd({
            name: `${location.name} Taxi & Cab Service`,
            description: location.metaDescription,
            path,
          }),
          faqJsonLd(location.faqs),
        ]}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow={`${location.name}, Wayanad`}
        title={`${location.name} Taxi & Cab Service`}
        lede={location.intro[0]}
        image={location.heroImage}
        alt={location.heroAlt}
        bookingContext={{ service: "Taxi / Cab", pickup: location.name, page }}
        event="taxi_service_click"
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div className="space-y-8">
            <Reveal>
              <div className="space-y-4 text-[16px] leading-relaxed text-stone-700">
                {location.intro.slice(1).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <p>{location.transportNote}</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6">
                  <p className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-forest-800 uppercase">
                    <Plane className="h-4 w-4" /> Airport connections
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
                    {location.airportNote}
                  </p>
                </div>
                <div className="rounded-3xl border border-stone-200/80 bg-white p-6">
                  <p className="flex items-center gap-2 text-[13px] font-bold tracking-[0.1em] text-forest-800 uppercase">
                    <MapPin className="h-4 w-4" /> Sightseeing from here
                  </p>
                  <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
                    {location.sightseeingNote}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="text-[22px] font-extrabold tracking-tight text-stone-900">
                  Nearby places people visit from {location.name}
                </h2>
                <ul className="mt-4 space-y-3">
                  {location.spots.map((spot) => (
                    <li
                      key={spot.name}
                      className="flex items-start gap-3 rounded-2xl border border-stone-200/70 bg-white px-4 py-3.5"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" />
                      <span className="text-[15px] text-stone-700">
                        <span className="font-bold text-stone-900">{spot.name}</span> — {spot.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <aside className="h-fit space-y-4 lg:sticky lg:top-32">
              <div className="rounded-3xl border border-forest-800/15 bg-forest-50 p-6">
                <p className="text-[13px] font-bold tracking-[0.12em] text-forest-800 uppercase">
                  Areas served around {location.name}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {location.areasServed.map((area) => (
                    <li
                      key={area}
                      className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-stone-700 shadow-sm"
                    >
                      {area}
                    </li>
                  ))}
                </ul>
                <BookingButton
                  context={{ service: "Taxi / Cab", pickup: location.name, page }}
                  event="location_page_view"
                  className="mt-5 w-full rounded-full bg-forest-900 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-forest-800"
                >
                  Book a {location.name} Taxi
                </BookingButton>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-14" aria-label="Nearby locations">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Keep exploring"
              title={`More Wayanad Towns Near ${location.name}`}
            />
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {location.relatedLocations.map((relatedSlug, i) => {
              const related = locationBySlug(relatedSlug);
              if (!related) return null;
              return (
                <Reveal key={relatedSlug} delay={(i % 4) * 60}>
                  <LocationCard location={related} />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6" aria-label="FAQs">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Good to know"
            title={`${location.name} Taxi FAQs`}
          />
        </Reveal>
        <Reveal className="mt-8">
          <Faq items={location.faqs} />
        </Reveal>
      </section>

      <RelatedLinks
        groups={[
          {
            title: "Services",
            links: SERVICES.slice(0, 5).map((s) => ({ label: s.name, href: s.href })),
          },
          {
            title: "Other locations",
            links: LOCATIONS.filter((l) => l.slug !== slug)
              .slice(0, 5)
              .map((l) => ({ label: `${l.name} Taxi`, href: `/locations/${l.slug}/` })),
          },
          {
            title: "Related routes",
            links: location.relatedRoutes
              .map((routeSlug) => routeBySlug(routeSlug))
              .filter((r): r is RouteInfo => Boolean(r))
              .map((r) => ({ label: `${r.from} to ${r.to}`, href: `/routes/${r.slug}/` })),
          },
        ]}
      />

      <FinalCta page={page} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RoutePage                                                           */
/* ------------------------------------------------------------------ */

export function RoutePage({ slug }: { slug: string }) {
  const route = routeBySlug(slug);
  if (!route) return null;
  const page = `route_${slug}`;
  const path = `/routes/${slug}/` as const;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Routes & Transfers", path: "/routes/" },
    { name: `${route.from} to ${route.to}` },
  ];
  const vehicles = route.vehicles
    .map((vehicleSlug) => vehicleBySlug(vehicleSlug))
    .filter((v): v is Vehicle => Boolean(v));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Routes & Transfers", path: "/routes/" },
            { name: `${route.from} to ${route.to}`, path },
          ]),
          serviceJsonLd({
            name: `${route.from} to ${route.to} Taxi`,
            description: route.metaDescription,
            path,
          }),
          faqJsonLd(route.faqs),
        ]}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Route guide & transfer"
        title={`${route.from} to ${route.to} Taxi`}
        lede={route.overview[0]}
        image={route.heroImage}
        alt={route.heroAlt}
        bookingContext={{
          service: route.from.includes("Airport") || route.to.includes("Airport") ? "Airport Transfer" : "Outstation Trip",
          pickup: route.from,
          destination: route.to,
          page,
        }}
        bookingLabel="Check Availability"
        event="airport_transfer_click"
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <Reveal>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-5 py-4">
              <Milestone className="h-5 w-5 shrink-0 text-forest-700" />
              <div>
                <dt className="text-[12px] font-bold tracking-[0.1em] text-stone-500 uppercase">Distance</dt>
                <dd className="text-[15px] font-bold text-stone-900">{route.distance}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-5 py-4">
              <Clock3 className="h-5 w-5 shrink-0 text-forest-700" />
              <div>
                <dt className="text-[12px] font-bold tracking-[0.1em] text-stone-500 uppercase">Duration</dt>
                <dd className="text-[15px] font-bold text-stone-900">{route.duration}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-forest-800/20 bg-forest-50 px-5 py-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-forest-700" />
              <div>
                <dt className="text-[12px] font-bold tracking-[0.1em] text-forest-800 uppercase">Booking</dt>
                <dd className="text-[15px] font-bold text-stone-900">Confirmed on WhatsApp</dd>
              </div>
            </div>
          </dl>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div className="space-y-8">
            <Reveal>
              <div className="space-y-4 text-[16px] leading-relaxed text-stone-700">
                {route.overview.slice(1).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
            <Reveal>
              <div>
                <h2 className="text-[22px] font-extrabold tracking-tight text-stone-900">
                  About this journey
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {route.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex items-start gap-2.5 rounded-2xl border border-stone-200/70 bg-white px-4 py-3.5 text-[15px] font-medium text-stone-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-forest-700" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal delay={80}>
            <aside className="h-fit rounded-3xl border border-forest-800/15 bg-forest-50 p-6 lg:sticky lg:top-32">
              <p className="text-[13px] font-bold tracking-[0.12em] text-forest-800 uppercase">
                Your transfer
              </p>
              <p className="mt-2 text-[17px] font-extrabold text-stone-900">
                {route.from} → {route.to}
              </p>
              <p className="mt-1 text-[14px] text-stone-600">{route.duration}</p>
              <BookingButton
                context={{
                  service: route.from.includes("Airport") || route.to.includes("Airport") ? "Airport Transfer" : "Outstation Trip",
                  pickup: route.from,
                  destination: route.to,
                  page,
                }}
                event="airport_transfer_click"
                className="mt-5 w-full rounded-full bg-forest-900 px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-forest-800"
              >
                Check Availability
              </BookingButton>
              <p className="mt-3 text-center text-[13px] text-stone-500">
                Transfers run in both directions — mention your direction in the enquiry.
              </p>
            </aside>
          </Reveal>
        </div>
      </section>

      {vehicles.length > 0 && (
        <section className="bg-white py-14" aria-label="Recommended vehicles">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal>
              <SectionHeading
                eyebrow="Vehicle options"
                title="Vehicles for This Route"
              />
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vehicles.slice(0, 4).map((vehicle, i) => (
                <Reveal key={vehicle.slug} delay={(i % 4) * 60}>
                  <VehicleCard vehicle={vehicle} page={page} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6" aria-label="FAQs">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Good to know"
            title={`${route.from} to ${route.to} FAQs`}
          />
        </Reveal>
        <Reveal className="mt-8">
          <Faq items={route.faqs} />
        </Reveal>
      </section>

      <RelatedLinks
        groups={[
          {
            title: "Destinations",
            links: route.relatedLocations
              .map((locationSlug) => locationBySlug(locationSlug))
              .filter((l): l is LocationInfo => Boolean(l))
              .map((l) => ({ label: `${l.name} Taxi`, href: `/locations/${l.slug}/` })),
          },
          {
            title: "Other routes",
            links: route.relatedRoutes
              .map((routeSlug) => routeBySlug(routeSlug))
              .filter((r): r is RouteInfo => Boolean(r))
              .map((r) => ({ label: `${r.from} to ${r.to}`, href: `/routes/${r.slug}/` })),
          },
          {
            title: "Services",
            links: SERVICES.slice(0, 4).map((s) => ({ label: s.name, href: s.href })),
          },
        ]}
      />

      <FinalCta page={page} />
    </>
  );
}

/** Re-exported for index pages. */
export { LOCATIONS, ROUTES };
