import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms & Conditions",
  description:
    "Terms and conditions for enquiring and travelling with In Drive Tours — bookings, pricing, conduct and liability.",
  path: "/terms-and-conditions/",
});

const SECTIONS = [
  {
    title: "Enquiries and confirmations",
    body: "Submitting an enquiry through this website does not constitute a confirmed booking. A trip is confirmed only when In Drive Tours explicitly confirms vehicle availability, price and pickup details with you — typically on WhatsApp or phone.",
  },
  {
    title: "Pricing",
    body: "Final pricing is confirmed before the trip based on your route, vehicle type, dates and any waiting or extra-kilometre requirements. Any estimate shared during enquiry is indicative until confirmed.",
  },
  {
    title: "Payments",
    body: "This website does not collect online payments. Payment terms (advance, if any, and balance) are agreed directly with In Drive Tours during confirmation.",
  },
  {
    title: "Trip changes",
    body: "Route, timing or vehicle changes requested after confirmation are accommodated subject to availability, and may affect pricing. Please share changes as early as possible.",
  },
  {
    title: "Conduct and safety",
    body: "Passengers are expected to follow the driver's reasonable instructions, wear seatbelts where available, and avoid behaviour that endangers the driver, co-passengers or the vehicle. Damage caused by passengers may be charged.",
  },
  {
    title: "Delays and disruptions",
    body: "Drive times mentioned on this website are approximate and depend on traffic, weather, road conditions and ghat restrictions. In Drive Tours is not liable for missed flights, events or connections arising from such delays — please plan buffer time for time-critical travel.",
  },
  {
    title: "Liability",
    body: "In Drive Tours arranges transportation services and takes reasonable care in doing so. Liability, if any, is limited to the value of the transportation service booked.",
  },
];

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Terms & Conditions" }]} />
      <h1 className="mt-6 text-[32px] font-extrabold tracking-tight text-stone-900 sm:text-4xl">
        Terms & Conditions
      </h1>
      <p className="mt-3 text-[15px] text-stone-500">Last updated: September 2026</p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-[20px] font-extrabold tracking-tight text-stone-900">{section.title}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-stone-600">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
