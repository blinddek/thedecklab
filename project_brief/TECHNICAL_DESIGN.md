# THE DECK LAB — Technical Design Document

> **Version:** 1.0
> **Date:** 19 February 2026
> **Companion to:** PROJECT_BRIEF.md (business requirements & UX flow)

---

## 1. Pricing Model Architecture

### 1.1 Configurator Pricing

The configurator has TWO pricing modes:

**Mode A: Quick Quote (rectangle only — /calculator)**
Uses m² rates for fast estimates before the customer commits to the full designer.

```
Total = (Materials + Substructure + Fixings) × Direction Multiplier
      + Extras
      + Labour (if installation)
      + Delivery
      + VAT
```

```
materials_cost = deck_area_m2 × material_rate_per_m2 × direction_multiplier
substructure_cost = deck_area_m2 × substructure_rate_per_m2
fixings_cost = deck_area_m2 × fixings_rate_per_m2
```

**Mode B: Exact Quote (any shape — /designer)**
Uses the board layout engine to calculate exact piece counts, stock lengths, and offcut reuse.
See DECK_DESIGNER_SPEC.md and CALCULATOR_REFERENCE.md for full algorithms.

```
materials_cost = SUM(stock_boards × unit_price) — offcuts reused reduce board count
substructure_cost = SUM(joist_stock × unit_price) + SUM(bearer_stock × unit_price)
fixings_cost = SUM(screw_boxes + spacer_packs + joist_tape_rolls) × unit_prices
```

Mode B is always more accurate and may be cheaper (offcut reuse) or more expensive (odd shapes = more waste) than the m² estimate.

Substructure rate varies by deck type (raised decks need more structure than ground-level).

**Direction multiplier:**
| Pattern | Multiplier | Reason |
|---------|-----------|--------|
| Lengthwise | 1.00 | Standard — minimal waste |
| Widthwise | 1.00 | Standard — minimal waste |
| Diagonal | 1.10 | 10% extra material for angle cuts |
| Herringbone | 1.15 | 15% extra material + complex cuts |

**Labour cost (installation only):**
```
labour_cost = deck_area_m2 × labour_rate_per_m2 × complexity_multiplier
```

Complexity multiplier by deck type:
| Deck Type | Multiplier |
|-----------|-----------|
| Ground-level | 1.0 |
| Raised | 1.3 |
| Pool deck | 1.2 |
| Balcony/rooftop | 1.4 |

### 1.2 Extras Pricing

| Extra | Pricing Model | Calculation |
|-------|--------------|-------------|
| Steps | Per step × width | step_count × step_width_m × rate_per_step_metre |
| Railings | Per linear metre × material | linear_metres × rate_per_lm (varies by railing material) |
| Built-in seating | Per linear metre | linear_metres × rate_per_lm |
| Built-in planters | Per unit × size | count × rate_per_planter |
| Pergola | Per m² | pergola_area_m2 × rate_per_m2 |
| Staining service | Per m² of deck | deck_area_m2 × stain_rate_per_m2 |

All rates are admin-configurable in the `configurator_rates` table.

### 1.3 Markup Cascade

Same pattern as Blindly — resolution order (first match wins):
1. Product-specific markup (e.g., "Balau 38×114 gets 35%")
2. Material-category markup (e.g., "All hardwood gets 30%")
3. Global markup (default fallback, e.g., 40%)

Applied to supplier costs to determine customer-facing prices.

### 1.4 Materials Shop Pricing

Standard e-commerce:
- Base price per unit (admin-set or imported)
- Bulk discount tiers: configurable breakpoints (e.g., 10+ = 5% off, 50+ = 10%)
- Kit/bundle pricing: sum of component prices minus bundle discount %

### 1.5 Deposit Payments (Installation Orders)

Installation orders use a two-payment flow:
1. **Deposit (50%)** — paid at checkout via Paystack
2. **Balance (50%)** — invoiced on completion, paid via Paystack payment link

The deposit percentage is admin-configurable in site_settings.

---

## 2. Database Schema

### Migration 001 — Universal Yoros Foundation

**Identical to Blindly.** Copy directly from Blindly's `001_foundation.sql`.

Tables: site_settings, navigation_items, pages, user_profiles, contact_submissions, newsletter_subscribers, media, activity_log, update_updated_at() trigger.

---

### Migration 002 — Deck Materials & Products

```sql
-- ============================================================
-- MIGRATION 002: MATERIALS CATALOGUE & SHOP PRODUCTS
-- ============================================================

-- Material types (Treated Pine, Hardwood Balau, Composite, etc.)
CREATE TABLE material_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  durability_rating INTEGER,         -- 1-5 stars
  maintenance_level TEXT,             -- 'low', 'medium', 'high'
  lifespan_years TEXT,                -- "15-20" display text
  is_stainable BOOLEAN DEFAULT false, -- can be stained
  is_composite BOOLEAN DEFAULT false, -- composite vs natural wood
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product categories for the materials shop
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);

-- Products (individual items in the materials shop)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  material_type_id UUID REFERENCES material_types(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  dimensions TEXT,                    -- "38mm × 114mm × 3.0m" display text
  weight_kg NUMERIC(8,2),
  images JSONB DEFAULT '[]',         -- [{url, alt, is_primary}]
  features JSONB DEFAULT '[]',       -- ["Moisture resistant", "FSC certified"]
  base_price_cents INTEGER NOT NULL,
  cost_price_cents INTEGER,          -- supplier cost (admin only)
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order')),
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

-- Product variants (length, colour, size options)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_label TEXT NOT NULL,        -- "3.0m", "5L", "Charcoal"
  variant_type TEXT NOT NULL,         -- 'length', 'colour', 'size', 'volume'
  sku_suffix TEXT,                    -- appended to parent SKU
  price_cents INTEGER NOT NULL,       -- variant-specific price
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
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  category_id UUID REFERENCES product_categories(id),
  bundle_discount_percent NUMERIC(5,2) DEFAULT 0,
  base_price_cents INTEGER,          -- calculated: sum of components minus discount
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Kit components (which products + quantities make up a kit)
CREATE TABLE kit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID NOT NULL REFERENCES kits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(kit_id, product_id, variant_id)
);

CREATE INDEX idx_kit_components_kit ON kit_components(kit_id);

-- Frequently bought together (cross-sell)
CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'frequently_bought_together',
  display_order INTEGER DEFAULT 0,
  UNIQUE(product_id, related_product_id)
);
```

---

### Migration 003 — Deck Configurator Rates

```sql
-- ============================================================
-- MIGRATION 003: DECK CONFIGURATOR PRICING TABLES
-- ============================================================

-- Deck types (ground-level, raised, pool, balcony)
CREATE TABLE deck_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  labour_complexity_multiplier NUMERIC(4,2) DEFAULT 1.00,
  substructure_multiplier NUMERIC(4,2) DEFAULT 1.00,
  applicable_extras JSONB DEFAULT '[]',  -- ["steps", "railings", "pergola", ...]
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configurator material rates (m² pricing per material)
CREATE TABLE configurator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN (
    'boards_per_m2',
    'substructure_per_m2',
    'fixings_per_m2',
    'labour_per_m2',
    'staining_per_m2'
  )),
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2),        -- NULL = use cascade
  customer_price_cents INTEGER,        -- cached: cost × (1 + markup)
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_type_id, rate_type)
);

CREATE INDEX idx_config_rates_material ON configurator_rates(material_type_id);

-- Board direction options
CREATE TABLE board_directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  material_multiplier NUMERIC(4,2) DEFAULT 1.00,
  labour_multiplier NUMERIC(4,2) DEFAULT 1.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Board profiles (standard, grooved, brushed)
CREATE TABLE board_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_modifier_percent NUMERIC(5,2) DEFAULT 0.00,
  applicable_materials UUID[],        -- NULL = all materials
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Stain/finish colours for the configurator
CREATE TABLE finish_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID REFERENCES material_types(id),
  name TEXT NOT NULL,
  hex_colour TEXT,
  swatch_image_url TEXT,
  finish_type TEXT NOT NULL CHECK (finish_type IN ('stain', 'oil', 'factory_colour', 'clear_seal')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_finish_options_material ON finish_options(material_type_id);

-- Extras definitions and pricing
CREATE TABLE configurator_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_key TEXT UNIQUE NOT NULL,     -- 'steps', 'railings', 'seating', 'planters', 'pergola', 'staining'
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN (
    'per_step_metre',     -- steps: count × width × rate
    'per_linear_metre',   -- railings, seating: linear_m × rate
    'per_unit',           -- planters: count × rate
    'per_m2',             -- pergola, staining: area × rate
    'fixed'               -- flat price regardless of size
  )),
  has_material_variants BOOLEAN DEFAULT false,  -- e.g., railing material choice
  input_config JSONB,                -- UI configuration: {min, max, step, unit, label}
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extras pricing tiers (rates for each extra, optionally by material variant)
CREATE TABLE extras_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_id UUID NOT NULL REFERENCES configurator_extras(id) ON DELETE CASCADE,
  material_variant TEXT,              -- NULL = default, or "stainless_wood", "glass_wood" for railings
  variant_label TEXT,                 -- "Stainless Steel + Wood" display text
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2),
  customer_price_cents INTEGER,       -- cached
  unit_label TEXT,                    -- "/step", "/m", "/unit", "/m²"
  is_active BOOLEAN DEFAULT true,
  UNIQUE(extra_id, material_variant)
);

CREATE INDEX idx_extras_pricing_extra ON extras_pricing(extra_id);

-- Markup cascade (same pattern as Blindly)
CREATE TABLE markup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'material', 'product', 'category')),
  scope_id UUID,
  markup_percent NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(scope_type, scope_id)
);

-- Seed global default
INSERT INTO markup_config (scope_type, scope_id, markup_percent) VALUES ('global', NULL, 40.00);

-- Pricing settings (extends site_settings)
INSERT INTO site_settings (key, value, value_type, category, label, description, is_public) VALUES
  ('global_markup_percent', '40', 'number', 'pricing', 'Default Markup %', 'Fallback markup on supplier prices', false),
  ('deposit_percent', '50', 'number', 'pricing', 'Deposit %', 'Deposit percentage for installation orders', true),
  ('delivery_fee_cents', '150000', 'number', 'pricing', 'Delivery Fee', 'Standard delivery fee (cents)', true),
  ('free_delivery_threshold_cents', '1500000', 'number', 'pricing', 'Free Delivery Threshold', 'Free delivery above this amount (cents)', true),
  ('wc_delivery_fee_cents', '100000', 'number', 'pricing', 'WC Delivery Fee', 'Western Cape delivery fee (cents)', true),
  ('national_delivery_fee_cents', '250000', 'number', 'pricing', 'National Delivery Fee', 'National shipping fee (cents)', true),
  ('vat_percent', '15', 'number', 'pricing', 'VAT %', 'South African VAT rate', true),
  ('currency', 'ZAR', 'text', 'pricing', 'Currency', 'Default currency code', true);
```

---

### Migration 004 — Orders & Checkout

```sql
-- ============================================================
-- MIGRATION 004: ORDERS & CHECKOUT
-- Handles both configurator and shop orders
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('configurator', 'shop', 'mixed')),

  -- Customer info (guest checkout)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address JSONB,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('installation', 'supply_deliver', 'supply_collect')),
  delivery_region TEXT CHECK (delivery_region IN ('western_cape', 'national')),

  -- Cross-sell
  interested_in_other_services BOOLEAN DEFAULT false,

  -- Pricing
  subtotal_cents INTEGER NOT NULL,
  extras_total_cents INTEGER DEFAULT 0,
  delivery_fee_cents INTEGER DEFAULT 0,
  labour_total_cents INTEGER DEFAULT 0,
  discount_cents INTEGER DEFAULT 0,
  vat_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,

  -- Deposit handling (installation orders)
  deposit_percent INTEGER,
  deposit_cents INTEGER,
  deposit_paid BOOLEAN DEFAULT false,
  balance_cents INTEGER,
  balance_paid BOOLEAN DEFAULT false,

  -- Payment
  paystack_reference TEXT,
  paystack_access_code TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'failed', 'refunded')),

  -- Status
  order_status TEXT NOT NULL DEFAULT 'new' CHECK (order_status IN (
    'new', 'confirmed', 'materials_ordered', 'in_progress', 'ready_for_delivery',
    'shipped', 'delivered', 'installation_scheduled', 'installed', 'completed', 'cancelled'
  )),

  -- Meta
  customer_notes TEXT,
  admin_notes TEXT,
  estimated_completion DATE,
  build_plan_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_type ON orders(order_type);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Configurator order items (full deck configurations)
CREATE TABLE configurator_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  deck_type_id UUID NOT NULL REFERENCES deck_types(id),
  material_type_id UUID NOT NULL REFERENCES material_types(id),

  -- Dimensions
  length_m NUMERIC(6,2) NOT NULL,
  width_m NUMERIC(6,2) NOT NULL,
  area_m2 NUMERIC(8,2) NOT NULL,

  -- Configuration
  board_direction TEXT NOT NULL,
  board_profile TEXT,
  finish_option TEXT,
  finish_colour TEXT,

  -- Pricing breakdown
  materials_cost_cents INTEGER NOT NULL,
  substructure_cost_cents INTEGER NOT NULL,
  fixings_cost_cents INTEGER NOT NULL,
  direction_multiplier NUMERIC(4,2) DEFAULT 1.00,
  staining_cost_cents INTEGER DEFAULT 0,
  labour_cost_cents INTEGER DEFAULT 0,
  subtotal_cents INTEGER NOT NULL,

  -- Margin tracking
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2) NOT NULL,
  margin_cents INTEGER NOT NULL,

  -- Deck design data (from designer canvas — for build plan PDF generation)
  deck_design JSONB,
  -- { outline: Point[], cutouts: Point[][], board_layout: BoardPiece[],
  --   cut_plan: CutPlan[], joist_layout: JoistPiece[], bearer_layout: BearerPiece[],
  --   post_positions: Point[], waste_percent: number }
  -- See DECK_DESIGNER_SPEC.md for full schema

  -- Selected extras snapshot
  selected_extras JSONB DEFAULT '[]',
  -- [{extra_key, name, pricing_model, quantity, unit_value, unit_label, price_cents}]

  extras_total_cents INTEGER DEFAULT 0,
  line_total_cents INTEGER NOT NULL,

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_configurator_items_order ON configurator_items(order_id);

-- Shop order items (individual products / kits)
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  kit_id UUID REFERENCES kits(id),

  item_type TEXT NOT NULL CHECK (item_type IN ('product', 'kit')),
  name TEXT NOT NULL,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,

  unit_price_cents INTEGER NOT NULL,
  cost_price_cents INTEGER,
  discount_cents INTEGER DEFAULT 0,
  line_total_cents INTEGER NOT NULL,

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shop_items_order ON shop_items(order_id);

-- Order number auto-generation: DL-YYYY-NNNN
CREATE SEQUENCE order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'DL-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();
```

---

### Migration 005 — Quotes, Consultations & Leads

```sql
-- ============================================================
-- MIGRATION 005: QUOTES, CONSULTATIONS & LEAD CAPTURE
-- ============================================================

-- Saved quotes (from configurator)
CREATE TABLE saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  quote_data JSONB NOT NULL,         -- full configurator state snapshot
  total_cents INTEGER NOT NULL,
  email_sent_24h BOOLEAN DEFAULT false,
  email_sent_72h BOOLEAN DEFAULT false,
  email_sent_7d BOOLEAN DEFAULT false,
  converted_to_order_id UUID REFERENCES orders(id),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_quotes_token ON saved_quotes(quote_token);
CREATE INDEX idx_saved_quotes_email ON saved_quotes(customer_email);
CREATE INDEX idx_saved_quotes_created ON saved_quotes(created_at DESC);

-- Consultation requests (from configurator Step 7 or contact page)
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address JSONB,
  property_type TEXT,                 -- 'house', 'townhouse', 'apartment', 'commercial'
  deck_type_interest TEXT,            -- from configurator if available
  estimated_area_m2 NUMERIC(8,2),
  preferred_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'visited', 'quoted', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample requests (material swatches / offcuts)
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address JSONB NOT NULL,
  material_type_id UUID REFERENCES material_types(id),
  material_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'sent', 'delivered')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sample_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Price imports (audit trail — same pattern as Blindly)
CREATE TABLE price_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  supplier TEXT,
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_unchanged INTEGER DEFAULT 0,
  import_mode TEXT DEFAULT 'update' CHECK (import_mode IN ('replace_all', 'update_changed', 'add_new')),
  imported_by UUID REFERENCES user_profiles(id),
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

### Migration 006 — RLS Policies

```sql
-- ============================================================
-- MIGRATION 006: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper function (same as Blindly)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ========== FOUNDATION (same as Blindly) ==========
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings readable by all" ON site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access to settings" ON site_settings FOR ALL USING (is_admin());

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nav items readable by all" ON navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to nav" ON navigation_items FOR ALL USING (is_admin());

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages readable by all" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admin full access to pages" ON pages FOR ALL USING (is_admin());

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media readable by all" ON media FOR SELECT USING (true);
CREATE POLICY "Admin full access to media" ON media FOR ALL USING (is_admin());

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin full access to profiles" ON user_profiles FOR ALL USING (is_admin());

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only activity log" ON activity_log FOR ALL USING (is_admin());

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact form" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to contacts" ON contact_submissions FOR ALL USING (is_admin());

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to subscribers" ON newsletter_subscribers FOR ALL USING (is_admin());

-- ========== PRODUCTS & SHOP ==========
ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active materials readable by all" ON material_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to materials" ON material_types FOR ALL USING (is_admin());

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories readable by all" ON product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to categories" ON product_categories FOR ALL USING (is_admin());

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products readable by all" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to products" ON products FOR ALL USING (is_admin());

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active variants readable by all" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to variants" ON product_variants FOR ALL USING (is_admin());

ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bulk pricing readable by all" ON bulk_pricing FOR SELECT USING (true);
CREATE POLICY "Admin full access to bulk pricing" ON bulk_pricing FOR ALL USING (is_admin());

ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active kits readable by all" ON kits FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to kits" ON kits FOR ALL USING (is_admin());

ALTER TABLE kit_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kit components readable by all" ON kit_components FOR SELECT USING (true);
CREATE POLICY "Admin full access to kit components" ON kit_components FOR ALL USING (is_admin());

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product relations readable by all" ON product_relations FOR SELECT USING (true);
CREATE POLICY "Admin full access to product relations" ON product_relations FOR ALL USING (is_admin());

-- ========== CONFIGURATOR ==========
ALTER TABLE deck_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deck types readable by all" ON deck_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to deck types" ON deck_types FOR ALL USING (is_admin());

ALTER TABLE configurator_rates ENABLE ROW LEVEL SECURITY;
-- NOTE: rates contain supplier costs — public only sees customer_price_cents
CREATE POLICY "Active rates readable by all" ON configurator_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to rates" ON configurator_rates FOR ALL USING (is_admin());

ALTER TABLE board_directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active directions readable by all" ON board_directions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to directions" ON board_directions FOR ALL USING (is_admin());

ALTER TABLE board_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active profiles readable by all" ON board_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to profiles" ON board_profiles FOR ALL USING (is_admin());

ALTER TABLE finish_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active finishes readable by all" ON finish_options FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to finishes" ON finish_options FOR ALL USING (is_admin());

ALTER TABLE configurator_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active extras readable by all" ON configurator_extras FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras" ON configurator_extras FOR ALL USING (is_admin());

ALTER TABLE extras_pricing ENABLE ROW LEVEL SECURITY;
-- NOTE: contains supplier costs — API must filter to customer_price_cents only
CREATE POLICY "Active extras pricing readable by all" ON extras_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras pricing" ON extras_pricing FOR ALL USING (is_admin());

ALTER TABLE markup_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only markup config" ON markup_config FOR ALL USING (is_admin());

-- ========== ORDERS ==========
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders readable by all" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin full access to orders" ON orders FOR ALL USING (is_admin());

ALTER TABLE configurator_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config items readable with order" ON configurator_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create config items" ON configurator_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to config items" ON configurator_items FOR ALL USING (is_admin());

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items readable with order" ON shop_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create shop items" ON shop_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to shop items" ON shop_items FOR ALL USING (is_admin());

-- ========== QUOTES & LEADS ==========
ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create quotes" ON saved_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Quotes readable by token" ON saved_quotes FOR SELECT USING (true);
CREATE POLICY "Admin full access to quotes" ON saved_quotes FOR ALL USING (is_admin());

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request consultations" ON consultation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to consultations" ON consultation_requests FOR ALL USING (is_admin());

ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request samples" ON sample_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to sample requests" ON sample_requests FOR ALL USING (is_admin());

ALTER TABLE price_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only price imports" ON price_imports FOR ALL USING (is_admin());
```

---

## 3. Configurator Pricing Engine

### 3.1 Core Calculation

```typescript
interface DeckConfig {
  deck_type_id: string
  material_type_id: string
  length_m: number
  width_m: number
  board_direction: string       // 'lengthwise' | 'widthwise' | 'diagonal' | 'herringbone'
  board_profile?: string
  finish_option?: string
  installation: boolean         // true = full install, false = supply only
  extras: SelectedExtra[]
}

interface SelectedExtra {
  extra_key: string
  quantity: number              // step count, linear metres, m², or units
  material_variant?: string     // for railings: "stainless_wood", "glass_wood"
}

interface DeckQuote {
  area_m2: number
  materials_cost_cents: number
  substructure_cost_cents: number
  fixings_cost_cents: number
  direction_multiplier: number
  staining_cost_cents: number
  labour_cost_cents: number
  extras_breakdown: ExtraLine[]
  subtotal_cents: number
  delivery_fee_cents: number
  vat_cents: number
  total_cents: number
  deposit_cents: number         // if installation
  balance_cents: number         // if installation
  margin_cents: number          // admin only
}
```

### 3.2 Security

The pricing API MUST filter sensitive fields:
- **Public response:** customer prices only (materials + extras + labour + delivery + VAT = total)
- **Admin response:** adds supplier costs, markup percentages, margin per line item

Configurator rates table contains `supplier_cost_cents` — the public API route must return only `customer_price_cents`. The admin pricing simulator returns the full breakdown.

---

## 4. API Routes

### 4.1 Configurator

```
POST /api/deck/calculate
  Body: DeckConfig
  Returns: DeckQuote (public — no supplier costs)

POST /api/deck/extras
  Body: { deck_type_id, area_m2 }
  Returns: applicable extras with customer prices

GET  /api/deck/materials
  Returns: active material_types with customer m² rates

GET  /api/deck/types
  Returns: active deck_types

GET  /api/deck/directions
  Returns: board_directions with multipliers

GET  /api/deck/finishes?material_type_id=X
  Returns: finish_options for selected material
```

### 4.2 Shop

```
GET  /api/shop/categories
GET  /api/shop/products?category=X&sort=price&page=1
GET  /api/shop/products/[slug]
GET  /api/shop/kits
GET  /api/shop/kits/[slug]
```

### 4.3 Orders

```
POST /api/orders
POST /api/orders/verify
POST /api/webhooks/paystack
GET  /api/orders/[id]
```

### 4.4 Quotes & Leads

```
POST /api/quotes/save
GET  /api/quotes/[token]
GET  /api/quotes/[token]/pdf
POST /api/consultations
POST /api/samples
```

### 4.5 Deck Designer & Build Plan

```
POST /api/designer/calculate
  Body: { outline, cutouts, material, board_direction, board_width }
  Returns: { board_layout, cut_plan, joist_layout, bearer_layout, post_positions, bill_of_materials }

POST /api/designer/preview
  Body: same as calculate
  Returns: PNG preview image of board layout

GET  /api/build-plan/[order_id]/pdf
  Auth: order must be paid (supply) or installation order
  Returns: Build Plan PDF (7 pages)

GET  /api/admin/build-plan/[order_id]/pdf
  Auth: admin only
  Returns: Build Plan PDF with installation notes
```

---

## 5. Key Differences from Blindly

| Aspect | Blindly | The Deck Lab |
|--------|---------|-------------|
| Product model | Category → Type → Range → Price Matrix (width × drop grid) | Material types + m² rates (simpler) |
| Pricing | Grid lookup + nearest-point matching | Direct m² calculation |
| Shop | No shop — configurator only | Full e-commerce catalogue + configurator |
| Cart | Single type (configured blinds) | Mixed cart (deck configs + shop items) |
| Variants | Colour selection from JSONB | Product variants table (length, colour, volume) |
| Payment | Single full payment | Full payment OR deposit + balance |
| Supplier data | 6 XLS files, 40 sheets, 20k prices | Combination of imports + manual entry |
| Order items | Single table (order_items) | Two tables (configurator_items + shop_items) |
| Extras | Per-blind accessories | Per-deck extras (steps, railings, pergolas) |
| Kits | N/A | Bundled product sets with discount |
| Stock | N/A (made to order) | Stock tracking with levels and alerts |
| Delivery | Flat fee or free | Regional pricing (WC vs national) |
| Build plan PDF | N/A | Full installation blueprint with cut list, board layout, joist positions |
| Shape designer | N/A | Interactive canvas (grid-snap + freeform polygon) |
| Cutoff optimization | N/A | Offcut tracking and reuse across board pieces |
| Order prefix | BL-YYYY-NNNN | DL-YYYY-NNNN |

---

## 6. Deck Materials Calculator — Technical Spec

The calculator is a standalone public tool at `/calculator` that computes a full bill of materials from deck dimensions.

### 6.1 Calculator Data Model

The calculator reuses existing tables (products, material_types, configurator_rates) but needs one additional reference table:

```sql
-- Board dimension options per material (for the calculator's smart recommendations)
CREATE TABLE board_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  board_type TEXT NOT NULL CHECK (board_type IN ('deck', 'joist', 'bearer')),
  width_mm INTEGER NOT NULL,
  thickness_mm INTEGER NOT NULL,
  available_lengths_mm JSONB NOT NULL,    -- [2400, 3000, 3600, 4800]
  price_per_unit_cents INTEGER,           -- linked to shop product or manual
  product_id UUID REFERENCES products(id), -- link to shop item for "add to cart"
  coverage_m2_per_unit NUMERIC(6,3),      -- for deck boards: how many m² one board covers
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_board_dims_material ON board_dimensions(material_type_id);

-- Calculator constants (admin-configurable)
INSERT INTO site_settings (key, value, value_type, category, label, description, is_public) VALUES
  ('calc_joist_spacing_mm', '400', 'number', 'calculator', 'Joist Spacing', 'Standard joist spacing in mm', true),
  ('calc_bearer_spacing_mm', '1200', 'number', 'calculator', 'Bearer Spacing', 'Standard bearer spacing in mm', true),
  ('calc_screws_per_board', '8', 'number', 'calculator', 'Screws Per Board', 'Number of screws per deck board', true),
  ('calc_screw_box_quantity', '200', 'number', 'calculator', 'Screws Per Box', 'Number of screws per box', true),
  ('calc_spacers_per_board', '1', 'number', 'calculator', 'Spacers Per Board', 'Number of spacers per board', true),
  ('calc_stain_coverage_m2_per_litre', '8', 'number', 'calculator', 'Stain Coverage', 'Square metres per litre (per coat)', true),
  ('calc_recommended_coats', '2', 'number', 'calculator', 'Recommended Coats', 'Number of stain/oil coats', true);
```

RLS: board_dimensions is public read, admin write (add to Migration 006).

### 6.2 Calculator Algorithm

```typescript
interface CalculatorInput {
  length_mm: number
  width_mm: number
  board_direction: 'lengthwise' | 'widthwise' | 'diagonal' | 'herringbone'
  material_type_id: string
}

interface BillOfMaterials {
  deck_area_m2: number
  material: MaterialSummary
  
  boards: {
    recommended_width_mm: number
    recommended_width_reason: string    // "clean spacing without ripping"
    board_length_mm: number             // closest available length to run direction
    board_count: number
    waste_percent: number
    product_id: string                  // link to shop
    unit_price_cents: number
    total_cents: number
  }
  
  substructure: {
    joists: { dimension: string, length_mm: number, count: number, spacing_mm: number, product_id: string, unit_price_cents: number, total_cents: number }
    bearers: { dimension: string, length_mm: number, count: number, spacing_mm: number, product_id: string, unit_price_cents: number, total_cents: number }
  }
  
  fixings: {
    screws: { count: number, boxes: number, product_id: string, total_cents: number }
    spacers: { count: number, packs: number, product_id: string, total_cents: number }
    joist_tape: { metres: number, rolls: number, product_id: string, total_cents: number }
  }
  
  finishing: {
    type: 'stain' | 'oil' | 'none'     // composite = none
    litres_needed: number
    tin_size_litres: number              // smallest tin that covers
    tins_needed: number
    product_id: string
    total_cents: number
  }
  
  grand_total_cents: number
  
  // Comparison: same calculation for all 4 materials
  material_comparison: {
    material_name: string
    total_cents: number
  }[]
}
```

**Smart board width recommendation:**
```
For a given run length (perpendicular to board direction):
  1. Try each available board width for this material
  2. Calculate: boards_needed = ceil(run_length_mm / (board_width_mm + gap_mm))
  3. Calculate: actual_coverage = boards_needed × (board_width_mm + gap_mm)
  4. Calculate: remainder = actual_coverage - run_length_mm
  5. Score: prefer the width where remainder is smallest OR equals zero
  6. Penalise widths where the last board would need ripping to <50% of its width
  7. Return best width with explanation string
```

**Board length selection:**
```
For a given board run direction:
  run_length = lengthwise ? deck_length : deck_width
  Select the shortest available_length >= run_length (minimises waste)
  If no single length covers the run: flag "boards will need joining" 
```

### 6.3 Calculator API

```
POST /api/calculator
  Body: CalculatorInput
  Returns: BillOfMaterials (with product_ids for "add all to cart")

GET  /api/calculator/board-dimensions?material_type_id=X
  Returns: available board dimensions for the material
```

### 6.4 Cart Integration

"Add All to Cart" creates shop_items for each line in the bill of materials:
- Deck boards: product_id + quantity
- Joists: product_id + quantity
- Bearers: product_id + quantity
- Screws: product_id + boxes quantity
- Spacers: product_id + packs quantity
- Stain: product_id + tins quantity

Each item links to the real shop product so pricing stays consistent.

"Get This Deck Installed" transfers the dimensions and material choice into the configurator at Step 3 (dimensions already filled).

---

## 7. Seed Data Requirements

### Materials
- Treated Pine (CCA): m² rates for boards, substructure, fixings
- Hardwood (Balau): m² rates
- Hardwood (Garapa): m² rates
- Composite (WPC): m² rates

### Deck Types
- Ground-Level (complexity: 1.0)
- Raised (complexity: 1.3)
- Pool Deck (complexity: 1.2)
- Balcony/Rooftop (complexity: 1.4)

### Board Directions
- Lengthwise (1.0×), Widthwise (1.0×), Diagonal (1.10×), Herringbone (1.15×)

### Board Profiles
- Standard, Grooved, Brushed

### Extras
- Steps, Railings, Built-in Seating, Built-in Planters, Pergola, Staining Service

### Shop Products
- Minimum 10 products across categories for launch (boards, fixings, stain, 2 kits)

### Finish Options
- 6-8 stain colours for treated pine
- 2-3 oil options for hardwood
- 4-6 factory colours for composite

### Board Dimensions (for calculator)
- Treated Pine deck boards: 38×114mm, 38×152mm in 2.4m, 3.0m, 3.6m, 4.8m lengths
- Treated Pine joists: 38×114mm in 3.0m, 3.6m, 4.8m lengths
- Treated Pine bearers: 38×152mm in 3.0m, 3.6m, 4.8m lengths
- Balau deck boards: 19×90mm, 20×140mm in 2.1m, 2.4m, 3.0m lengths
- Garapa deck boards: 21×145mm in 2.1m, 2.4m, 3.0m, 3.6m lengths
- Composite boards: per manufacturer specs
- Each linked to corresponding shop product for "add to cart" flow

### Calculator Constants
- Joist spacing: 400mm centres (timber), 300mm (composite)
- Bearer spacing: 1200mm centres
- Screws per board: 8 (timber), 2 clips per board (composite)
- Stain coverage: ~8 m²/litre, 2 coats recommended
- Board gap: 5mm (timber), 3-5mm (composite, per manufacturer)
