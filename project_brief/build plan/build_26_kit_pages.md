# Build 26 — Materials Shop: Kit & Bundle Pages

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 25
> **Context Files:** Build 03 schema (kits, kit_components), Build 14 (admin kit builder)

---

## Objective

Build the public-facing kit pages: kit listing and kit detail with component breakdown, bundle pricing, and add-to-cart. Kits are pre-assembled collections (e.g., "10m² Pine Deck Starter Kit") sold at a bundle discount.

---

## Tasks

### 1. Kits Listing Page

**`src/app/(public)/kits/page.tsx`**

```
┌─ Kits & Bundles ─────────────────────────────────────────────────┐
│                                                                   │
│  Save time and money with our pre-assembled deck kits.           │
│  Everything you need in one package.                              │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │  [kit image]       │  │  [kit image]       │                  │
│  │                    │  │                    │                  │
│  │  10m² Pine Deck    │  │  15m² Composite    │                  │
│  │  Starter Kit       │  │  Deck Kit          │                  │
│  │                    │  │                    │                  │
│  │  6 items included  │  │  5 items included  │                  │
│  │  Save 10%          │  │  Save 8%           │                  │
│  │                    │  │                    │                  │
│  │  R8,500            │  │  R18,200           │                  │
│  │  ̶R̶9̶,̶4̶4̶4̶             │  │  ̶R̶1̶9̶,̶7̶8̶3̶            │                  │
│  │                    │  │                    │                  │
│  │  [View Kit]        │  │  [View Kit]        │                  │
│  └────────────────────┘  └────────────────────┘                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Kit cards show:**
- Kit image
- Localized name + short_description
- Component count ("6 items included")
- Bundle discount badge ("Save 10%")
- Kit price (base_price_cents)
- Strikethrough original price (sum of components without discount)
- "View Kit" button → kit detail

### 2. Kit Detail Page

**`src/app/(public)/kits/[slug]/page.tsx`**

```
┌─ Breadcrumbs: Shop > Kits & Bundles > 10m² Pine Deck Starter Kit ──┐
│                                                                       │
│  ┌─ Kit Image ─────────────┐  ┌─ Kit Info ─────────────────────────┐│
│  │                         │  │                                     ││
│  │  [Kit image or           │  │  10m² Pine Deck Starter Kit       ││
│  │   composed product       │  │                                     ││
│  │   images]                │  │  Everything you need for a 10m²    ││
│  │                         │  │  treated pine deck. Boards, joists, ││
│  │                         │  │  screws, spacers, tape, and stain.  ││
│  └─────────────────────────┘  │                                     ││
│                                │  Components:  6 items               ││
│                                │  Discount:    10%                    ││
│                                │                                     ││
│                                │  ̶R̶9̶,̶4̶4̶4̶  →  R8,500               ││
│                                │  You save: R944                     ││
│                                │                                     ││
│                                │  Qty: [▼ 1 ▲]                      ││
│                                │                                     ││
│                                │  [🛒 Add Kit to Cart]               ││
│                                │                                     ││
│                                └─────────────────────────────────────┘│
│                                                                       │
├─ What's Included ─────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────┬──────────────────────────────┬──────┬──────────┬────────────┐│
│  │ #  │ Product                      │ Qty  │ Unit     │ Subtotal   ││
│  ├────┼──────────────────────────────┼──────┼──────────┼────────────┤│
│  │ 1  │ SA Pine 22×108mm / 3.6m     │ × 28 │ R127.00  │ R3,556.00  ││
│  │ 2  │ Pine Joist 38×114mm / 3.0m  │ × 8  │ R206.00  │ R1,648.00  ││
│  │ 3  │ Pine Bearer 76×228mm / 3.0m │ × 2  │ R580.00  │ R1,160.00  ││
│  │ 4  │ 50mm Stainless Screws (200) │ × 4  │ R85.00   │ R340.00    ││
│  │ 5  │ Board Spacers (50 pack)     │ × 2  │ R45.00   │ R90.00     ││
│  │ 6  │ Clear Seal Stain 5L         │ × 2  │ R295.00  │ R590.00    ││
│  ├────┼──────────────────────────────┼──────┼──────────┼────────────┤│
│  │    │                              │      │ Subtotal │ R9,384.00  ││
│  │    │                              │      │ -10%     │ -R938.40   ││
│  │    │                              │      │ Kit Price│ R8,445.60  ││
│  └────┴──────────────────────────────┴──────┴──────────┴────────────┘│
│                                                                       │
│  Each product is clickable → product detail page                     │
│                                                                       │
├─ Buy Individual Components ───────────────────────────────────────────┤
│                                                                       │
│  Don't need the full kit? Buy components individually:               │
│  [Product Card] [Product Card] [Product Card] [Product Card]        │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 3. Kit Components Table

Fetch kit_components with joined product + variant data:

```typescript
const components = await supabase
  .from('kit_components')
  .select(`
    quantity,
    products(id, name, slug, base_price_cents, images),
    product_variants(id, variant_label, price_cents)
  `)
  .eq('kit_id', kit.id)
```

Show:
- Product name (localized) + variant label (localized)
- Quantity
- Unit price (variant price or product base price)
- Line subtotal
- Click product name → product detail page
- Totals: subtotal, discount, kit price

### 4. Kit Add to Cart

"Add Kit to Cart" creates a SINGLE cart item:

```typescript
interface KitCartItem {
  type: 'kit'
  id: string
  kit_id: string
  kit_name: LocalizedString
  kit_slug: string
  image_url: string | null
  quantity: number                    // kits purchased (usually 1)
  components: KitComponent[]         // snapshot of components
  bundle_discount_percent: number
  unit_price_cents: number            // kit price per kit
  line_total_cents: number
}
```

When the kit is ordered, the checkout (Build 29) creates individual shop_items for each component — stock is decremented per component product.

### 5. Kit vs Individual Comparison

Subtle messaging on the kit page:

```
💡 This kit saves you R944 compared to buying each item separately.
   That's like getting the screws and spacers free!
```

And on individual product pages, if that product appears in a kit:

```
💡 This product is included in the 10m² Pine Deck Starter Kit.
   Save 10% by buying the full kit →
```

### 6. Kit Stock Status

A kit is "in stock" only if ALL components are in stock in sufficient quantity:
- If any component is out of stock → kit shows "Partially out of stock"
- Show which component is missing
- Still allow add to cart (made-to-order components may come in)

### 7. Localization

```json
"kits": {
  "title": "Kits & Bundles",
  "subtitle": "Save time and money with our pre-assembled deck kits",
  "itemsIncluded": "{count} items included",
  "save": "Save {percent}%",
  "viewKit": "View Kit",
  "whatsIncluded": "What's Included",
  "product": "Product",
  "qty": "Qty",
  "unitPrice": "Unit Price",
  "subtotal": "Subtotal",
  "discount": "Bundle Discount",
  "kitPrice": "Kit Price",
  "youSave": "You save: R{amount}",
  "addKitToCart": "Add Kit to Cart",
  "buyIndividual": "Buy Individual Components",
  "buyIndividualPrompt": "Don't need the full kit? Buy components individually",
  "kitIncludes": "This product is included in the {kitName}",
  "saveByBuyingKit": "Save {percent}% by buying the full kit",
  "partiallyOutOfStock": "Partially out of stock",
  "componentUnavailable": "{product} is currently out of stock"
}
```

---

## Acceptance Criteria

```
✅ Kits listing shows all active kits with discount badge and pricing
✅ Strikethrough original price shows savings clearly
✅ Kit detail page shows component table with quantities and subtotals
✅ Component names link to individual product pages
✅ Kit pricing: subtotal → discount → kit price
✅ "Add Kit to Cart" creates a kit cart item
✅ Kit quantity adjustable
✅ Kit stock status checks all component availability
✅ "Partially out of stock" shown when components missing
✅ Individual component cards shown below for mix-and-match
✅ Cross-reference: product pages mention kit availability
✅ Savings messaging: "You save R944"
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: component table scrolls horizontally or stacks
```

---

## Notes for Claude Code

- Kit pricing is cached in kits.base_price_cents (calculated by admin in Build 14). The component breakdown on the public page recalculates from component prices to show the savings — these should match.
- A kit cart item is a single line in the cart. But at checkout, it explodes into individual shop_items (one per component) for stock tracking and order history.
- The "Buy Individual Components" section uses the same product card component from Build 24. It's just a filtered product list.
- Kit images: if the kit has a custom image, use it. If not, compose a grid of component product images (2×2 thumbnail grid).
