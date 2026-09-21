import { notFound } from "next/navigation";
import { LocationPage } from "@/components/PageTemplates";
import { PageViewTracker } from "@/components/PageViewTracker";
import { LOCATIONS, locationBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { ANALYTICS_EVENTS } from "@/lib/analytics";

export function generateStaticParams() {
  return LOCATIONS.map((location) => ({ slug: location.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = locationBySlug(slug);
  if (!location) return {};
  return pageMetadata({
    title: location.metaTitle,
    description: location.metaDescription,
    path: `/locations/${slug}/`,
    image: location.heroImage,
  });
}

export default async function LocationSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = locationBySlug(slug);
  if (!location) notFound();

  return (
    <>
      <PageViewTracker event={ANALYTICS_EVENTS.locationPageView} params={{ location: slug }} />
      <LocationPage slug={slug} />
    </>
  );
}
