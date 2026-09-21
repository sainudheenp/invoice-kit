import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Compass,
  MapPin,
  MessageCircle,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import {
  BOOKING_STEPS,
  HOME_FAQS,
  LOCATIONS,
  ROUTES,
  SERVICES,
  SPOTS,
  TRUST_POINTS,
  VEHICLES,
} from "@/lib/content";
import { faqJsonLd } from "@/lib/seo";
import { BookingButton, WhatsAppGlyph } from "@/components/BookingModal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { HeroSearch } from "@/components/HeroSearch";
import { SectionHeading } from "@/components/SectionHeading";
import { LocationCard, ServiceCard, VehicleCard } from "@/components/Cards";
import { Faq } from "@/components/Faq";
import { FinalCta } from "@/components/FinalCta";
import { JsonLd } from "@/components/JsonLd";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Wayanad Taxi & Cab Booking | Airport Transfers & Travellers | In Drive Tours",
  description:
    "Book Wayanad taxis, airport transfers, sightseeing cars and group vehicles with In Drive Tours. Enquire through WhatsApp for availability and pricing.",
  alternates: { canonical: `${SITE.siteUrl}/` },
};

const HERO_STATS = [
  { value: "8", label: "Vehicle types, from sedans to buses" },
  { value: "2", label: "Airports served — Calicut & Kannur" },
  { value: "8", label: "Towns covered across Wayanad" },
  { value: "1 min", label: "To send your WhatsApp enquiry" },
] as const;

const HERO_ASSURANCES = [
  { icon: MapPin, title: "Local Wayanad team", text: "Trips planned around real ghat timings" },
  { icon: CarFront, title: "Cars to buses", text: "One enquiry for any group size" },
  { icon: Plane, title: "Flight-timed pickups", text: "Airport runs planned around you" },
  { icon: Wallet, title: "No advance payment", text: "Confirm on WhatsApp, pay for the trip" },
] as const;

const AIRPORT_CARDS = [
  {
    from: "Calicut Airport",
    to: "Wayanad",
    note: "Arrivals via the Thamarassery ghat to Vythiri, Kalpetta & Meppadi.",
    guide: "/routes/calicut-airport-to-wayanad/",
  },
  {
    from: "Wayanad",
    to: "Calicut Airport",
    note: "Departures timed around your flight, with ghat buffer time.",
    guide: "/routes/calicut-airport-to-wayanad/",
  },
  {
    from: "Kannur Airport",
    to: "Wayanad",
    note: "The convenient arrival for Mananthavady & north Wayanad.",
    guide: "/routes/kannur-airport-to-wayanad/",
  },
  {
    from: "Wayanad",
    to: "Kannur Airport",
    note: "North-side departures via the Nedumpoyil ghat route.",
    guide: "/routes/kannur-airport-to-wayanad/",
  },
] as const;

const WHY_ICONS = [MapPin, CarFront, Plane, Users, MessageCircle, Compass] as const;

export default function Home() {
  const airportRoute = ROUTES.find((r) => r.slug === "calicut-airport-to-wayanad");

  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section className="relative overflow-hidden bg-forest-950" aria-labelledby="hero-title">
        <Image
          src="/images/hero.jpg"
          alt="Misty Wayanad tea gardens with a winding road at sunrise"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-950/55 to-forest-950/15"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-forest-950/60 to-transparent" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 sm:pb-28">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[12.5px] font-bold tracking-[0.08em] text-cream-50 uppercase backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-sun-300" />
              Wayanad, Kerala — taxi, travellers & buses
            </p>
            <h1
              id="hero-title"
              className="mt-5 text-[38px] leading-[1.05] font-extrabold tracking-tight text-balance text-white sm:text-[56px]"
            >
              Wayanad Taxi & Travel, Made Simple
            </h1>
            <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-white/90 sm:text-[18px]">
              Cabs, airport transfers, sightseeing, Tempo Travellers and buses
              across Wayanad.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <BookingButton
                context={{ page: "home_hero" }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sun-400 px-8 py-4 text-[16px] font-extrabold text-stone-950 shadow-xl transition hover:bg-sun-300 active:scale-[0.98]"
              >
                Book a Ride <ArrowRight className="h-4.5 w-4.5" />
              </BookingButton>
              <WhatsAppLink
                page="home_hero"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 px-8 py-[14px] text-[16px] font-bold text-white transition hover:bg-white hover:text-forest-950"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                WhatsApp Us
              </WhatsAppLink>
            </div>
            <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="border-l-2 border-white/25 pl-3">
                  <dt className="order-2 mt-1 text-[12.5px] leading-snug font-medium text-white/75">
                    {stat.label}
                  </dt>
                  <dd className="order-1 text-[24px] font-extrabold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Search */}
      <div className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:-mt-16 sm:px-6">
        <Reveal>
          <HeroSearch page="home" />
          <div className="grid gap-2.5 pt-3 sm:grid-cols-2 lg:grid-cols-4">
            {HERO_ASSURANCES.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-stone-200/70 bg-white px-4 py-3 shadow-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-50 text-forest-800">
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-bold text-stone-900">{item.title}</span>
                  <span className="block text-[12.5px] text-stone-500">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* ------------------------------------------------ Services */}
      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20" aria-labelledby="services-title">
        <Reveal>
          <div id="services-title">
            <SectionHeading
              eyebrow="Services"
              title="What Can We Arrange?"
              lede="One team for your whole Wayanad trip — daily cabs, airport runs, sightseeing days and group vehicles."
            />
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.slug} delay={(i % 3) * 60}>
              <ServiceCard service={service} page="home_services" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Vehicles */}
      <section className="mt-16 bg-white py-16 sm:mt-20 sm:py-20" aria-labelledby="vehicles-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div id="vehicles-title">
              <SectionHeading
                eyebrow="Fleet options"
                title="Choose the Right Vehicle"
                lede="From couples to full wedding parties — pick the size that fits, and we'll check availability for your dates."
              />
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VEHICLES.map((vehicle, i) => (
              <Reveal key={vehicle.slug} delay={(i % 4) * 60}>
                <VehicleCard vehicle={vehicle} page="home_vehicles" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Airport transfers */}
      <section className="bg-forest-950 py-16 sm:py-20" aria-labelledby="airport-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div id="airport-title">
              <SectionHeading
                dark
                eyebrow="Airport transfers"
                title="Wayanad Airport Transfers"
                lede="We arrange private transportation between Wayanad and nearby airports, including Calicut International Airport and Kannur International Airport."
                link={{ label: "All airport transfer options", href: "/airport-transfers/" }}
              />
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {AIRPORT_CARDS.map((card, i) => (
              <Reveal key={`${card.from}-${card.to}`} delay={(i % 4) * 60}>
                <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:border-sun-300/40 sm:p-6">
                  <div className="flex items-center gap-2 text-sun-300">
                    <Plane className="h-4 w-4" />
                    <p className="text-[12px] font-bold tracking-[0.12em] uppercase">
                      Flight-timed pickup
                    </p>
                  </div>
                  <h3 className="mt-3 text-[19px] leading-snug font-extrabold text-white">
                    {card.from} <span className="text-sun-300">→</span> {card.to}
                  </h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-stone-300">{card.note}</p>
                  <BookingButton
                    context={{
                      service: "Airport Transfer",
                      pickup: card.from,
                      destination: card.to,
                      page: "home_airport",
                    }}
                    event="airport_transfer_click"
                    className="mt-4 w-full rounded-full bg-sun-400 px-4 py-2.5 text-[14px] font-extrabold text-stone-950 transition hover:bg-sun-300"
                  >
                    Check Availability
                  </BookingButton>
                  <Link
                    href={card.guide}
                    className="mt-2.5 text-center text-[13.5px] font-bold text-white/75 transition hover:text-sun-300"
                  >
                    Route guide →
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
          {airportRoute && (
            <p className="mt-6 text-center text-[13.5px] text-stone-400">
              {airportRoute.duration} · Planned around your landing time
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------ Sightseeing */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="sightseeing-title">
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
          <Reveal>
            <div id="sightseeing-title" className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Sightseeing"
                title="Explore Wayanad With a Local Ride"
                lede="Lakes, waterfalls, viewpoints and estates — spread across the district, and easiest with a private vehicle for the day. You set the pace; we help arrange the ride."
                link={{ label: "Plan a sightseeing day", href: "/wayanad-sightseeing/" }}
              />
              <BookingButton
                context={{ service: "Sightseeing Trip", page: "home_sightseeing" }}
                event="sightseeing_click"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-forest-900/20 transition hover:bg-forest-800"
              >
                Plan My Sightseeing Trip <ArrowRight className="h-4 w-4" />
              </BookingButton>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPOTS.map((spot, i) => (
              <Reveal key={spot.name} delay={(i % 2) * 60}>
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
        </div>
      </section>

      {/* ------------------------------------------------ Locations */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="locations-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6" id="locations">
          <Reveal>
            <div id="locations-title">
              <SectionHeading
                eyebrow="Local guides"
                title="Taxi & Travel Across Wayanad"
                lede="Each town has its own rhythm, roads and nearby sights. Pick your base — every guide covers transport, airport links and sightseeing."
                link={{ label: "Browse all Wayanad locations", href: "/locations/" }}
              />
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {LOCATIONS.map((location, i) => (
              <Reveal key={location.slug} delay={(i % 4) * 60}>
                <LocationCard location={location} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="how-title">
        <Reveal>
          <div id="how-title">
            <SectionHeading
              align="center"
              eyebrow="Simple by design"
              title="Booked in Three Steps"
              lede="No accounts, no apps, no advance online payment — just a quick enquiry and a confirmed trip."
            />
          </div>
        </Reveal>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {BOOKING_STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 80}>
              <li className="relative h-full rounded-3xl border border-stone-200/80 bg-white p-6 shadow-sm sm:p-8">
                <span className="text-[15px] font-extrabold tracking-[0.14em] text-forest-600">
                  {step.number}
                </span>
                <h3 className="mt-2 text-[20px] font-extrabold tracking-tight text-stone-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-stone-600">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------ Why us */}
      <section className="border-y border-stone-200/70 bg-cream-100 py-16 sm:py-20" aria-labelledby="why-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div id="why-title">
              <SectionHeading
                eyebrow="Why In Drive Tours"
                title="A Local Team for Your Wayanad Trip"
                lede="We keep it honest: the right vehicle for your group, realistic timings, and confirmation before you travel."
              />
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((point, i) => {
              const Icon = WHY_ICONS[i % WHY_ICONS.length];
              return (
                <Reveal key={point.title} delay={(i % 3) * 60}>
                  <div className="flex h-full items-start gap-4 rounded-3xl bg-white p-6 shadow-sm">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-900 text-sun-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <h3 className="text-[16.5px] font-extrabold tracking-tight text-stone-900">
                        {point.title}
                      </h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-stone-600">
                        {point.text}
                      </p>
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-3xl border border-forest-800/20 bg-forest-50 px-6 py-6 text-center sm:flex-row sm:gap-4">
              <ShieldCheck className="h-6 w-6 shrink-0 text-forest-800" />
              <p className="text-[15px] font-medium text-stone-700">
                <span className="font-bold text-stone-900">Our promise:</span> we confirm
                availability and price with you on WhatsApp — before your trip, not after.
              </p>
              <BadgeCheck className="hidden h-6 w-6 shrink-0 text-forest-800 sm:block" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="faq-title">
        <JsonLd data={faqJsonLd(HOME_FAQS)} />
        <Reveal>
          <div id="faq-title">
            <SectionHeading
              align="center"
              eyebrow="Good to know"
              title="Frequently Asked Questions"
              lede="The essentials on booking taxis, airport transfers and group vehicles in Wayanad."
            />
          </div>
        </Reveal>
        <Reveal className="mt-8">
          <Faq items={HOME_FAQS} />
        </Reveal>
      </section>

      {/* ------------------------------------------------ Final CTA */}
      <FinalCta page="home_final" />
    </>
  );
}
