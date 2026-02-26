# Build 13 — Admin: Shop Products & Variants (Detail Polish)

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 12
> **Context Files:** Build 03 schema, Build 12 components

---

## Objective

Polish and extend the product management from Build 12 with advanced features: image gallery management with drag-and-drop reordering, stock management views, product duplication, and CSV export. Also add a dedicated stock dashboard and low-stock alerts.

This build is about making the product admin production-ready — Build 12 gets the CRUD working, Build 13 makes it efficient for day-to-day management.

---

## Tasks

### 1. Image Gallery Manager

Extend the product image upload from Build 12:

- Drag-and-drop reorder (images JSONB array order = display order)
- Click to set primary image
- Click to edit alt text (EN/AF LocalizedInput)
- Thumbnail preview in product list (first/primary image)
- Bulk upload: select multiple files at once
- Delete image with confirmation (removes from Storage + JSONB)

### 2. Stock Dashboard

**`src/app/(admin)/admin/products/stock/page.tsx`**

Overview of all stock:

| SKU | Product | Variant | Qty | Threshold | Status | Actions |
|-----|---------|---------|-----|-----------|--------|---------|
| DL-PB-22108-2400 | SA Pine 22×108 | 2.4m | 3 | 5 | ⚠️ Low | Quick edit |
| DL-PB-22108-3000 | SA Pine 22×108 | 3.0m | 0 | 5 | 🔴 Out | Quick edit |

- Sortable by status (out of stock first, then low stock)
- Filter by category, material
- Quick inline edit for quantity
- Bulk update: select multiple → set quantity
- Export to CSV

### 3. Low Stock Alerts

On the admin dashboard (Build 11), add:
- Alert banner when any products are out of stock or low stock
- Count of low-stock items in the dashboard stats
- Click → navigates to stock dashboard filtered to low stock

### 4. Product Duplication

"Duplicate" button on product list and edit page:
- Creates a copy of the product with all data (including variants, features, bulk pricing)
- Appends " (Copy)" to the English name
- Generates new slug and SKU
- Sets is_active = false (admin must review before publishing)
- Navigates to the new product's edit page

### 5. CSV Export

Export buttons on product list:
- **Export All Products** → CSV with: SKU, Name (EN), Category, Material, Base Price, Cost Price, Stock, Status
- **Export Stock Report** → CSV with: SKU, Name, Variant, Qty, Status
- **Export Price List** → CSV with: SKU, Name, Variant, Price (customer-facing only — no cost)

### 6. Product List Enhancements

Add to the product list from Build 12:
- Bulk select with checkboxes
- Bulk actions: activate, deactivate, delete (with confirmation)
- Column sorting (name, price, stock, date)
- Thumbnail column (primary image)
- Quick view: hover or click icon to see product summary without navigating away
- "No products" empty state with "Add your first product" CTA

### 7. Cross-sell / Related Products Improvements

In the product edit Related Products tab:
- Search products by name or SKU
- Show product thumbnail + name + price in search results
- Drag-and-drop reorder
- Display on both sides: if Product A relates to Product B, show on both edit pages
- "Frequently bought together" label with option to add custom relation types later

---

## Acceptance Criteria

```
✅ Image gallery supports drag-and-drop reorder
✅ Multiple images can be uploaded at once
✅ Primary image can be set, displayed in product list
✅ Stock dashboard shows all products/variants with stock status
✅ Quick inline stock edit works
✅ Low stock alert appears on admin dashboard
✅ Product duplication creates full copy with " (Copy)" suffix
✅ Duplicated product is inactive by default
✅ CSV export produces valid CSV for all three export types
✅ Bulk select and actions work (activate, deactivate, delete)
✅ Column sorting works on product list
✅ Cross-sell relations work bidirectionally
✅ Empty states display correctly on all lists
```

---

## Notes for Claude Code

- Image drag-and-drop: use a lightweight sortable library (e.g., @dnd-kit/sortable) or CSS-only approach
- Stock updates should log to activity_log
- CSV export: generate client-side using the data already fetched — no need for a server-side CSV endpoint
- The stock dashboard is a different VIEW of the same product_variants data — not a new table
- Keep the admin responsive but desktop-optimized — product management is primarily a desktop task
