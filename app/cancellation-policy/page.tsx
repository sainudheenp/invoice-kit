import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cancellation Policy",
  description:
    "Cancellation policy of In Drive Tours — how to cancel or reschedule your trip and how refunds are handled.",
  path: "/cancellation-policy/",
});

const SECTIONS = [
  {
    title: "How to cancel or reschedule",
    body: "To cancel or reschedule a confirmed trip, message or call In Drive Tours on the same phone/WhatsApp number used for your booking. Please do this as early as possible so the vehicle can be released for other travellers.",
  },
  {
    title: "Refunds",
    body: "If you paid any advance directly to In Drive Tours, refund eligibility and timelines are confirmed with you at the time of cancellation, depending on how close the cancellation is to the trip date and whether the vehicle was already committed or had started moving.",
  },
  {
    title: "Cancellations by us",
    body: "In rare cases — such as vehicle breakdown, unsafe weather or road closures — we may need to cancel or reschedule. We will inform you as early as possible and help find an alternative where we can.",
  },
  {
    title: "No-shows",
    body: "If the vehicle reaches the pickup point and the passenger cannot be reached or does not show up within a reasonable waiting time, the trip may be treated as cancelled and any advance adjusted accordingly.",
  },
];

export default function CancellationPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Cancellation Policy" }]} />
      <h1 className="mt-6 text-[32px] font-extrabold tracking-tight text-stone-900 sm:text-4xl">
        Cancellation Policy
      </h1>
      <p className="mt-3 text-[15px] text-stone-500">Last updated: September 2026</p>
      <div className="mt-8 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-[20px] font-extrabold tracking-tight text-stone-900">{section.title}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-stone-600">{section.body}</p>
          </section>
        ))}
        <p className="rounded-2xl bg-forest-50 p-5 text-[15.5px] text-stone-700">
          Need to change a trip?{" "}
          <Link href="/contact/" className="font-bold text-forest-900 underline underline-offset-4">
            Contact us
          </Link>{" "}
          — the earlier, the easier it is to help.
        </p>
      </div>
    </article>
  );
}
