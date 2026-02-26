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
  images JSONB DEFAULT '[]',         -- [{url, alt: {en, af}, is_primary}]
  features JSONB DEFAULT '[]',       -- [{en, af}, ...]
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
  variant_label JSONB NOT NULL,       -- {"en": "3.0m", "af": "3.0m"}
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
