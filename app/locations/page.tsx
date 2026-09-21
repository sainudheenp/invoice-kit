import { LocationCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FinalCta } from "@/components/FinalCta";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { LOCATIONS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Wayanad Taxi by Location | Kalpetta, Vythiri, Meppadi & More",
  description:
    "Taxi and cab guides for every Wayanad town — Kalpetta, Vythiri, Meppadi, Sulthan Bathery, Mananthavady & more. Transport, airport links and sightseeing.",
  path: "/locations/",
  image: "/images/hero.jpg",
});

export default function LocationsIndexPage() {
  return (
    <>
      <section className="border-b border-stone-200/70 bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Wayanad Locations" }]} />
          <div className="mt-6 max-w-2xl">
            <p className="text-[12.5px] font-bold tracking-[0.16em] text-forest-700 uppercase">
              Local guides
            </p>
            <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-stone-900 sm:text-[44px]">
              Taxi & Travel Across Wayanad
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-stone-600 sm:text-[17.5px]">
              Every Wayanad town has its own roads, nearby sights and best
              arrival route. Pick your base — each guide covers local transport,
              airport connections and sightseeing.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-label="All locations">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {LOCATIONS.map((location, i) => (
            <Reveal key={location.slug} delay={(i % 4) * 60}>
              <LocationCard location={location} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6" aria-label="About Wayanad travel">
        <Reveal>
          <div className="rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-10">
            <SectionHeading
              eyebrow="Good to know"
              title="How Wayanad Travel Works"
            />
            <div className="mt-6 grid gap-6 text-[15.5px] leading-relaxed text-stone-600 md:grid-cols-3">
              <p>
                <strong className="text-stone-900">Wayanad is a district, not one town.</strong>{" "}
                Vythiri, Kalpetta, Meppadi and Bathery sit 15–40 km apart — and
                the sights spread wider still. Your base decides your days.
              </p>
              <p>
                <strong className="text-stone-900">Two airports serve the district.</strong>{" "}
                Calicut Airport suits the Vythiri–Kalpetta–Meppadi side; Kannur
                Airport suits Mananthavady and the north.
              </p>
              <p>
                <strong className="text-stone-900">A private vehicle ties it together.</strong>{" "}
                Public transport between sights is limited. One arranged vehicle
                covers arrivals, sightseeing days and departure.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <FinalCta page="locations_index" />
    </>
  );
}
