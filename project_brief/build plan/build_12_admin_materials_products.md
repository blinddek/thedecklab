# Build 12 — Admin: Material & Product Management

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 11
> **Context Files:** Build 03 schema (materials, products, variants), YOROS_I18N_DARKMODE_STANDARD.md

---

## Objective

Build admin CRUD pages for material types, product categories, and products with variants. This is the core data management for the materials shop. All public-facing text fields show dual EN/AF inputs.

---

## Tasks

### 1. Materials Page

**`src/app/(admin)/admin/materials/page.tsx`**

Table view of material_types:

| Name (EN) | Slug | Durability | Maintenance | Stainable | Composite | Active | Actions |
|-----------|------|------------|-------------|-----------|-----------|--------|---------|
| SA Pine CCA | sa-pine-cca | ⭐⭐⭐ | Medium | ✅ | ❌ | ✅ | Edit / Delete |

**Create/Edit dialog:**
- Name: two inputs — "English" and "Afrikaans" (side by side)
- Slug: auto-generated from English name, editable
- Description: two textareas — "English" and "Afrikaans"
- Image URL: text input + media library picker button
- Durability rating: 1–5 star selector
- Maintenance level: select (low / medium / high)
- Lifespan years: text input ("15-20")
- Is stainable: checkbox
- Is composite: checkbox
- Display order: number input
- Is active: toggle

**Localized field pattern (reuse everywhere):**
```tsx
// src/components/admin/localized-input.tsx
<LocalizedInput
  label="Name"
  value={name}  // {en: "...", af: "..."}
  onChange={setName}
  required
/>
// Renders two inputs stacked or side-by-side:
// [🇬🇧 English] [text input for en]
// [🇿🇦 Afrikaans] [text input for af]
```

```tsx
// src/components/admin/localized-textarea.tsx
<LocalizedTextarea
  label="Description"
  value={description}
  onChange={setDescription}
/>
```

### 2. Product Categories Page

**`src/app/(admin)/admin/materials/categories/page.tsx`** (sub-route of materials)

Or alternatively a tab within the materials page.

Tree view showing hierarchy:
```
Deck Boards
  ├── Treated Pine
  ├── Balau
  ├── Garapa
  └── Composite
Substructure
  ├── Joists
  ├── Bearers
  └── Posts & Brackets
...
```

**Create/Edit dialog:**
- Name: LocalizedInput (EN/AF)
- Slug: auto-generated
- Description: LocalizedTextarea (EN/AF)
- Parent category: select (top-level or child of existing)
- Image URL: text input + media picker
- Display order: number
- Is active: toggle

### 3. Products List Page

**`src/app/(admin)/admin/products/page.tsx`**

Table with filters:

| Image | Name (EN) | SKU | Category | Material | Base Price | Stock | Active | Actions |
|-------|-----------|-----|----------|----------|-----------|-------|--------|---------|
| 📷 | SA Pine 22×108 | DL-PB-22108 | Deck Boards > Pine | SA Pine CCA | R85.00 | 45 | ✅ | Edit / Variants / Delete |

**Filters:**
- Category (select with hierarchy)
- Material type (select)
- Stock status (in_stock / low_stock / out_of_stock / made_to_order)
- Active / inactive
- Search by name or SKU

**Pagination:** 20 per page

### 4. Product Create/Edit Page

**`src/app/(admin)/admin/products/[id]/page.tsx`** (or dialog)

**Basic Info tab:**
- Name: LocalizedInput (EN/AF)
- Slug: auto-generated from English name
- SKU: text input (unique)
- Category: hierarchical select
- Material type: select (optional)
- Short description: LocalizedTextarea (EN/AF)
- Description: LocalizedTextarea (EN/AF)
- Dimensions: text input ("38mm × 114mm × 3.0m")
- Weight: number input (kg)

**Pricing tab:**
- Base price: number input (Rands — converted to cents on save)
- Cost price: number input (admin only — supplier cost)
- Show calculated margin: `(base_price - cost_price) / base_price × 100`%

**Stock tab:**
- Stock quantity: number input
- Low stock threshold: number input
- Stock status: select (auto-calculated or manual override)

**Images tab:**
- Image gallery with upload, reorder, set primary, add alt text (EN/AF)
- Upload to Supabase Storage → store in images JSONB

**Features tab:**
- Add/remove feature tags
- Each feature: LocalizedInput (EN/AF)
- Stored as JSONB array of LocalizedStrings

**Related products tab:**
- Search and add related products (cross-sell)
- Display order per relation

**Settings tab:**
- Is featured: toggle
- Is active: toggle
- Display order: number

### 5. Product Variants Section

Within the product edit page, a "Variants" tab:

**Variants table:**
| Label (EN) | Type | SKU Suffix | Price | Cost | Stock | Default | Active | Actions |
|-----------|------|------------|-------|------|-------|---------|--------|---------|
| 2.4m | length | -2400 | R85.00 | R51.00 | 12 | ❌ | ✅ | Edit / Delete |
| 3.0m | length | -3000 | R106.00 | R63.60 | 8 | ✅ | ✅ | Edit / Delete |

**Add variant dialog:**
- Label: LocalizedInput (EN/AF) — often the same in both languages (e.g., "3.0m")
- Type: select (length / colour / size / volume)
- SKU suffix: text input
- Price: number input (Rands)
- Cost price: number input
- Stock quantity: number
- Weight: number (kg, optional)
- Is default: radio (one per product)
- Is active: toggle

### 6. Bulk Pricing Section

Within the product edit page, a "Bulk Pricing" tab:

**Discount tiers table:**
| Min Quantity | Discount % | Actions |
|-------------|-----------|---------|
| 10 | 5.00% | Edit / Delete |
| 50 | 10.00% | Edit / Delete |

Add tier: min_quantity + discount_percent.

### 7. Reusable Admin Components

Create these shared components in `src/components/admin/`:

- `LocalizedInput` — dual EN/AF text input
- `LocalizedTextarea` — dual EN/AF textarea
- `MediaPicker` — button that opens media library dialog, returns URL
- `PriceInput` — formats input as Rands, stores as cents
- `SlugInput` — auto-generates from English name, toggleable manual edit
- `ConfirmDialog` — "Are you sure?" for deletes
- `StatusBadge` — coloured badge for active/inactive/stock status
- `DataTable` — wrapper around shadcn Table with sorting, pagination, search

---

## Acceptance Criteria

```
✅ Material types CRUD: create, read, update, delete, toggle active
✅ Product categories CRUD with hierarchical parent-child display
✅ Products CRUD with all fields including LocalizedString inputs
✅ Product variants CRUD within product edit
✅ Bulk pricing tiers CRUD within product edit
✅ Images upload and display correctly, primary can be set
✅ Slug auto-generates from English name
✅ SKU uniqueness enforced
✅ Price inputs show Rands, store as cents
✅ Margin calculation displays correctly
✅ Stock status updates based on quantity vs threshold
✅ Related products can be added/removed
✅ LocalizedInput shows EN and AF fields, AF can be empty (falls back to EN)
✅ Delete operations have confirmation dialogs
✅ Toast notifications on all CRUD operations
✅ Empty states on all lists
✅ Search and filter work on products list
```

---

## Notes for Claude Code

- The `LocalizedInput` and `LocalizedTextarea` components are the KEY reusable pattern — every admin page that manages public-facing content uses them. Get these right and every subsequent build is faster.
- Price fields: display as Rands (R 85.00) in the UI, store as cents (8500) in the database. The `PriceInput` component handles this conversion.
- Slug generation: use a slugify function that lowercases, replaces spaces with hyphens, strips special characters. Always from the English name.
- The images JSONB on products stores: `[{url: "...", alt: {en: "...", af: "..."}, is_primary: true}]`
- features JSONB stores: `[{en: "CCA H3 Treated", af: "CCA H3 Behandel"}, ...]`
- All mutations should log to activity_log (entity_type: 'product', action: 'create'/'update'/'delete')
- Cost price fields are visible in admin but NEVER exposed in public API queries
