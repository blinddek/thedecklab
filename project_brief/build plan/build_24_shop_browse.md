# Build 24 — Materials Shop: Category & Product Browse

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 08 (seed data), Build 09 (pricing)
> **Context Files:** PROJECT_BRIEF.md §4 (Materials Shop), Build 03 schema
> **Reuse from Blindly:** ❌ 0% — Blindly has no shop

---

## Objective

Build the public-facing materials shop: category grid, product listings with filters/sort/pagination, and the hierarchical category navigation. This is a traditional e-commerce browse experience alongside the configurator.

---

## Tasks

### 1. Shop Landing Page

**`src/app/(public)/products/page.tsx`**

Hero section + category grid:

```
┌─ Materials Shop ─────────────────────────────────────────────────┐
│                                                                   │
│  Everything you need to build or maintain your deck.             │
│  Premium materials, delivered nationwide.                         │
│                                                                   │
├─ Shop by Category ───────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  [image]     │  │  [image]     │  │  [image]     │           │
│  │  Deck Boards │  │  Substructure│  │  Fixings     │           │
│  │  42 products │  │  18 products │  │  12 products │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │  [image]     │  │  [image]     │                              │
│  │  Finishing   │  │  Kits &      │                              │
│  │  8 products  │  │  Bundles     │                              │
│  └──────────────┘  └──────────────┘                              │
│                                                                   │
├─ Featured Products ──────────────────────────────────────────────┤
│                                                                   │
│  [Product Card] [Product Card] [Product Card] [Product Card]    │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Category cards:**
- Image (from product_categories.image_url or fallback)
- Localized name
- Product count (active products in category + subcategories)
- Click → category listing page

**Featured products:**
- Query products where is_featured = true
- Display as product cards (see §3)
- Horizontal scroll on mobile, grid on desktop

### 2. Category Listing Page

**`src/app/(public)/products/[category]/page.tsx`**

Accepts top-level or sub-category slug.

```
┌─ Breadcrumbs: Shop > Deck Boards > Treated Pine ─────────────────┐
│                                                                     │
├─ Sidebar (desktop) ─┬─ Product Grid ─────────────────────────────┤
│                      │                                             │
│  Categories          │  ┌─ Filters & Sort ────────────────────┐  │
│  ☐ Deck Boards       │  │ Material: [All ▼]  Sort: [Price ▼]  │  │
│    ► Treated Pine ◄  │  │ Stock: [In stock only ☐]            │  │
│      Balau            │  └─────────────────────────────────────┘  │
│      Garapa           │                                             │
│      Composite        │  [Product] [Product] [Product]             │
│  ☐ Substructure       │  [Product] [Product] [Product]             │
│  ☐ Fixings            │  [Product] [Product] [Product]             │
│  ☐ Finishing          │                                             │
│  ☐ Kits & Bundles     │  Showing 1–9 of 24  [1] [2] [3] [→]     │
│                      │                                             │
└──────────────────────┴─────────────────────────────────────────────┘
```

**Sidebar category navigation:**
- Hierarchical tree with expand/collapse
- Current category highlighted
- Product count per category
- Collapsible on mobile (becomes a dropdown or sheet)

**Filters:**
- Material type (select from material_types)
- Stock status (in stock / all)
- Price range (min/max — optional, stretch goal)

**Sort options:**
- Price: low to high
- Price: high to low
- Name: A–Z
- Newest first
- Featured first (default)

**Pagination:**
- 12 products per page (3×4 grid desktop, 2×N mobile)
- Page numbers + previous/next
- URL query params: `?page=2&sort=price_asc&material=sa-pine-cca`

### 3. Product Card Component

**`src/components/shop/product-card.tsx`**

Reusable card used everywhere (shop grid, featured, cross-sell, search results):

```
┌─────────────────────────┐
│  [Primary image]        │
│                         │
│  SA Pine 22×108mm       │
│  Deck Board             │
│                         │
│  ⭐⭐⭐ Durability       │
│  From R85.00            │
│                         │
│  ✅ In Stock             │
│                         │
│  [Add to Cart]          │
└─────────────────────────┘
```

**Card content:**
- Primary image (from images JSONB, first with is_primary=true)
- Localized name
- Localized short_description (truncated to 2 lines)
- Material type badge (if applicable)
- Starting price: base_price_cents or cheapest variant
- Stock status badge (green "In Stock", amber "Low Stock", red "Out of Stock")
- Featured badge (if is_featured)
- "Add to Cart" button (quick add with default variant — opens product page if has variants)
- Click anywhere else → product detail page

**Card variants:**
- Standard (grid view)
- Compact (list view — stretch goal)
- Mini (cross-sell, featured slider)

### 4. Search

**`src/components/shop/product-search.tsx`**

Search bar in the shop header:
- Debounced search (300ms)
- Searches product name (both EN and AF) and SKU
- Dropdown results: up to 5 products with thumbnail + name + price
- "View all results for '{query}'" link at bottom
- Search results page: same grid as category listing with search query applied

### 5. API Routes

Extend or create:

```
GET /api/shop/categories
  Returns: hierarchical category tree with product counts

GET /api/shop/products?category=deck-boards-pine&sort=price_asc&page=1&material=sa-pine-cca&in_stock=true
  Returns: paginated products with total count

GET /api/shop/search?q=pine+22
  Returns: up to 20 matching products
```

**Security:** These routes MUST exclude cost_price_cents from the response. Use explicit `.select()` columns.

### 6. Empty States

- No products in category: "No products in this category yet. Browse other categories →"
- No search results: "No products found for '{query}'. Try a different search term."
- Out of stock product: card shows "Out of Stock" badge, "Add to Cart" becomes "Notify Me" (stretch goal)

### 7. Localization

```json
"shop": {
  "title": "Materials Shop",
  "subtitle": "Everything you need to build or maintain your deck",
  "shopByCategory": "Shop by Category",
  "featuredProducts": "Featured Products",
  "products": "{count} products",
  "filters": {
    "material": "Material",
    "allMaterials": "All Materials",
    "stockFilter": "In stock only",
    "sort": "Sort by",
    "priceLowHigh": "Price: Low to High",
    "priceHighLow": "Price: High to Low",
    "nameAZ": "Name: A–Z",
    "newest": "Newest First",
    "featured": "Featured First"
  },
  "showing": "Showing {from}–{to} of {total}",
  "noProducts": "No products in this category yet",
  "noResults": "No products found for '{query}'",
  "browseOther": "Browse other categories",
  "addToCart": "Add to Cart",
  "fromPrice": "From",
  "search": {
    "placeholder": "Search products...",
    "viewAll": "View all results for '{query}'"
  }
}
```

### 8. SEO

- Category pages: dynamic meta title + description from product_categories
- Canonical URLs per page
- Breadcrumbs as structured data (JSON-LD BreadcrumbList)
- Product cards: no index individually (product detail pages handle SEO)

---

## Acceptance Criteria

```
✅ Shop landing shows category grid with images and product counts
✅ Featured products section shows is_featured products
✅ Category page shows hierarchical sidebar + product grid
✅ Subcategory filtering works (clicking subcategory shows only those products)
✅ Material filter works
✅ Stock filter works (in stock only toggle)
✅ Sort options work (price, name, newest, featured)
✅ Pagination works with URL query params
✅ Product cards show: image, name, price, stock status
✅ Product card "Add to Cart" works for products without variants
✅ Product card click navigates to product detail
✅ Search bar returns debounced results
✅ Search results page shows filtered product grid
✅ Empty states display correctly
✅ API routes exclude cost_price_cents
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: category grid 2-col, product grid 2-col, sidebar collapses
✅ Breadcrumbs render correctly for nested categories
```

---

## Notes for Claude Code

- The category sidebar is a key navigation pattern. Desktop: always visible. Mobile: collapsible or sheet. Consider using shadcn Sheet for mobile.
- Product counts per category should include subcategory products. "Deck Boards" count = pine + balau + garapa + composite counts.
- The "Add to Cart" button on cards should handle two cases: (1) product has no variants → add directly with default price, (2) product has variants → navigate to product detail page to select variant.
- Search should query JSONB name fields: `name->>'en' ILIKE '%query%' OR name->>'af' ILIKE '%query%' OR sku ILIKE '%query%'`
- Use Server Components for the initial page load (SEO), client components for filter interactions.
- Image fallback: if no image, show a placeholder with the material type colour or a generic deck board icon.
