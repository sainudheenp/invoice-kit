import { notFound } from "next/navigation";
import { RoutePage } from "@/components/PageTemplates";
import { ROUTES, routeBySlug } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return ROUTES.map((route) => ({ slug: route.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = routeBySlug(slug);
  if (!route) return {};
  return pageMetadata({
    title: route.metaTitle,
    description: route.metaDescription,
    path: `/routes/${slug}/`,
    image: route.heroImage,
  });
}

export default async function RouteSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = routeBySlug(slug);
  if (!route) notFound();

  return <RoutePage slug={slug} />;
}
