import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/shop/format";
import type { Product } from "@/types";
import type { ProductWithVariants } from "@/lib/shop/queries";

function isProductWithVariants(p: Product | ProductWithVariants): p is ProductWithVariants {
  return "variants_count" in p;
}

export function ProductCard({ product }: Readonly<{ product: Product | ProductWithVariants }>) {
  const image = product.images?.[0];
  const hasVariants = isProductWithVariants(product) && product.variants_count > 0;
  const displayPrice = hasVariants
    ? product.starting_price_cents
    : product.price_cents;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name.en}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {product.stock_quantity <= 0 && (
          <Badge variant="destructive" className="absolute right-2 top-2">
            Sold out
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
          {product.name.en}
        </h3>
        <p className="mt-1 text-lg font-bold text-foreground">
          {hasVariants ? `From ${formatPrice(displayPrice)}` : formatPrice(displayPrice)}
        </p>
        {hasVariants && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.variants_count} option
            {product.variants_count === 1 ? "" : "s"}
          </p>
        )}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <p className="mt-1 text-xs text-orange-600">
            Only {product.stock_quantity} left
          </p>
        )}
      </div>
    </Link>
  );
}
