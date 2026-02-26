"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/shop/format";
import type { Kit, KitComponentWithProduct, MaterialType } from "@/types/deck";

interface KitDetailProps {
  readonly kit: Kit & {
    components: KitComponentWithProduct[];
    material?: MaterialType;
  };
}

export function KitDetail({ kit }: KitDetailProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddKitToCart() {
    for (const component of kit.components) {
      if (!component.product) continue;

      const product = component.product;
      const variant = component.variant;

      addItem(
        {
          product_id: product.id,
          variant_id: variant?.id,
          variant_name: variant?.name.en,
          name: product.name.en,
          price_cents: variant?.price_cents ?? product.price_cents,
          image: product.images?.[0],
          slug: product.slug,
        },
        component.quantity
      );
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Image */}
      <div>
        {kit.image_url ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <Image
              src={kit.image_url}
              alt={kit.name.en}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-muted text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Kit info */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-foreground">{kit.name.en}</h1>

        <div className="mt-3 flex flex-wrap gap-2">
          {kit.area_m2 != null && (
            <Badge variant="outline">Covers {kit.area_m2}m&sup2;</Badge>
          )}
          {kit.material && (
            <Badge variant="secondary">{kit.material.name.en}</Badge>
          )}
        </div>

        {kit.description?.en && (
          <p className="mt-4 text-muted-foreground">{kit.description.en}</p>
        )}

        {/* Component list */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Kit Contents
          </h2>
          <div className="divide-y rounded-lg border">
            {kit.components.map((component) => {
              const product = component.product;
              const variant = component.variant;
              if (!product) return null;

              const unitPrice = variant?.price_cents ?? product.price_cents;

              return (
                <div
                  key={component.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {product.name.en}
                      {variant && (
                        <span className="ml-1 text-muted-foreground">
                          ({variant.name.en})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(unitPrice)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      x{component.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(unitPrice * component.quantity)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total + Add to Cart */}
        <div className="mt-6 flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
          <span className="text-sm font-semibold text-muted-foreground">
            Kit Total
          </span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(kit.price_cents)}
          </span>
        </div>

        <Button
          size="lg"
          onClick={handleAddKitToCart}
          className="mt-4 w-full"
        >
          {added ? "Added to Cart!" : "Add Kit to Cart"}
        </Button>
      </div>
    </div>
  );
}
