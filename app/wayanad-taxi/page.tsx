import { ServicePage } from "@/components/PageTemplates";
import { serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("wayanad-taxi")!;

export const metadata = pageMetadata({
  title: "Wayanad Taxi & Cab Booking | In Drive Tours",
  description:
    "Book Wayanad taxis for local trips and outstation journeys — sedans, SUVs, Innova and Tempo Travellers. Enquire on WhatsApp for availability and pricing.",
  path: "/wayanad-taxi/",
  image: "/images/taxi-sedan.jpg",
});

export default function WayanadTaxiPage() {
  const vehicles = ["sedan", "ertiga-suv", "innova", "tempo-traveller"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Wayanad Taxi" }]}
      jsonLdPath="/wayanad-taxi/"
      eyebrow="Wayanad taxi service"
      title="Wayanad Taxi Booking, Without the Hassle"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "Local trips across all Wayanad towns",
        "Outstation runs to Calicut, Mysore & Bangalore",
        "Vehicle matched to your group size",
        "Availability & price confirmed on WhatsApp",
      ]}
      bookingService="Wayanad Taxi"
      bookingLabel="Book a Ride"
      page="wayanad_taxi"
      event="taxi_service_click"
      vehicles={vehicles}
      faqs={service.faqs}
    />
  );
}
