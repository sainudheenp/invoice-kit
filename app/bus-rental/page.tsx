import { ServicePage } from "@/components/PageTemplates";
import { serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("bus-rental")!;

export const metadata = pageMetadata({
  title: "Wayanad Bus Rental | Mini Bus & Bus for Groups",
  description:
    "Mini bus and bus rental in Wayanad for weddings, school trips, pilgrim groups and corporate outings. Share your programme on WhatsApp.",
  path: "/bus-rental/",
  image: "/images/bus.jpg",
});

export default function BusRentalPage() {
  const vehicles = ["mini-bus", "bus", "tempo-traveller", "urbania"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Bus Rental" }]}
      jsonLdPath="/bus-rental/"
      eyebrow="Large group transportation"
      title="Bus Rental in Wayanad"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "Mini buses & full-size buses",
        "Weddings, schools & pilgrim groups",
        "Corporate offsites & events",
        "Multi-day tour programmes",
      ]}
      bookingService="Bus Rental"
      bookingLabel="Get a Quote"
      page="bus_rental"
      event="bus_rental_click"
      vehicles={vehicles}
      faqs={service.faqs}
    />
  );
}
