# Build 14 — Admin: Kits & Bundles

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 13
> **Context Files:** Build 03 schema (kits, kit_components)

---

## Objective

Build the admin interface for creating and managing kits/bundles — pre-assembled collections of products sold together at a bundle discount. E.g., "10m² Pine Deck Starter Kit" containing boards, joists, screws, spacers, and tape.

---

## Tasks

### 1. Kits List Page

**`src/app/(admin)/admin/kits/page.tsx`**

Table view:

| Image | Name (EN) | Category | Components | Base Price | Discount | Active | Actions |
|-------|-----------|----------|------------|-----------|----------|--------|---------|
| 📷 | 10m² Pine Starter Kit | Kits | 6 items | R8,500 | 10% | ✅ | Edit / Duplicate / Delete |

### 2. Kit Builder (Create/Edit)

**`src/app/(admin)/admin/kits/[id]/page.tsx`**

**Kit Info:**
- Name: LocalizedInput (EN/AF)
- Slug: auto-generated
- Description: LocalizedTextarea (EN/AF)
- Short description: LocalizedTextarea (EN/AF)
- Image: media picker
- Category: select (optional — can be in "Kits & Bundles" or a specific category)
- Bundle discount: percentage input
- Is featured: toggle
- Is active: toggle

**Component Builder:**

Interactive component selector:

```
Components in this kit:
+------+-----------------------------+---------+-----+--------+
| #    | Product / Variant           | SKU     | Qty | Price  |
+------+-----------------------------+---------+-----+--------+
| 1    | SA Pine 22×108 / 3.6m      | DL-..   | 28  | R355.60|
| 2    | Pine Joist 38×114 / 3.0m   | DL-..   | 8   | R164.80|
| 3    | 50mm Stainless Screws       | DL-..   | 4   | R340.00|
| 4    | Board Spacers (50 pack)     | DL-..   | 1   | R85.00 |
| 5    | Joist Tape (20m)            | DL-..   | 1   | R55.00 |
| 6    | Clear Seal Stain 5L         | DL-..   | 2   | R590.00|
+------+-----------------------------+---------+-----+--------+
                              Subtotal:         R1,590.40
                              Bundle Discount (10%):  -R159.04
                              Kit Price:         R1,431.36
```

- "Add Component" button → product search dialog
  - Search by name or SKU
  - If product has variants, show variant selector
  - Set quantity
- Remove component button
- Quantity inline editable
- Auto-calculates:
  - Subtotal: sum of (component price × quantity)
  - Discount: subtotal × bundle_discount_percent
  - Kit price: subtotal - discount → stored as base_price_cents

### 3. Kit Price Auto-Calculation

The `base_price_cents` on the kit is auto-calculated when:
- A component is added/removed
- A component quantity changes
- The bundle discount % changes
- A component product's price changes (this is an edge case — handle with a "Recalculate" button)

Store `base_price_cents` as a cached value. Show a warning if component prices have changed since last calculation.

### 4. Kit Duplication

Same as product duplication:
- Copies all components and quantities
- Appends " (Copy)" to English name
- Inactive by default

---

## Acceptance Criteria

```
✅ Kits list shows all kits with component count and calculated price
✅ Kit builder: add components by searching products
✅ Kit builder: variant selection works for products with variants
✅ Kit builder: quantity is editable per component
✅ Kit builder: remove components works
✅ Price auto-calculates: subtotal, discount, kit price
✅ Bundle discount applies correctly
✅ Kit duplication works
✅ Localized name/description fields with EN/AF inputs
✅ Empty state: "No kits yet — create your first bundle"
✅ Delete kit with confirmation
```

---

## Notes for Claude Code

- Kits are essentially shopping lists with a discount — they don't have their own stock. Stock is tracked at the product/variant level.
- When a kit is purchased, each component product's stock should decrement by the component quantity × order quantity.
- The component search should be fast — debounced API call that searches products by name or SKU
- Kit price recalculation should happen client-side (all component prices are already loaded)
- The "Kits & Bundles" category is optional — kits can exist without a category, or be assigned to any category
