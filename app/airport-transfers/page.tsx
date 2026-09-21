import { RouteCard } from "@/components/Cards";
import { SectionHeading } from "@/components/SectionHeading";
import { ServicePage } from "@/components/PageTemplates";
import { Reveal } from "@/components/Reveal";
import { ROUTES, serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("airport-transfers")!;

export const metadata = pageMetadata({
  title: "Wayanad Airport Taxi & Transfers | Calicut & Kannur Airports",
  description:
    "Private airport transfers between Wayanad and Calicut (CCJ) / Kannur (CNN) airports — flight-timed pickups for families and groups. Enquire on WhatsApp.",
  path: "/airport-transfers/",
  image: "/images/airport.jpg",
});

const AIRPORT_ROUTE_SLUGS = [
  "calicut-airport-to-wayanad",
  "calicut-airport-to-kalpetta",
  "calicut-airport-to-vythiri",
  "calicut-airport-to-meppadi",
  "kannur-airport-to-wayanad",
];

export default function AirportTransfersPage() {
  const vehicles = ["sedan", "ertiga-suv", "innova", "innova-crysta"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);
  const airportRoutes = AIRPORT_ROUTE_SLUGS.map(
    (slug) => ROUTES.find((r) => r.slug === slug)!
  ).filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Airport Transfers" }]}
      jsonLdPath="/airport-transfers/"
      eyebrow="Calicut & Kannur airports"
      title="Wayanad Airport Transfers"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "Calicut Airport (CCJ) pickups & drops",
        "Kannur Airport (CNN) pickups & drops",
        "Flight-timed planning with ghat buffer time",
        "Luggage-friendly vehicle options",
      ]}
      bookingService="Airport Transfer"
      bookingLabel="Check Availability"
      page="airport_transfers"
      event="airport_transfer_click"
      vehicles={vehicles}
      faqs={service.faqs}
    >
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-label="Airport routes">
        <Reveal>
          <SectionHeading
            eyebrow="Route guides"
            title="Popular Airport Routes"
            lede="Distances, drive times and what to expect on each airport run. Every transfer runs in both directions."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {airportRoutes.map((route, i) => (
            <Reveal key={route.slug} delay={(i % 3) * 60}>
              <RouteCard route={route} page="airport_transfers" />
            </Reveal>
          ))}
        </div>
      </section>
    </ServicePage>
  );
}
