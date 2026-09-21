import { ServicePage } from "@/components/PageTemplates";
import { serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("resort-transfers")!;

export const metadata = pageMetadata({
  title: "Wayanad Resort Transfers | Airport–Resort Pickup & Drop",
  description:
    "Door-to-door transfers to Wayanad resorts and homestays — airport pickups, estate stays and departure drops. Enquire on WhatsApp today.",
  path: "/resort-transfers/",
  image: "/images/resort.jpg",
});

export default function ResortTransfersPage() {
  const vehicles = ["innova-crysta", "innova", "ertiga-suv", "sedan"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Resort Transfers" }]}
      jsonLdPath="/resort-transfers/"
      eyebrow="Door-to-door resort pickups"
      title="Resort Transfers in Wayanad"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "Airport–resort transfers",
        "Estate & homestay pickups",
        "Arrival + departure planning",
        "Comfort-first vehicle options",
      ]}
      bookingService="Resort Transfer"
      bookingLabel="Book Transfer"
      page="resort_transfers"
      vehicles={vehicles}
      faqs={service.faqs}
    />
  );
}
