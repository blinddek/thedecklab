import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  getActiveProductsWithVariants,
  getProductCategoriesHierarchical,
} from "@/lib/shop/queries";
import { getMaterials } from "@/lib/deck/queries";
import { ProductCard } from "@/components/shop/product-card";
import { CategorySidebar } from "@/components/shop/category-sidebar";
import { ShopFilters } from "@/components/shop/shop-filters";
import { Pagination } from "@/components/shop/pagination";

export async function generateMetadata() {
  return generatePageMetadata("shop");
}

interface ShopPageProps {
  readonly searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    material?: string;
    page?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categorySlug = params.category ?? null;
  const search = params.search;
  const sort = (params.sort as "newest" | "price_asc" | "price_desc" | "name_asc") || "newest";
  const materialId = params.material ?? null;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ products, total }, categories, materials] = await Promise.all([
    getActiveProductsWithVariants({
      categorySlug: categorySlug ?? undefined,
      materialTypeId: materialId ?? undefined,
      search,
      sort,
      page,
    }),
    getProductCategoriesHierarchical(),
    getMaterials(),
  ]);

  const perPage = 12;
  const totalPages = Math.ceil(total / perPage);

  // Build a flat record of current search params for link building
  const currentParams: Record<string, string> = {};
  if (categorySlug) currentParams.category = categorySlug;
  if (search) currentParams.search = search;
  if (sort !== "newest") currentParams.sort = sort;
  if (materialId) currentParams.material = materialId;
  if (page > 1) currentParams.page = String(page);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 md:px-8">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl">Shop</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Browse our decking products and accessories
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h2>
          <CategorySidebar
            categories={categories}
            activeCategorySlug={categorySlug}
          />
        </aside>

        {/* Main content */}
        <div>
          {/* Filters */}
          <ShopFilters
            materials={materials}
            activeMaterialId={materialId}
            sort={sort}
            searchParams={currentParams}
          />

          {/* Product grid */}
          {products.length === 0 ? (
            <p className="mt-12 text-center text-muted-foreground">
              No products found. Try adjusting your filters or check back soon!
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            searchParams={currentParams}
          />
        </div>
      </div>
    </div>
  );
}
