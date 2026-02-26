-- ============================================================
-- MIGRATION 026: MATERIALS & PRODUCTS CATALOGUE
-- Material Types + Products + Variants + Kits
-- ============================================================

-- ---------------------
-- 1. MATERIAL TYPES
-- SA Pine, Balau, Garapa, Composite
-- ---------------------
CREATE TABLE material_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,                     -- {"en": "SA Pine CCA Treated", "af": "SA Denne CCA Behandel"}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  durability_rating INTEGER,               -- 1-5 scale
  maintenance_level TEXT,                   -- 'low', 'medium', 'high'
  lifespan_years_min INTEGER,
  lifespan_years_max INTEGER,
  is_composite BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON material_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 2. PRODUCT CATEGORIES (hierarchical)
-- Deck Boards, Substructure, Fixings, Finishing, Kits
-- ---------------------
-- Note: template already has product_categories table from 008_shop.sql
-- We add parent_id for hierarchy support
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES product_categories(id);
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS material_type_id UUID REFERENCES material_types(id);

-- ---------------------
-- 3. PRODUCTS
-- Individual shop items with SKU and material link
-- ---------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material_type_id UUID REFERENCES material_types(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;          -- {"width_mm": 114, "thickness_mm": 32}
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8,2);

CREATE INDEX IF NOT EXISTS idx_products_material ON products(material_type_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- ---------------------
-- 4. PRODUCT VARIANTS
-- Length/colour/size options per product
-- ---------------------
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name JSONB NOT NULL,                     -- {"en": "3.6m Length"}
  sku TEXT,
  length_mm INTEGER,
  colour TEXT,
  price_cents INTEGER NOT NULL,
  supplier_cost_cents INTEGER,
  stock_quantity INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 5. BULK PRICING
-- Quantity break discounts
-- ---------------------
CREATE TABLE bulk_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  min_quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);

CREATE INDEX idx_bulk_pricing_product ON bulk_pricing(product_id);
CREATE INDEX idx_bulk_pricing_variant ON bulk_pricing(variant_id);

-- ---------------------
-- 6. KITS / BUNDLES
-- ---------------------
CREATE TABLE kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  price_cents INTEGER NOT NULL,            -- Bundle price (usually < sum of parts)
  supplier_cost_cents INTEGER,
  material_type_id UUID REFERENCES material_types(id),
  area_m2 NUMERIC(6,2),                    -- Covers X m2
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON kits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 7. KIT COMPONENTS
-- ---------------------
CREATE TABLE kit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_kit_components_kit ON kit_components(kit_id);

-- ---------------------
-- 8. PRODUCT RELATIONS (cross-sell)
-- ---------------------
CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'frequently_bought_together',
  display_order INTEGER DEFAULT 0,

  UNIQUE(product_id, related_product_id)
);

CREATE INDEX idx_product_relations_product ON product_relations(product_id);
