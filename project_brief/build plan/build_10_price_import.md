# Build 10 — Price Import (CSV/XLS)

> **Type:** Backend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 07
> **Context Files:** TECHNICAL_DESIGN.md §4 (API Routes), products schema from Build 03
> **Reuse from Blindly:** 🔶 30% — import pattern reusable, much simpler than Blindly's XLS parser

---

## Objective

Build a price import system that lets admin update product prices and configurator rates from CSV or XLS files. This is intentionally simpler than Blindly's multi-sheet XLS parser — Deck Lab products are straightforward enough for CSV import with an optional XLS wrapper.

---

## Tasks

### 1. CSV Parser

Create `src/lib/import/csv-parser.ts`:

Accepts two CSV formats:

**Format A: Product Prices**
```csv
sku,cost_price_cents,base_price_cents
DL-PB-22108-2400,5100,8500
DL-PB-22108-3000,6360,10600
DL-PB-22108-3600,7620,12700
```

If `base_price_cents` is empty, auto-calculate from cost_price_cents using the markup cascade.

**Format B: Configurator Rates**
```csv
material_slug,rate_type,supplier_cost_cents,markup_percent
sa-pine-cca,boards_per_m2,42000,40
sa-pine-cca,substructure_per_m2,18000,40
balau,boards_per_m2,84000,35
```

`customer_price_cents` is auto-calculated: `ceil(supplier_cost_cents × (1 + markup_percent/100))`

### 2. XLS Wrapper

Create `src/lib/import/xls-parser.ts`:

Uses the `xlsx` library to read .xls/.xlsx files and convert each sheet to CSV format, then feeds into the CSV parser. Simple — no complex multi-format parsing like Blindly.

### 3. Import Logic

Create `src/lib/import/import-products.ts`:

```typescript
interface ImportResult {
  filename: string
  products_created: number
  products_updated: number
  products_unchanged: number
  errors: ImportError[]
}

interface ImportError {
  row: number
  sku: string
  message: string
}

async function importProductPrices(data: ParsedRow[], mode: ImportMode): Promise<ImportResult> {
  // For each row:
  // 1. Find product or variant by SKU
  // 2. Compare prices
  // 3. If changed: update cost_price_cents and/or base_price_cents
  // 4. If mode = 'add_new' and SKU not found: skip (don't create products via import)
  // 5. Log result
}
```

Import modes:
- `update_changed` — only update rows where price differs (default)
- `replace_all` — update all matched rows regardless of change
- `add_new` — same as update_changed but also creates new product entries (future use)

### 4. Import Rates Logic

Create `src/lib/import/import-rates.ts`:

```typescript
async function importConfiguratorRates(data: ParsedRow[]): Promise<ImportResult> {
  // For each row:
  // 1. Find material_type by slug
  // 2. Upsert configurator_rates by (material_type_id, rate_type)
  // 3. Auto-calculate customer_price_cents
}
```

### 5. API Route

Create `src/app/api/admin/import/route.ts`:

```typescript
// POST /api/admin/import
// Auth: admin only
// Body: FormData with file + import_type ('products' | 'rates') + import_mode
// Returns: ImportResult
```

### 6. Audit Trail

Each import creates a `price_imports` record with:
- filename
- supplier (optional)
- products_created, products_updated, products_unchanged counts
- import_mode
- imported_by (admin user ID)
- error_log (JSONB array of errors)

---

## Acceptance Criteria

```
✅ CSV with product SKUs + prices imports correctly
✅ CSV with configurator rates imports correctly
✅ XLS file with product sheet imports correctly (via XLS → CSV conversion)
✅ Import mode 'update_changed' only updates rows with different prices
✅ Customer price auto-calculates from supplier cost + markup
✅ Unknown SKUs are logged as errors, not created
✅ Import creates price_imports audit record
✅ Error log captures row-level failures
✅ API route requires admin auth
✅ Re-importing same file with no changes → 0 updated, all unchanged
```

---

## Notes for Claude Code

- This is MUCH simpler than Blindly's import system — no complex sheet detection, no multi-parser architecture, no vertical slat mapping. Just CSV rows with SKU + price.
- The XLS support is a convenience wrapper — most imports will likely be CSV
- Don't create products via import — products are created in the admin UI (Build 12–13). Import only updates prices on existing products.
- The admin import UI (Build 16) will wrap this with a drag-and-drop file upload, preview screen, and confirmation flow.
- Prices are always in ZAR cents (integer) in the database and CSV
