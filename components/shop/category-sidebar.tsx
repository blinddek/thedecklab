"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ProductCategoryWithChildren } from "@/lib/shop/queries";

interface CategorySidebarProps {
  categories: ProductCategoryWithChildren[];
  activeCategorySlug: string | null;
}

function isActiveOrHasActiveChild(
  category: ProductCategoryWithChildren,
  activeSlug: string | null
): boolean {
  if (!activeSlug) return false;
  if (category.slug === activeSlug) return true;
  return category.children.some((c) => isActiveOrHasActiveChild(c, activeSlug));
}

function CategoryItem({
  category,
  activeCategorySlug,
  depth,
}: {
  category: ProductCategoryWithChildren;
  activeCategorySlug: string | null;
  depth: number;
}) {
  const isActive = category.slug === activeCategorySlug;
  const expanded = isActiveOrHasActiveChild(category, activeCategorySlug);

  return (
    <div>
      <Link
        href={`/shop?category=${category.slug}`}
        className={cn(
          "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          isActive && "bg-primary/10 text-primary",
          !isActive && "text-foreground",
          depth > 0 && "ml-4"
        )}
      >
        {category.name.en}
      </Link>
      {category.children.length > 0 && expanded && (
        <div className="mt-1 space-y-1">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategorySlug={activeCategorySlug}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategorySidebar({
  categories,
  activeCategorySlug,
}: CategorySidebarProps) {
  return (
    <nav className="space-y-1">
      <Link
        href="/shop"
        className={cn(
          "block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          !activeCategorySlug ? "bg-primary/10 text-primary" : "text-foreground"
        )}
      >
        All Products
      </Link>
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          activeCategorySlug={activeCategorySlug}
          depth={0}
        />
      ))}
    </nav>
  );
}
