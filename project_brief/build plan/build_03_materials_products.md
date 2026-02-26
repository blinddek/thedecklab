# Build 03 — Materials & Products Schema

> **Type:** Migration
> **Estimated Time:** 30 min
> **Dependencies:** Build 02
> **Context Files:** TECHNICAL_DESIGN.md §2 (Migration 002)
> **Reuse from Blindly:** 🔶 30% — product model is completely different
> **i18n Impact:** Public-facing name/description fields are JSONB (LocalizedString). See YOROS_I18N_DARKMODE_STANDARD.md.

---

## Objective

Create the materials catalogue and shop product tables. This is the core data model for The Deck Lab's e-commerce shop. Unlike Blindly's Category → Type → Range → Price Matrix hierarchy, Deck Lab uses a simpler Material Types + Products + Variants model.

---

## Tasks

### 1. Create Migration File

Create `supabase/migrations/002_materials_products.sql`

### 2. Tables to Create

| Table | Purpose | Rows (expected) |
|-------|---------|-----------------|
| material_types | Top-level materials: Treated Pine, Balau, Garapa, Composite | 4–6 |
| product_categories | Shop categories: Deck Boards, Substructure, Fixings, Finishing, Kits | 5–8 (hierarchical) |
| products | Individual shop items with SKU, pricing, stock | 50–200 |
| product_variants | Length/colour/size options per product | 100–500 |
| bulk_pricing | Quantity break discounts | 20–50 |
| kits | Bundle definitions | 5–10 |
| kit_components | Products in each kit | 20–50 |
| product_relations | Cross-sell "frequently bought together" | 20–50 |

### 3. Key Design Decisions

**material_types** is the anchor table that connects the shop to the configurator. Every product optionally links to a material_type. The configurator uses material_types for pricing; the shop uses products for ordering.

**product_categories** is hierarchical (parent_id) to support:
```
Deck Boards
  ├── Treated Pine
  ├── Balau
  ├── Garapa
  └── Composite
Substructure
  ├── Joists
  ├── Bearers
  └── Brackets
Fixings
  ├── Screws
  ├── Clips
  └── Spacers
Finishing
  ├── Stain
  ├── Oil
  └── Cleaner
Kits & Bundles
```

**product_variants** handles the fact that a "38×114mm CCA Pine Joist" comes in 3.0m, 3.6m, and 4.8m lengths at different prices. The variant carries its own price_cents and stock_quantity.

**bulk_pricing** supports tiered quantity discounts:
```
Product: 50mm Stainless Screws (box of 200)
  10+ boxes → 5% off
  50+ boxes → 10% off
  100+ boxes → 15% off
```

### 4. Full SQL

```sql
-- ============================================================
-- MIGRATION 002: MATERIALS CATALOGUE & SHOP PRODUCTS
-- ============================================================

-- Material types (Treated Pine, Hardwood Balau, Composite, etc.)
CREATE TABLE material_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "Treated Pine", "af": "Behandelde Den"}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,                 -- {"en": "...", "af": "..."}
  image_url TEXT,
  durability_rating INTEGER,         -- 1-5 stars
  maintenance_level TEXT,             -- 'low', 'medium', 'high'
  lifespan_years TEXT,                -- "15-20" display text
  is_stainable BOOLEAN DEFAULT false,
  is_composite BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON material_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Product categories for the materials shop (hierarchical)
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "Deck Boards", "af": "Dekplanke"}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Products (individual items in the materials shop)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  material_type_id UUID REFERENCES material_types(id),
  name JSONB NOT NULL,              -- {"en": "...", "af": "..."}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  short_description JSONB,
  sku TEXT UNIQUE,
  dimensions TEXT,                    -- "38mm × 114mm × 3.0m" display text
  weight_kg NUMERIC(8,2),
  images JSONB DEFAULT '[]',         -- [{url, alt, is_primary}]
  features JSONB DEFAULT '[]',       -- ["Moisture resistant", "FSC certified"]
  base_price_cents INTEGER NOT NULL,
  cost_price_cents INTEGER,          -- supplier cost (admin only)
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  stock_status TEXT DEFAULT 'in_stock'
    CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_material ON products(material_type_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Product variants (length, colour, size options per product)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_label JSONB NOT NULL,       -- {"en": "3.0m", "af": "3.0m"} or {"en": "Charcoal", "af": "Houtskool"}
  variant_type TEXT NOT NULL,         -- 'length', 'colour', 'size', 'volume'
  sku_suffix TEXT,                    -- appended to parent SKU
  price_cents INTEGER NOT NULL,
  cost_price_cents INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  weight_kg NUMERIC(8,2),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Bulk discount tiers
CREATE TABLE bulk_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL,
  UNIQUE(product_id, min_quantity)
);

-- Kits / Bundles
CREATE TABLE kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "...", "af": "..."}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  short_description JSONB,
  image_url TEXT,
  category_id UUID REFERENCES product_categories(id),
  bundle_discount_percent NUMERIC(5,2) DEFAULT 0,
  base_price_cents INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON kits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Kit components
CREATE TABLE kit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(kit_id, product_id, variant_id)
);

CREATE INDEX idx_kit_components_kit ON kit_components(kit_id);

-- Cross-sell relations
CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'frequently_bought_together',
  display_order INTEGER DEFAULT 0,
  UNIQUE(product_id, related_product_id)
);
```

### 5. Generate TypeScript Types

Update `src/types/database.ts` with types for all 8 new tables.

### 6. Server Actions

Create `src/lib/actions/materials.ts`:
- `getMaterialTypes()` — active material types with display_order
- `getMaterialType(slug)` — single material with related products

Create `src/lib/actions/products.ts`:
- `getCategories()` — hierarchical category tree
- `getProducts(categorySlug, page, sort)` — paginated product list
- `getProduct(slug)` — single product with variants and bulk pricing
- `getRelatedProducts(productId)` — cross-sell products

Create `src/lib/actions/kits.ts`:
- `getKits()` — active kits
- `getKit(slug)` — single kit with components and calculated price

---

## Acceptance Criteria

```
✅ Migration runs without errors
✅ All 8 tables created with correct columns, constraints, and indexes
✅ product_categories supports hierarchical parent-child
✅ product_variants references products correctly
✅ bulk_pricing UNIQUE constraint on (product_id, min_quantity)
✅ kit_components UNIQUE constraint on (kit_id, product_id, variant_id)
✅ TypeScript types generated
✅ Server actions return typed data
✅ cost_price_cents fields exist but are NOT exposed in public queries
```

---

## Notes for Claude Code

- material_types is the bridge between the configurator and the shop
- products.cost_price_cents and product_variants.cost_price_cents are supplier costs — NEVER return these in public-facing APIs
- The images JSONB field on products should support: `[{url: string, alt: {en: string, af: string}, is_primary: boolean}]`
- features JSONB is an array of LocalizedStrings: `[{"en": "CCA H3 Treated", "af": "CCA H3 Behandel"}, ...]`
- Admin CRUD forms for localized fields must show two inputs per field: "English" + "Afrikaans"
- If Afrikaans is left empty, the `t()` helper falls back to English on the public site
- stock_status should auto-update based on stock_quantity vs low_stock_threshold (this can be a trigger or application logic — application logic is fine for now)
