import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/shop/format";
import type { Kit, KitComponentWithProduct, MaterialType } from "@/types/deck";

interface KitCardProps {
  readonly kit: Kit & {
    components: KitComponentWithProduct[];
    material?: MaterialType;
  };
}

export function KitCard({ kit }: KitCardProps) {
  return (
    <Link
      href={`/shop/kits/${kit.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {kit.image_url ? (
          <Image
            src={kit.image_url}
            alt={kit.name.en}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">
          {kit.name.en}
        </h3>

        {kit.description?.en && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {kit.description.en}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {kit.area_m2 != null && (
            <Badge variant="outline" className="text-xs">
              {kit.area_m2}m&sup2;
            </Badge>
          )}
          {kit.material && (
            <Badge variant="secondary" className="text-xs">
              {kit.material.name.en}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {kit.components.length} component{kit.components.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <p className="mt-3 text-lg font-bold text-foreground">
          {formatPrice(kit.price_cents)}
        </p>
      </div>
    </Link>
  );
}
