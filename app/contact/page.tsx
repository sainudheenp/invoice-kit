import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BookingButton, WhatsAppGlyph } from "@/components/BookingModal";
import { WhatsAppLink } from "@/components/WhatsAppLink";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/site";
import { LOCATIONS } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact In Drive Tours | Wayanad Taxi & Travel Enquiries",
  description:
    "Contact In Drive Tours for Wayanad taxi, airport transfer, sightseeing and group vehicle enquiries — by phone, WhatsApp or email.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-stone-200/70 bg-cream-100">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 sm:pt-10">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Contact" }]} />
          <div className="mt-6 max-w-2xl">
            <p className="text-[12.5px] font-bold tracking-[0.16em] text-forest-700 uppercase">
              Get in touch
            </p>
            <h1 className="mt-3 text-[32px] leading-[1.08] font-extrabold tracking-tight text-stone-900 sm:text-[44px]">
              Contact In Drive Tours
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-stone-600 sm:text-[17.5px]">
              The fastest way to reach us is WhatsApp — share your trip details
              and we&apos;ll confirm availability and price.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border-2 border-wa-600 bg-white p-6 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-wa-600 text-white">
                <MessageCircle className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-[22px] font-extrabold tracking-tight text-stone-900">
                WhatsApp — fastest
              </h2>
              <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-stone-600">
                Send your trip details and get availability and pricing
                confirmed directly. No accounts, no waiting on hold.
              </p>
              <WhatsAppLink
                page="contact"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-wa-600 px-7 py-3.5 text-[15.5px] font-bold text-white transition hover:bg-wa-700"
              >
                <WhatsAppGlyph className="h-5 w-5" />
                Chat on WhatsApp
              </WhatsAppLink>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex h-full flex-col rounded-3xl border border-stone-200/80 bg-white p-6 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-900 text-sun-300">
                <Phone className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-[22px] font-extrabold tracking-tight text-stone-900">
                Call us
              </h2>
              <p className="mt-2 flex-1 text-[15.5px] leading-relaxed text-stone-600">
                Prefer to talk? Call us about your trip and we&apos;ll help
                work out the right vehicle.
              </p>
              <a
                href={`tel:${SITE.phoneNumber}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-forest-900 px-7 py-3.5 text-[15.5px] font-bold text-white transition hover:bg-forest-800"
              >
                <Phone className="h-4.5 w-4.5" />
                {SITE.phoneDisplay}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-6 transition hover:border-forest-700"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
                <Mail className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-[13px] font-bold tracking-[0.1em] text-stone-500 uppercase">Email</span>
                <span className="block text-[17px] font-bold text-stone-900">{SITE.email}</span>
              </span>
            </a>
            <div className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-800">
                <MapPin className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-[13px] font-bold tracking-[0.1em] text-stone-500 uppercase">Service area</span>
                <span className="block text-[17px] font-bold text-stone-900">{SITE.area}</span>
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12">
            <SectionHeading
              eyebrow="Service area"
              title="Towns We Serve Across Wayanad"
            />
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {LOCATIONS.map((location) => (
                <li key={location.slug}>
                  <a
                    href={`/locations/${location.slug}/`}
                    className="inline-block rounded-full border border-stone-300 bg-white px-5 py-2.5 text-[14.5px] font-bold text-stone-700 transition hover:border-forest-800 hover:text-forest-900"
                  >
                    {location.name}
                  </a>
                </li>
              ))}
              <li>
                <span className="inline-block rounded-full bg-forest-50 px-5 py-2.5 text-[14.5px] font-semibold text-forest-900">
                  + nearby Wayanad destinations
                </span>
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 rounded-3xl bg-forest-950 p-8 text-center sm:p-10">
            <h2 className="text-[24px] font-extrabold tracking-tight text-white sm:text-[28px]">
              Ready when you are
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[15.5px] text-stone-300">
              Share your trip in under a minute — name, number, passengers, done.
            </p>
            <BookingButton
              context={{ page: "contact" }}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-sun-400 px-8 py-4 text-[16px] font-extrabold text-stone-950 transition hover:bg-sun-300"
            >
              Start Your Enquiry
            </BookingButton>
          </div>
        </Reveal>
      </section>
    </>
  );
}
