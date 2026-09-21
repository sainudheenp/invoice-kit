import { ServicePage } from "@/components/PageTemplates";
import { serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("tempo-traveller")!;

export const metadata = pageMetadata({
  title: "Wayanad Tempo Traveller Booking | In Drive Tours",
  description:
    "Tempo Traveller rental in Wayanad for families, weddings and tour groups — 9 to 17 seaters plus premium Urbania. Share group details on WhatsApp.",
  path: "/tempo-traveller/",
  image: "/images/tempo-traveller.jpg",
});

export default function TempoTravellerPage() {
  const vehicles = ["tempo-traveller", "urbania", "mini-bus", "innova"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Tempo Traveller" }]}
      jsonLdPath="/tempo-traveller/"
      eyebrow="Group transportation"
      title="Tempo Traveller Rental in Wayanad"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "9 to 17 seater layouts",
        "Family functions & weddings",
        "Tour parties & pilgrim groups",
        "Wayanad local + outstation runs",
      ]}
      bookingService="Tempo Traveller"
      bookingLabel="Request Booking"
      page="tempo_traveller"
      event="tempo_traveller_click"
      vehicles={vehicles}
      faqs={service.faqs}
    />
  );
}
