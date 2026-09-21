import { RouteCard } from "@/components/Cards";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FinalCta } from "@/components/FinalCta";
import { Reveal } from "@/components/Reveal";
import { ROUTES } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Wayanad Routes & Transfers | Airport, Mysore & Bangalore",
  description:
    "Transfer guides for every major Wayanad route — Calicut & Kannur airports, Mysore and Bangalore. Distances, drive times and private taxi enquiries.",
  path: "/routes/",
  image: "/images/ghat-road.jpg",
});

export default function RoutesIndexPage() {
  return (
    <>
      <section className="border-b border-stone-200/70 bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Routes & Transfers" }]} />
          <div className="mt-6 max-w-2xl">
            <p className="text-[12.5px] font-bold tracking-[0.16em] text-forest-700 uppercase">
              Route guides
            </p>
            <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-stone-900 sm:text-[44px]">
              Wayanad Routes & Transfers
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-stone-600 sm:text-[17.5px]">
              Airport runs, intercity transfers and what each journey actually
              involves — distances, drive times and the right vehicle for the
              road. Every transfer runs in both directions.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14" aria-label="All routes">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((route, i) => (
            <Reveal key={route.slug} delay={(i % 3) * 60}>
              <RouteCard route={route} page="routes_index" />
            </Reveal>
          ))}
        </div>
      </section>

      <FinalCta page="routes_index" />
    </>
  );
}
