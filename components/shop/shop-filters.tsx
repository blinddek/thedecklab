"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { MaterialType } from "@/types/deck";

interface ShopFiltersProps {
  materials: MaterialType[];
  activeMaterialId: string | null;
  sort: string;
  searchParams: Record<string, string>;
}

function buildHref(
  searchParams: Record<string, string>,
  overrides: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  // Merge current params with overrides, removing undefined values
  const merged = { ...searchParams, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  // Reset to page 1 when filters change
  if (overrides.material !== undefined || overrides.sort !== undefined) {
    params.delete("page");
  }
  const qs = params.toString();
  return `/shop${qs ? `?${qs}` : ""}`;
}

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price \u2191" },
  { value: "price_desc", label: "Price \u2193" },
  { value: "name_asc", label: "Name A-Z" },
];

export function ShopFilters({
  materials,
  activeMaterialId,
  sort,
  searchParams,
}: ShopFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Material filter */}
      <div className="flex flex-wrap gap-2">
        <Link href={buildHref(searchParams, { material: undefined })}>
          <Badge
            variant={!activeMaterialId ? "default" : "outline"}
            className="cursor-pointer"
          >
            All Materials
          </Badge>
        </Link>
        {materials.map((mat) => (
          <Link
            key={mat.id}
            href={buildHref(searchParams, {
              material: activeMaterialId === mat.id ? undefined : mat.id,
            })}
          >
            <Badge
              variant={activeMaterialId === mat.id ? "default" : "outline"}
              className="cursor-pointer"
            >
              {mat.name.en}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex gap-2">
        <form action="/shop" method="get" className="flex gap-2">
          {searchParams.category && (
            <input type="hidden" name="category" value={searchParams.category} />
          )}
          {searchParams.material && (
            <input type="hidden" name="material" value={searchParams.material} />
          )}
          {searchParams.sort && (
            <input type="hidden" name="sort" value={searchParams.sort} />
          )}
          <Input
            name="search"
            placeholder="Search products..."
            defaultValue={searchParams.search ?? ""}
            className="w-48"
          />
        </form>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <Link
              key={value}
              href={buildHref(searchParams, { sort: value })}
            >
              <Badge
                variant={sort === value ? "default" : "outline"}
                className="cursor-pointer"
              >
                {label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
