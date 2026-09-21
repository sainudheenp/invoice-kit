import { ServicePage } from "@/components/PageTemplates";
import { vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Wayanad Cab Booking | Private Cabs for Families & Tourists",
  description:
    "Private cab hire in Wayanad for families, couples and tourists — full-day cabs, resort pickups and intercity drops. Share your trip on WhatsApp today.",
  path: "/wayanad-cab/",
  image: "/images/suv-ertiga.jpg",
});

export default function WayanadCabPage() {
  const vehicles = ["sedan", "ertiga-suv", "innova", "innova-crysta"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Wayanad Cab" }]}
      jsonLdPath="/wayanad-cab/"
      eyebrow="Private cab hire"
      title="Private Cabs Across Wayanad"
      lede="A private cab with a driver for the day — resort pickups, sightseeing loops, family outings and intercity drops, planned around your group."
      image="/images/suv-ertiga.jpg"
      alt="Private cab hire in Wayanad for families and tourists"
      paragraphs={[
        "Hiring a private cab is how most visitors experience Wayanad — one vehicle and driver for your days here, instead of negotiating every leg separately. It suits families with kids and elders especially well: door-to-door pickups, luggage stays in the car, and plans can flex with weather and energy levels.",
        "Full-day cab hire works for sightseeing loops from your stay, while point-to-point cabs cover airport runs, railway-station pickups and intercity drops. Share your dates, pickup point and group size, and a suitable cab can be arranged — confirmed with you on WhatsApp before the trip.",
      ]}
      points={[
        "Full-day private cab hire",
        "Family-friendly vehicle choice",
        "Resort & homestay pickups",
        "Intercity drops to Mysore, Calicut & Bangalore",
      ]}
      bookingService="Cab Booking"
      bookingLabel="Book a Cab"
      page="wayanad_cab"
      event="taxi_service_click"
      vehicles={vehicles}
      faqs={[
        {
          question: "How is a private cab different from a regular taxi trip?",
          answer:
            "A private cab stays with you — full-day hire for sightseeing, or a dedicated vehicle for your route — instead of separate point-to-point rides. Share your plan and the vehicle can be arranged accordingly.",
        },
        {
          question: "Can I hire a cab for multiple days in Wayanad?",
          answer:
            "Yes. Multi-day cab hire is common for Wayanad holidays — share your full itinerary and a vehicle can be arranged for the complete trip, subject to availability.",
        },
        {
          question: "Which cab suits a family with kids and luggage?",
          answer:
            "Families usually prefer an Ertiga, SUV or Innova for the extra seats and luggage space. Couples with light bags are comfortable in a sedan.",
        },
      ]}
    />
  );
}
