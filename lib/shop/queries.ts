import { createClient } from "@/lib/supabase/server";
import type { Product, ProductCategory, Order, BulkPricing } from "@/types";
import type { ProductVariant, Kit, KitComponentWithProduct, MaterialType } from "@/types/deck";

// ---------- Shop Settings ----------

export interface ShopSettings {
  shipping_rate_cents: number;
  free_shipping_threshold_cents: number;
  tax_rate_percent: number;
}

export async function getShopSettings(): Promise<ShopSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("shop_settings").select("key, value");

  const settings: ShopSettings = {
    shipping_rate_cents: 5000,
    free_shipping_threshold_cents: 50000,
    tax_rate_percent: 15,
  };

  if (data) {
    for (const row of data) {
      const val = typeof row.value === "number" ? row.value : Number(row.value);
      if (row.key === "shipping_rate_cents") settings.shipping_rate_cents = val;
      if (row.key === "free_shipping_threshold_cents") settings.free_shipping_threshold_cents = val;
      if (row.key === "tax_rate_percent") settings.tax_rate_percent = val;
    }
  }

  return settings;
}

// ---------- Product Categories ----------

export async function getProductCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("display_order");
  return (data as ProductCategory[]) ?? [];
}

// ---------- Products ----------

export async function getActiveProducts(options?: {
  categorySlug?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
}): Promise<Product[]> {
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (cat) categoryId = cat.id;
  }

  let query = supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (options?.search) query = query.ilike("name->en", `%${options.search}%`);

  switch (options?.sort) {
    case "price_asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_cents", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  return (data as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();
  return (data as Product) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .in("id", ids)
    .eq("is_active", true)
    .is("deleted_at", null);
  return (data as Product[]) ?? [];
}

// ---------- Orders (admin) ----------

export async function getOrders(options?: {
  status?: string;
  search?: string;
}): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.search) query = query.ilike("email", `%${options.search}%`);

  const { data } = await query;
  return (data as Order[]) ?? [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Order) ?? null;
}

// ---------- Hierarchical Categories ----------

export interface ProductCategoryWithChildren extends ProductCategory {
  children: ProductCategoryWithChildren[];
}

export async function getProductCategoriesHierarchical(): Promise<ProductCategoryWithChildren[]> {
  const categories = await getProductCategories();

  const map = new Map<string, ProductCategoryWithChildren>();
  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] });
  }

  const roots: ProductCategoryWithChildren[] = [];
  for (const cat of map.values()) {
    if (cat.parent_id && map.has(cat.parent_id)) {
      map.get(cat.parent_id)!.children.push(cat);
    } else {
      roots.push(cat);
    }
  }

  return roots;
}

// ---------- Products with Variants ----------

export interface ProductWithVariants extends Product {
  material_type_id: string | null;
  sku: string | null;
  dimensions: { width_mm: number; thickness_mm: number } | null;
  variants_count: number;
  starting_price_cents: number;
}

export async function getActiveProductsWithVariants(options?: {
  categorySlug?: string;
  materialTypeId?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  page?: number;
  perPage?: number;
}): Promise<{ products: ProductWithVariants[]; total: number }> {
  const supabase = await createClient();
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  // Resolve category slug to id
  let categoryId: string | undefined;
  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (cat) categoryId = cat.id;
  }

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .is("deleted_at", null);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (options?.materialTypeId) query = query.eq("material_type_id", options.materialTypeId);
  if (options?.search) query = query.ilike("name->en", `%${options.search}%`);

  switch (options?.sort) {
    case "price_asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_cents", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name->en", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data: rawProducts, count } = await query;
  const products = (rawProducts ?? []) as (Product & {
    material_type_id?: string | null;
    sku?: string | null;
    dimensions?: { width_mm: number; thickness_mm: number } | null;
  })[];

  if (products.length === 0) {
    return { products: [], total: count ?? 0 };
  }

  // Fetch variant info for these products
  const productIds = products.map((p) => p.id);
  const { data: variants } = await supabase
    .from("product_variants")
    .select("product_id, price_cents")
    .in("product_id", productIds)
    .eq("is_active", true);

  // Build variant aggregates
  const variantMap = new Map<string, { count: number; minPrice: number }>();
  if (variants) {
    for (const v of variants) {
      const existing = variantMap.get(v.product_id);
      if (existing) {
        existing.count += 1;
        existing.minPrice = Math.min(existing.minPrice, v.price_cents);
      } else {
        variantMap.set(v.product_id, { count: 1, minPrice: v.price_cents });
      }
    }
  }

  const enriched: ProductWithVariants[] = products.map((p) => {
    const variantInfo = variantMap.get(p.id);
    return {
      ...p,
      material_type_id: p.material_type_id ?? null,
      sku: p.sku ?? null,
      dimensions: p.dimensions ?? null,
      variants_count: variantInfo?.count ?? 0,
      starting_price_cents: variantInfo?.minPrice ?? p.price_cents,
    };
  });

  return { products: enriched, total: count ?? 0 };
}

// ---------- Product with Full Detail ----------

export async function getProductWithVariants(slug: string): Promise<{
  product: Product & { material_type_id: string | null; sku: string | null; dimensions: Record<string, unknown> | null };
  variants: ProductVariant[];
  bulkPricing: BulkPricing[];
  relatedProducts: Product[];
} | null> {
  const supabase = await createClient();

  const { data: rawProduct } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .single();

  if (!rawProduct) return null;

  const product = rawProduct as Product & {
    material_type_id: string | null;
    sku: string | null;
    dimensions: Record<string, unknown> | null;
  };

  // Fetch variants, bulk pricing, and relations in parallel
  const [variantsResult, bulkPricingResult, relationsResult] = await Promise.all([
    supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("bulk_pricing")
      .select("*")
      .or(`product_id.eq.${product.id},variant_id.is.null`)
      .order("min_quantity"),
    supabase
      .from("product_relations")
      .select("related_product_id")
      .eq("product_id", product.id),
  ]);

  const variants = (variantsResult.data as ProductVariant[]) ?? [];
  const bulkPricing = (bulkPricingResult.data as BulkPricing[]) ?? [];

  // Fetch related products
  let relatedProducts: Product[] = [];
  const relatedIds = (relationsResult.data ?? []).map(
    (r: { related_product_id: string }) => r.related_product_id
  );
  if (relatedIds.length > 0) {
    const { data: related } = await supabase
      .from("products")
      .select("*")
      .in("id", relatedIds)
      .eq("is_active", true)
      .is("deleted_at", null);
    relatedProducts = (related as Product[]) ?? [];
  }

  return { product, variants, bulkPricing, relatedProducts };
}

// ---------- Kits ----------

export async function getActiveKits(): Promise<
  (Kit & { components: KitComponentWithProduct[]; material?: MaterialType })[]
> {
  const supabase = await createClient();

  const { data: rawKits } = await supabase
    .from("kits")
    .select("*")
    .eq("is_active", true)
    .order("display_order");

  const kits = (rawKits as Kit[]) ?? [];
  if (kits.length === 0) return [];

  // Fetch all kit components
  const kitIds = kits.map((k) => k.id);
  const { data: rawComponents } = await supabase
    .from("kit_components")
    .select("*")
    .in("kit_id", kitIds)
    .order("display_order");

  const components = (rawComponents as KitComponentWithProduct[]) ?? [];

  // Fetch products and variants for components
  const productIds = [...new Set(components.filter((c) => c.product_id).map((c) => c.product_id!))];
  const variantIds = [...new Set(components.filter((c) => c.variant_id).map((c) => c.variant_id!))];

  const [productsResult, variantsResult] = await Promise.all([
    productIds.length > 0
      ? supabase.from("products").select("*").in("id", productIds)
      : Promise.resolve({ data: [] }),
    variantIds.length > 0
      ? supabase.from("product_variants").select("*").in("id", variantIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map<string, Product>();
  for (const p of (productsResult.data ?? []) as Product[]) {
    productMap.set(p.id, p);
  }
  const variantMap = new Map<string, ProductVariant>();
  for (const v of (variantsResult.data ?? []) as ProductVariant[]) {
    variantMap.set(v.id, v);
  }

  // Fetch materials for kits that have material_type_id
  const materialIds = [...new Set(kits.filter((k) => k.material_type_id).map((k) => k.material_type_id!))];
  const materialMap = new Map<string, MaterialType>();
  if (materialIds.length > 0) {
    const { data: materials } = await supabase
      .from("material_types")
      .select("*")
      .in("id", materialIds);
    for (const m of (materials ?? []) as MaterialType[]) {
      materialMap.set(m.id, m);
    }
  }

  // Assemble kits with components
  return kits.map((kit) => {
    const kitComponents = components
      .filter((c) => c.kit_id === kit.id)
      .map((c) => ({
        ...c,
        product: c.product_id ? productMap.get(c.product_id) : undefined,
        variant: c.variant_id ? variantMap.get(c.variant_id) : undefined,
      }));
    return {
      ...kit,
      components: kitComponents,
      material: kit.material_type_id ? materialMap.get(kit.material_type_id) : undefined,
    };
  });
}

export async function getKitBySlug(
  slug: string
): Promise<(Kit & { components: KitComponentWithProduct[]; material?: MaterialType }) | null> {
  const supabase = await createClient();

  const { data: rawKit } = await supabase
    .from("kits")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!rawKit) return null;
  const kit = rawKit as Kit;

  // Fetch components
  const { data: rawComponents } = await supabase
    .from("kit_components")
    .select("*")
    .eq("kit_id", kit.id)
    .order("display_order");

  const components = (rawComponents as KitComponentWithProduct[]) ?? [];

  // Fetch products and variants
  const productIds = [...new Set(components.filter((c) => c.product_id).map((c) => c.product_id!))];
  const variantIds = [...new Set(components.filter((c) => c.variant_id).map((c) => c.variant_id!))];

  const [productsResult, variantsResult] = await Promise.all([
    productIds.length > 0
      ? supabase.from("products").select("*").in("id", productIds)
      : Promise.resolve({ data: [] }),
    variantIds.length > 0
      ? supabase.from("product_variants").select("*").in("id", variantIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map<string, Product>();
  for (const p of (productsResult.data ?? []) as Product[]) {
    productMap.set(p.id, p);
  }
  const variantMap = new Map<string, ProductVariant>();
  for (const v of (variantsResult.data ?? []) as ProductVariant[]) {
    variantMap.set(v.id, v);
  }

  const kitComponents = components.map((c) => ({
    ...c,
    product: c.product_id ? productMap.get(c.product_id) : undefined,
    variant: c.variant_id ? variantMap.get(c.variant_id) : undefined,
  }));

  // Fetch material
  let material: MaterialType | undefined;
  if (kit.material_type_id) {
    const { data: mat } = await supabase
      .from("material_types")
      .select("*")
      .eq("id", kit.material_type_id)
      .single();
    if (mat) material = mat as MaterialType;
  }

  return { ...kit, components: kitComponents, material };
}
