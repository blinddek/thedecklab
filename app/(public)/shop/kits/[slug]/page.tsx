import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getKitBySlug } from "@/lib/shop/queries";
import { formatPrice } from "@/lib/shop/format";
import { siteConfig } from "@/config/site";
import { KitDetail } from "@/components/shop/kit-detail";

interface KitDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: KitDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) return {};

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://" + siteConfig.domain;
  const url = `${baseUrl}/shop/kits/${slug}`;

  return {
    title: `${kit.name.en} | ${siteConfig.name}`,
    description:
      kit.description?.en ??
      `${kit.name.en} — ${formatPrice(kit.price_cents)}`,
    openGraph: {
      title: kit.name.en,
      description: kit.description?.en ?? undefined,
      url,
      images: kit.image_url ? [{ url: kit.image_url }] : undefined,
    },
  };
}

export default async function KitDetailPage({ params }: KitDetailPageProps) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) notFound();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      <KitDetail kit={kit} />
    </div>
  );
}
