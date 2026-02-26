# Build 25 — Materials Shop: Product Detail & Variants

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 24
> **Context Files:** Build 03 schema (products, variants, bulk_pricing, product_relations)

---

## Objective

Build the product detail page with image gallery, variant selector, bulk pricing tiers, stock display, add-to-cart, and cross-sell recommendations. This is where shop customers make their purchase decision.

---

## Tasks

### 1. Product Detail Page

**`src/app/(public)/products/[category]/[slug]/page.tsx`**

```
┌─ Breadcrumbs: Shop > Deck Boards > Treated Pine > SA Pine 22×108mm ──┐
│                                                                         │
│  ┌─ Image Gallery ──────────┐  ┌─ Product Info ─────────────────────┐ │
│  │                          │  │                                     │ │
│  │  [Large primary image]   │  │  SA Pine CCA 22×108mm Deck Board  │ │
│  │                          │  │  SKU: DL-PB-22108                  │ │
│  │                          │  │                                     │ │
│  │                          │  │  Standard profile deck board,       │ │
│  │  [thumb] [thumb] [thumb] │  │  CCA H3 treated for outdoor use.   │ │
│  │                          │  │                                     │ │
│  └──────────────────────────┘  │  ✅ In Stock (45 available)        │ │
│                                │                                     │ │
│                                │  Features:                          │ │
│                                │  • CCA H3 Treated                   │ │
│                                │  • FSC Certified                    │ │
│                                │                                     │ │
│                                │  ┌─ Select Length ────────────────┐ │ │
│                                │  │ ( ) 2.4m — R85.00             │ │ │
│                                │  │ (●) 3.0m — R106.00            │ │ │
│                                │  │ ( ) 3.6m — R127.00            │ │ │
│                                │  │ ( ) 4.8m — R169.00            │ │ │
│                                │  └────────────────────────────────┘ │ │
│                                │                                     │ │
│                                │  Qty: [▼ 10 ▲]                     │ │
│                                │                                     │ │
│                                │  ┌─ Bulk Pricing ────────────────┐ │ │
│                                │  │ 10+ boards: 5% off            │ │ │
│                                │  │ 50+ boards: 10% off  ← active │ │ │
│                                │  │ 100+ boards: 15% off          │ │ │
│                                │  └────────────────────────────────┘ │ │
│                                │                                     │ │
│                                │  Unit price: R106.00                │ │
│                                │  Qty discount: -5%                  │ │
│                                │  Your price: R100.70 each           │ │
│                                │  Line total: R1,007.00              │ │
│                                │                                     │ │
│                                │  [🛒 Add to Cart]                   │ │
│                                │                                     │ │
│                                └─────────────────────────────────────┘ │
│                                                                         │
├─ Full Description ──────────────────────────────────────────────────────┤
│                                                                         │
│  [Localized long description — rendered as markdown or rich text]      │
│                                                                         │
├─ Specifications ────────────────────────────────────────────────────────┤
│                                                                         │
│  Dimensions:      22mm × 108mm                                         │
│  Material:        SA Pine CCA H3                                       │
│  Durability:      ⭐⭐⭐ (10-15 year lifespan)                         │
│  Maintenance:     Medium                                                │
│  Stainable:       Yes                                                   │
│  Weight:          4.2 kg (3.0m length)                                 │
│                                                                         │
├─ Frequently Bought Together ────────────────────────────────────────────┤
│                                                                         │
│  [Product Card]  [Product Card]  [Product Card]                        │
│  50mm Screws     Board Spacers   Walnut Stain 5L                      │
│                                                                         │
│  [Add All 3 to Cart — R425]                                            │
│                                                                         │
├─ You May Also Like ─────────────────────────────────────────────────────┤
│                                                                         │
│  [Product Card]  [Product Card]  [Product Card]  [Product Card]        │
│  SA Pine 32×114  Balau 19×90     Garapa 19×140   Composite 22×140     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Image Gallery

**`src/components/shop/image-gallery.tsx`**

- Large primary image display
- Thumbnail strip below (click to switch)
- Image zoom on hover (desktop) or tap (mobile)
- Swipe on mobile to change image
- Alt text from images JSONB (localized)
- Fallback image if no images uploaded

### 3. Variant Selector

**`src/components/shop/variant-selector.tsx`**

Renders differently based on variant_type:

**Length variants** (most common for deck boards):
- Radio button list with label + price per option
- Highlight default variant
- Show stock per variant if stock differs

**Colour variants** (for composite boards, stains):
- Colour swatch circles (like finish picker)
- Selected swatch highlighted
- Price per variant (may differ)

**Size/Volume variants** (for stain tins):
- Radio buttons: "1L — R65" / "5L — R295" / "20L — R1,050"

Selecting a variant updates:
- Price display
- Stock display
- SKU suffix shown
- Weight shown (if per-variant)

### 4. Quantity Input + Bulk Pricing

**Quantity selector:**
- Number input with +/- buttons
- Min: 1, Max: stock_quantity (or 999 for made_to_order)
- Keyboard input allowed

**Bulk pricing display:**
- Fetch bulk_pricing tiers for product
- Show tiers as a list
- Highlight the active tier based on current quantity
- Recalculate displayed price when quantity changes

**Price calculation:**
```typescript
function getEffectivePrice(unitPrice: number, qty: number, tiers: BulkTier[]): number {
  // Find highest tier the quantity qualifies for
  const activeTier = tiers
    .filter(t => qty >= t.min_quantity)
    .sort((a, b) => b.min_quantity - a.min_quantity)[0]
  
  if (!activeTier) return unitPrice
  return Math.ceil(unitPrice * (1 - activeTier.discount_percent / 100))
}
```

Show:
- Unit price (before discount)
- Quantity discount (if applicable): "−5%"
- Your price: effective price per unit
- Line total: effective price × quantity

### 5. Add to Cart

"Add to Cart" button:
- Requires variant selection (if product has variants)
- Requires quantity ≥ 1
- Creates a shop cart item:

```typescript
interface ShopCartItem {
  type: 'shop'
  id: string                        // nanoid
  product_id: string
  variant_id: string | null
  product_name: LocalizedString
  variant_label: LocalizedString | null
  sku: string
  image_url: string | null
  quantity: number
  unit_price_cents: number          // after bulk discount
  line_total_cents: number
}
```

- Toast: "Added to cart"
- Cart icon in header updates count
- "Continue shopping" implicit (stays on page)
- "View cart" link in toast

### 6. Stock Display

Show stock status prominently:
- **In stock:** "✅ In Stock (45 available)" — green
- **Low stock:** "⚠️ Low Stock — only 3 left" — amber
- **Out of stock:** "🔴 Out of Stock" — red, disable Add to Cart button
- **Made to order:** "📦 Made to Order — 2-3 week lead time" — blue

If a variant is selected, show variant-specific stock.

### 7. Frequently Bought Together

Fetch from product_relations where relation_type = 'frequently_bought_together':
- Show as mini product cards (image + name + price)
- "Add All to Cart" button: adds all related products with default variants and qty 1
- Maximum 3 shown

### 8. You May Also Like

Products in the same category, excluding current product:
- 4 cards in a horizontal scroll
- Same product card component from Build 24

### 9. SEO

- Dynamic meta title: "{Product Name} | The Deck Lab"
- Meta description from short_description
- Open Graph image: primary product image
- JSON-LD Product structured data:
  ```json
  {
    "@type": "Product",
    "name": "...",
    "image": "...",
    "description": "...",
    "sku": "...",
    "offers": {
      "@type": "Offer",
      "price": "85.00",
      "priceCurrency": "ZAR",
      "availability": "InStock"
    }
  }
  ```
- Breadcrumb structured data

### 10. Localization

```json
"product": {
  "sku": "SKU",
  "selectLength": "Select Length",
  "selectColour": "Select Colour",
  "selectSize": "Select Size",
  "qty": "Qty",
  "bulkPricing": "Bulk Pricing",
  "bulkTier": "{qty}+ : {percent}% off",
  "unitPrice": "Unit price",
  "qtyDiscount": "Qty discount",
  "yourPrice": "Your price",
  "lineTotal": "Line total",
  "each": "each",
  "addToCart": "Add to Cart",
  "addedToCart": "Added to cart",
  "viewCart": "View cart",
  "inStock": "In Stock",
  "inStockCount": "In Stock ({count} available)",
  "lowStock": "Low Stock — only {count} left",
  "outOfStock": "Out of Stock",
  "madeToOrder": "Made to Order — 2-3 week lead time",
  "description": "Description",
  "specifications": "Specifications",
  "dimensions": "Dimensions",
  "material": "Material",
  "durability": "Durability",
  "maintenance": "Maintenance",
  "lifespan": "Lifespan",
  "weight": "Weight",
  "frequentlyBoughtTogether": "Frequently Bought Together",
  "addAllToCart": "Add All {count} to Cart",
  "youMayAlsoLike": "You May Also Like",
  "requestSample": "Request a free sample"
}
```

---

## Acceptance Criteria

```
✅ Product detail page renders with image gallery, info, variant selector
✅ Image gallery: large image + thumbnails, swipe on mobile
✅ Variant selector: length radio buttons with prices
✅ Variant selector: colour swatches for composite/stain products
✅ Selecting a variant updates price, stock, and SKU display
✅ Quantity input with +/- and keyboard entry
✅ Bulk pricing tiers display and highlight active tier
✅ Price calculation: unit price × quantity with bulk discount applied
✅ Add to Cart creates shop cart item with correct data
✅ Add to Cart disabled when out of stock
✅ Stock status displays correctly per variant
✅ Frequently Bought Together shows related products
✅ "Add All to Cart" adds all related products at once
✅ You May Also Like shows category-related products
✅ Full description renders below the fold
✅ Specifications table shows product attributes
✅ SEO: meta tags, JSON-LD Product, breadcrumbs
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: image gallery swipes, layout stacks
```

---

## Notes for Claude Code

- The variant selector is the key interactive piece. For deck boards, it's always length variants. For stain, it's volume. For composite, it could be both colour AND length — handle multi-dimensional variants by showing two selectors.
- Bulk pricing applies to the PRODUCT level (not per variant). If a customer buys 10 boards of 3.0m, the 10+ tier applies.
- The "Add All to Cart" for frequently bought together should add each product separately (not as a bundle). Each gets its own cart line item.
- Product page should be a Server Component for SEO, with client components for variant selection and cart interaction.
- Images JSONB: `[{url, alt: {en, af}, is_primary}]` — sort by is_primary first, then array order.
