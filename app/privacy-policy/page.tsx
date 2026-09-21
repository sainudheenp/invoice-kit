import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Privacy policy of In Drive Tours — how your enquiry details shared via this website and WhatsApp are used.",
  path: "/privacy-policy/",
});

const SECTIONS = [
  {
    title: "Information you share",
    body: "When you submit an enquiry through this website, you share details such as your name, phone/WhatsApp number, passenger count and trip information (pickup, destination, date and time). This information is used only to respond to your enquiry and arrange your trip.",
  },
  {
    title: "How enquiries work",
    body: "This website does not process online bookings or payments. Your enquiry details are passed to WhatsApp as a pre-filled message that you review and send yourself. From there, communication continues directly between you and In Drive Tours on WhatsApp or phone.",
  },
  {
    title: "How we use your details",
    body: "We use your details to check vehicle availability, confirm pricing, coordinate pickups and communicate about your trip. We do not sell your personal information to third parties.",
  },
  {
    title: "Analytics",
    body: "We may use privacy-friendly analytics (such as Google Analytics) to understand which pages and services visitors find useful. This data is aggregated and does not identify you personally.",
  },
  {
    title: "Your choices",
    body: "You can ask us to delete your enquiry details from our records at any time by contacting us on WhatsApp, phone or email. Note that messages you sent via WhatsApp remain subject to WhatsApp's own privacy policy.",
  },
  {
    title: "Contact",
    body: "For any privacy questions, contact In Drive Tours through the phone number, WhatsApp or email listed on the Contact page.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Privacy Policy" }]} />
      <h1 className="mt-6 text-[32px] font-extrabold tracking-tight text-stone-900 sm:text-4xl">
        Privacy Policy
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
