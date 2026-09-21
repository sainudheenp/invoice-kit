import { MapPin } from "lucide-react";
import { BookingButton } from "@/components/BookingModal";
import { SectionHeading } from "@/components/SectionHeading";
import { ServicePage } from "@/components/PageTemplates";
import { Reveal } from "@/components/Reveal";
import { SPOTS, serviceBySlug, vehicleBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = serviceBySlug("wayanad-sightseeing")!;

export const metadata = pageMetadata({
  title: "Wayanad Sightseeing Taxi | Lakes, Waterfalls & Viewpoints",
  description:
    "Full-day Wayanad sightseeing by private taxi — Pookode Lake, Soochipara Falls, Edakkal Caves, 900 Kandi & more. Plan your day on WhatsApp.",
  path: "/wayanad-sightseeing/",
  image: "/images/sightseeing.jpg",
});

const DAY_IDEAS = [
  {
    title: "Vythiri side",
    places: "Pookode Lake → Lakkidi Viewpoint → Chain Tree",
    note: "A relaxed day, ideal for arrival days and families with elders.",
  },
  {
    title: "Meppadi side",
    places: "Soochipara Falls → Kanthapara Falls → Tea estates",
    note: "Waterfalls and estate views; carry footwear with grip.",
  },
  {
    title: "Edakkal side",
    places: "Edakkal Caves → Heritage Museum → Karapuzha Dam",
    note: "Start the cave climb early; museum and dam after lunch.",
  },
];

export default function SightseeingPage() {
  const vehicles = ["sedan", "ertiga-suv", "innova", "tempo-traveller"]
    .map((slug) => vehicleBySlug(slug)!)
    .filter(Boolean);

  return (
    <ServicePage
      crumbs={[{ name: "Home", path: "/" }, { name: "Wayanad Sightseeing" }]}
      jsonLdPath="/wayanad-sightseeing/"
      eyebrow="Sightseeing by private taxi"
      title="Wayanad Sightseeing Trips"
      lede={service.description}
      image={service.image}
      alt={service.alt}
      paragraphs={service.longDescription}
      points={[
        "Full-day and half-day sightseeing",
        "Flexible plans around your stay",
        "Lakes, falls, caves & viewpoints",
        "Family-paced or packed days — your call",
      ]}
      bookingService="Sightseeing Trip"
      bookingLabel="Plan My Trip"
      page="sightseeing"
      event="sightseeing_click"
      vehicles={vehicles}
      faqs={service.faqs}
    >
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6" aria-label="Places to visit">
        <Reveal>
          <SectionHeading
            eyebrow="Where to go"
            title="Places People Visit Across Wayanad"
            lede="Tell us your stay location and interests — we'll help sequence a sensible day instead of zig-zagging the district."
          />
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SPOTS.map((spot, i) => (
            <Reveal key={spot.name} delay={(i % 3) * 60}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-800">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-stone-900">
                    {spot.name}
                    <span className="ml-2 rounded-full bg-cream-100 px-2 py-0.5 text-[11.5px] font-bold text-stone-500">
                      {spot.area}
                    </span>
                  </span>
                  <span className="mt-1 block text-[13.5px] leading-snug text-stone-500">
                    {spot.note}
                  </span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <h2 className="mt-12 text-[22px] font-extrabold tracking-tight text-stone-900 sm:text-2xl">
            Flexible day ideas <span className="text-[15px] font-semibold text-stone-500">(not fixed packages)</span>
          </h2>
        </Reveal>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {DAY_IDEAS.map((idea, i) => (
            <Reveal key={idea.title} delay={i * 60}>
              <article className="flex h-full flex-col rounded-3xl border border-forest-800/15 bg-forest-50 p-6">
                <h3 className="text-[18px] font-extrabold text-stone-900">{idea.title}</h3>
                <p className="mt-2 text-[14.5px] font-semibold text-forest-900">{idea.places}</p>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-stone-600">{idea.note}</p>
                <BookingButton
                  context={{ service: "Sightseeing Trip", page: "sightseeing_idea" }}
                  event="sightseeing_click"
                  className="mt-4 rounded-full bg-forest-900 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-forest-800"
                >
                  Enquire for this day
                </BookingButton>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </ServicePage>
  );
}
