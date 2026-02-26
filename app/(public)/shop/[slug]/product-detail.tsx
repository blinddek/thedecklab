"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/shop/format";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/shop/product-card";
import type { Product, BulkPricing } from "@/types";
import type { ProductVariant } from "@/types/deck";

interface ProductDetailProps {
  readonly product: Product & {
    material_type_id: string | null;
    sku: string | null;
    dimensions: Record<string, unknown> | null;
  };
  readonly variants: ProductVariant[];
  readonly bulkPricing: BulkPricing[];
  readonly relatedProducts: Product[];
}

function StockBadge({ quantity }: Readonly<{ quantity: number }>) {
  if (quantity <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (quantity <= 5) {
    return (
      <Badge className="border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-300">
        Low Stock — {quantity} left
      </Badge>
    );
  }
  return (
    <Badge className="border-green-300 bg-green-100 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-300">
      In Stock
    </Badge>
  );
}

export function ProductDetail({
  product,
  variants,
  bulkPricing,
  relatedProducts,
}: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;
  const hasVariants = variants.length > 0;

  // Determine active price and stock
  const activePriceCents = selectedVariant
    ? selectedVariant.price_cents
    : product.price_cents;
  const activeStock = selectedVariant
    ? selectedVariant.stock_quantity
    : product.stock_quantity;
  const inStock = activeStock > 0;

  // Separate variants by type: length vs colour
  const lengthVariants = variants.filter((v) => v.length_mm !== null);
  const colourVariants = variants.filter((v) => v.colour !== null && v.length_mm === null);
  const otherVariants = variants.filter((v) => v.length_mm === null && v.colour === null);

  function handleAddToCart() {
    if (hasVariants && !selectedVariant) return;

    addItem(
      {
        product_id: product.id,
        variant_id: selectedVariant?.id,
        variant_name: selectedVariant?.name.en,
        name: product.name.en,
        price_cents: activePriceCents,
        image: product.images?.[0],
        slug: product.slug,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const needsVariantSelection = hasVariants && !selectedVariant;

  return (
    <div>
      <div className="grid gap-10 md:grid-cols-2">
        {/* Images */}
        <div className="flex flex-col gap-4">
          {product.images?.[0] ? (
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src={product.images[0]}
                alt={product.name.en}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl bg-muted text-muted-foreground">
              No image
            </div>
          )}

          {/* Thumbnail gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <Image
                    src={img}
                    alt={`${product.name.en} — image ${i + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-foreground">
            {product.name.en}
          </h1>

          {product.sku && (
            <p className="mt-1 text-sm text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}

          <p className="mt-4 text-3xl font-bold text-primary">
            {formatPrice(activePriceCents)}
          </p>

          <div className="mt-2">
            <StockBadge quantity={activeStock} />
          </div>

          {/* Length variants */}
          {lengthVariants.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Length
              </h3>
              <div className="flex flex-wrap gap-2">
                {lengthVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selectedVariantId === v.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    )}
                  >
                    {v.name.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colour variants */}
          {colourVariants.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Colour
              </h3>
              <div className="flex flex-wrap gap-2">
                {colourVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    title={v.name.en}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      selectedVariantId === v.id
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span
                      className="h-7 w-7 rounded-full"
                      style={{ backgroundColor: v.colour ?? "#ccc" }}
                    />
                  </button>
                ))}
              </div>
              {selectedVariant?.colour && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedVariant.name.en}
                </p>
              )}
            </div>
          )}

          {/* Other variants (generic) */}
          {otherVariants.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Options
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                      selectedVariantId === v.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    )}
                  >
                    {v.name.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk pricing */}
          {bulkPricing.length > 0 && (
            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Bulk Pricing
              </h3>
              <div className="space-y-1">
                {bulkPricing.map((bp) => (
                  <p key={bp.id} className="text-sm text-muted-foreground">
                    Buy {bp.min_quantity}+ for{" "}
                    <span className="font-medium text-foreground">
                      {formatPrice(bp.price_cents)}
                    </span>{" "}
                    each
                  </p>
                ))}
              </div>
            </div>
          )}

          {product.description?.en && (
            <div className="mt-6 text-muted-foreground">
              {product.description.en}
            </div>
          )}

          {/* Specs table */}
          {product.dimensions && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                Specifications
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {product.dimensions.width_mm != null && (
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">Width</td>
                      <td className="py-2 text-right font-medium text-foreground">
                        {String(product.dimensions.width_mm)}mm
                      </td>
                    </tr>
                  )}
                  {product.dimensions.thickness_mm != null && (
                    <tr className="border-b">
                      <td className="py-2 text-muted-foreground">Thickness</td>
                      <td className="py-2 text-right font-medium text-foreground">
                        {String(product.dimensions.thickness_mm)}mm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {needsVariantSelection && (
            <p className="mt-6 text-sm font-medium text-muted-foreground">
              Select an option above to continue
            </p>
          )}

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <button
                type="button"
                className="px-3 py-2 text-lg hover:bg-muted"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!inStock || needsVariantSelection}
              >
                -
              </button>
              <span className="min-w-[3rem] text-center">{quantity}</span>
              <button
                type="button"
                className="px-3 py-2 text-lg hover:bg-muted"
                onClick={() =>
                  setQuantity((q) => Math.min(activeStock, q + 1))
                }
                disabled={!inStock || needsVariantSelection}
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock || needsVariantSelection}
              className="flex-1"
            >
              {added
                ? "Added!"
                : needsVariantSelection
                  ? "Select an option"
                  : inStock
                    ? "Add to Cart"
                    : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">
            Frequently Bought Together
          </h2>
          <div className="mt-6 flex gap-6 overflow-x-auto pb-4">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="w-64 flex-shrink-0">
                <ProductCard product={rp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
