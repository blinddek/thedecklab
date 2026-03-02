-- ============================================================
-- MIGRATION 027: CONFIGURATOR RATES & PRICING
-- Deck types, m2 rates, directions, profiles, finishes, extras
-- ============================================================

-- ---------------------
-- 1. DECK TYPES
-- Ground-Level, Raised, Pool, Balcony with complexity multipliers
-- ---------------------
CREATE TABLE deck_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,                     -- {"en": "Ground-Level Deck"}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  complexity_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  labour_complexity_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  applicable_extras UUID[] DEFAULT '{}',   -- Which extras apply to this deck type
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deck_types FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 2. CONFIGURATOR RATES
-- m2 pricing per material per cost component
-- ---------------------
CREATE TABLE configurator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL
    CHECK (rate_type IN ('boards_per_m2', 'substructure_per_m2', 'fixings_per_m2', 'labour_per_m2', 'staining_per_m2')),
  supplier_cost_cents INTEGER NOT NULL,    -- Admin only
  customer_price_cents INTEGER NOT NULL,   -- Public-facing
  unit TEXT DEFAULT 'per_m2',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(material_type_id, rate_type)
);

CREATE INDEX idx_configurator_rates_material ON configurator_rates(material_type_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON configurator_rates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 3. BOARD DIRECTIONS
-- Lengthwise, Widthwise, Diagonal, Herringbone
-- ---------------------
CREATE TABLE board_directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  material_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  labour_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON board_directions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 4. BOARD PROFILES
-- Standard, Grooved, Brushed
-- ---------------------
CREATE TABLE board_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  price_modifier_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON board_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 5. FINISH OPTIONS
-- Stain colours, oils, composite colours per material
-- ---------------------
CREATE TABLE finish_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  hex_colour TEXT,
  image_url TEXT,
  price_modifier_cents INTEGER DEFAULT 0, -- Additional cost per m2
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_finish_options_material ON finish_options(material_type_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON finish_options FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 6. CONFIGURATOR EXTRAS
-- Steps, Railings, Seating, Planters, Pergola, Staining
-- ---------------------
CREATE TABLE configurator_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  icon TEXT,
  pricing_model TEXT NOT NULL
    CHECK (pricing_model IN ('per_step_metre', 'per_linear_metre', 'per_unit', 'per_m2', 'fixed')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON configurator_extras FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 7. EXTRAS PRICING
-- Rate per extra, optionally per material variant
-- ---------------------
CREATE TABLE extras_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_id UUID NOT NULL REFERENCES configurator_extras(id) ON DELETE CASCADE,
  material_type_id UUID REFERENCES material_types(id),  -- NULL = all materials
  variant_label TEXT,                      -- e.g. "Wood railing", "Glass + Wood railing"
  supplier_cost_cents INTEGER NOT NULL,
  customer_price_cents INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_extras_pricing_extra ON extras_pricing(extra_id);
CREATE INDEX idx_extras_pricing_material ON extras_pricing(material_type_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON extras_pricing FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 8. MARKUP CONFIG (same cascade pattern as Blindly)
-- ---------------------
CREATE TABLE markup_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_type TEXT NOT NULL
    CHECK (scope_type IN ('global', 'material', 'product', 'category')),
  scope_id UUID,                           -- NULL for global
  markup_percent NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(scope_type, scope_id)
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON markup_config FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed global default
INSERT INTO markup_config (scope_type, scope_id, markup_percent) VALUES
  ('global', NULL, 40.00);

-- ---------------------
-- 9. BOARD DIMENSIONS
-- Board sizes per material for calculator
-- ---------------------
CREATE TABLE board_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  board_type TEXT NOT NULL                  -- 'deck_board', 'joist', 'bearer'
    CHECK (board_type IN ('deck_board', 'joist', 'bearer')),
  width_mm INTEGER NOT NULL,
  thickness_mm INTEGER NOT NULL,
  available_lengths_mm INTEGER[] NOT NULL,  -- {2400, 3000, 3600, 4800, 6000}
  price_per_metre_cents INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_board_dimensions_material ON board_dimensions(material_type_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON board_dimensions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 10. SITE SETTINGS (key/value config store)
-- ---------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  value_type TEXT NOT NULL DEFAULT 'text'
    CHECK (value_type IN ('text', 'number', 'boolean', 'json')),
  category TEXT NOT NULL DEFAULT 'general',
  label TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings: public read public"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "site_settings: admin full access"
  ON site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------
-- 11. PRICING SETTINGS
-- ---------------------
INSERT INTO site_settings (key, value, value_type, category, label, description, is_public) VALUES
  ('global_markup_percent', '40', 'number', 'pricing', 'Default Markup %', 'Fallback markup on supplier prices', false),
  ('deposit_percent', '50', 'number', 'pricing', 'Deposit %', 'Required deposit for installation orders', true),
  ('delivery_fee_local_cents', '150000', 'number', 'pricing', 'Local Delivery Fee', 'Delivery within 50km (cents)', true),
  ('delivery_fee_regional_cents', '300000', 'number', 'pricing', 'Regional Delivery Fee', 'Delivery 50-200km (cents)', true),
  ('free_delivery_threshold_cents', '5000000', 'number', 'pricing', 'Free Delivery Threshold', 'Free delivery above this (cents)', true),
  ('vat_percent', '15', 'number', 'pricing', 'VAT %', 'South African VAT rate', true),
  ('currency', 'ZAR', 'text', 'pricing', 'Currency', 'Default currency code', true),
  ('joist_spacing_mm', '450', 'number', 'calculator', 'Joist Spacing', 'Default joist centres in mm', true),
  ('waste_factor_percent', '10', 'number', 'calculator', 'Waste Factor', 'Default material waste allowance %', true),
  ('board_gap_mm', '5', 'number', 'calculator', 'Board Gap', 'Default gap between boards in mm', true)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
