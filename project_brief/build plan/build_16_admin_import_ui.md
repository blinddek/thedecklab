# Build 16 — Admin: Price Import UI

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 10 (import engine), Build 11 (admin layout)
> **Context Files:** Build 10 (CSV/XLS parser)
> **Reuse from Blindly:** 🔶 40% — import UI pattern similar, simpler flow

---

## Objective

Build the admin UI for importing product prices and configurator rates from CSV/XLS files. Includes file upload, preview with change detection, confirmation, and import history.

---

## Tasks

### 1. Import Page

**`src/app/(admin)/admin/import/page.tsx`**

Two sections: Upload + History

### 2. Upload Section

**Step 1: File Selection**
- Drag-and-drop zone (accepts .csv, .xls, .xlsx)
- Or "Browse files" button
- Import type selector: "Product Prices" or "Configurator Rates"
- Import mode selector: "Update Changed Only" (default) or "Replace All"

**Step 2: Preview**
After file upload and parsing, show a preview table:

For Product Prices:
```
Preview: 45 rows parsed from "nortier_prices_feb2026.csv"

| SKU             | Product           | Current Price | New Price | Cost Change | Status      |
|-----------------|-------------------|--------------|-----------|-------------|-------------|
| DL-PB-22108-2400| SA Pine 22×108 2.4m| R85.00      | R89.00    | ↑ R4.00     | ⚠️ Changed  |
| DL-PB-22108-3000| SA Pine 22×108 3.0m| R106.00     | R106.00   | —           | ✅ Unchanged|
| DL-PB-XXXXX     | ???               | —            | R120.00   | —           | ❌ Not Found|

Summary: 12 changed, 30 unchanged, 3 not found (will be skipped)
```

For Configurator Rates:
```
Preview: 20 rows parsed from "rates_update.csv"

| Material    | Rate Type        | Current Cost | New Cost | Current Price | New Price | Status     |
|-------------|------------------|-------------|----------|---------------|-----------|------------|
| SA Pine CCA | boards_per_m2    | R420.00     | R445.00  | R588.00       | R623.00   | ⚠️ Changed |
| Balau       | substructure_per_m2| R250.00   | R250.00  | R350.00       | R350.00   | ✅ Unchanged|

Summary: 8 changed, 12 unchanged
```

Colour coding:
- ✅ Green: unchanged
- ⚠️ Amber: price changed
- ❌ Red: SKU not found / parse error

**Step 3: Confirmation**
- Show summary: X to update, X unchanged, X errors
- "Import" button with confirmation dialog
- "Cancel" to discard

**Step 4: Result**
After import:
```
✅ Import complete

12 products updated
30 products unchanged
3 SKUs not found (see error log)

Import saved as: nortier_prices_feb2026.csv (2026-02-19 14:23)
```

Link to import history.

### 3. Import History

Table of past imports:

| Date | Filename | Type | Created | Updated | Unchanged | Errors | Imported By |
|------|----------|------|---------|---------|-----------|--------|-------------|
| 19 Feb 2026 | nortier_prices.csv | Products | 0 | 12 | 30 | 3 | Admin |
| 15 Feb 2026 | rates_feb.csv | Rates | 0 | 8 | 12 | 0 | Admin |

Click row → expand to show error log details.

### 4. CSV Template Download

Provide downloadable CSV templates:

**Product Price Template:**
```csv
sku,cost_price_cents,base_price_cents
DL-PB-22108-2400,5100,8500
```

**Configurator Rate Template:**
```csv
material_slug,rate_type,supplier_cost_cents,markup_percent
sa-pine-cca,boards_per_m2,42000,40
```

"Download Template" buttons above the upload zone.

### 5. Error Handling

- Malformed CSV: show parse error with row number
- Invalid SKU: log as error, skip row, continue
- Missing columns: reject file, show which columns are required
- Invalid numbers: log as error per row
- Empty file: show friendly error

---

## Acceptance Criteria

```
✅ CSV file uploads and parses correctly
✅ XLS/XLSX file uploads and parses correctly
✅ Preview shows all rows with change detection
✅ Colour coding: changed (amber), unchanged (green), not found (red)
✅ Summary counts match actual data
✅ Import mode "Update Changed" only writes changed rows
✅ Import mode "Replace All" writes all matched rows
✅ Unknown SKUs are skipped and logged as errors
✅ Import creates price_imports audit record
✅ Import history table shows past imports
✅ Error log expandable per import
✅ CSV templates downloadable
✅ Parse errors show helpful messages with row numbers
✅ Empty/malformed files handled gracefully
```

---

## Notes for Claude Code

- The preview step is KEY — admin must see what will change before confirming. Never auto-import.
- The CSV parser (Build 10) does the heavy lifting. This build is the UI wrapper.
- XLS handling: use the `xlsx` library to convert to CSV, then the same preview pipeline.
- Large files: if >500 rows, show a loading spinner during parse. The actual DB writes are fast (batch upsert).
- Template CSVs should be dynamically generated from existing SKUs — "Download current prices as CSV" is more useful than an empty template.
