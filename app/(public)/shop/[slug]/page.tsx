import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductWithVariants } from "@/lib/shop/queries";
import { formatPrice } from "@/lib/shop/format";
import { productSchema } from "@/lib/seo/structured-data";
import { siteConfig } from "@/config/site";
import { ProductDetail } from "./product-detail";

interface ProductDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProductWithVariants(slug);
  if (!result) return {};

  const { product } = result;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://" + siteConfig.domain;
  const url = `${baseUrl}/shop/${slug}`;

  return {
    title: `${product.name.en} | ${siteConfig.name}`,
    description:
      product.description?.en ??
      `${product.name.en} — ${formatPrice(product.price_cents)}`,
    openGraph: {
      title: product.name.en,
      description: product.description?.en ?? undefined,
      url,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const result = await getProductWithVariants(slug);
  if (!result) notFound();

  const { product, variants, bulkPricing, relatedProducts } = result;

  const jsonLd = productSchema({
    name: product.name.en,
    description: product.description?.en,
    price_cents: product.price_cents,
    image: product.images?.[0],
    slug: product.slug,
    stock_quantity: product.stock_quantity,
  });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={product}
        variants={variants}
        bulkPricing={bulkPricing}
        relatedProducts={relatedProducts}
      />
    </div>
  );
}
