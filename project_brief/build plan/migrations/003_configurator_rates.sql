-- ============================================================
-- MIGRATION 003: DECK CONFIGURATOR PRICING TABLES
-- ============================================================

CREATE TABLE deck_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "Ground-Level", "af": "Grondvlak"}
  slug TEXT UNIQUE NOT NULL,
  description JSONB,
  image_url TEXT,
  labour_complexity_multiplier NUMERIC(4,2) DEFAULT 1.00,
  substructure_multiplier NUMERIC(4,2) DEFAULT 1.00,
  applicable_extras JSONB DEFAULT '[]',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON deck_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE configurator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  rate_type TEXT NOT NULL CHECK (rate_type IN (
    'boards_per_m2', 'substructure_per_m2', 'fixings_per_m2', 'labour_per_m2', 'staining_per_m2'
  )),
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2),
  customer_price_cents INTEGER,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_type_id, rate_type)
);

CREATE INDEX idx_config_rates_material ON configurator_rates(material_type_id);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON configurator_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE board_directions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "Lengthwise", "af": "Lengte"}
  slug TEXT NOT NULL,
  description JSONB,
  image_url TEXT,
  material_multiplier NUMERIC(4,2) DEFAULT 1.00,
  labour_multiplier NUMERIC(4,2) DEFAULT 1.00,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE board_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL,              -- {"en": "Standard", "af": "Standaard"}
  slug TEXT NOT NULL,
  description JSONB,
  image_url TEXT,
  price_modifier_percent NUMERIC(5,2) DEFAULT 0.00,
  applicable_materials UUID[],
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE finish_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID REFERENCES material_types(id),
  name JSONB NOT NULL,              -- {"en": "Natural Oak", "af": "Natuurlike Eik"}
  hex_colour TEXT,
  swatch_image_url TEXT,
  finish_type TEXT NOT NULL CHECK (finish_type IN ('stain', 'oil', 'factory_colour', 'clear_seal')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_finish_options_material ON finish_options(material_type_id);

CREATE TABLE configurator_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_key TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,              -- {"en": "Steps", "af": "Trappe"}
  description JSONB,
  image_url TEXT,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN (
    'per_step_metre', 'per_linear_metre', 'per_unit', 'per_m2', 'fixed'
  )),
  has_material_variants BOOLEAN DEFAULT false,
  input_config JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON configurator_extras FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE extras_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extra_id UUID NOT NULL REFERENCES configurator_extras(id) ON DELETE CASCADE,
  material_variant TEXT,
  variant_label JSONB,              -- {"en": "Stainless Steel + Wood", "af": "Vlekvrye Staal + Hout"}
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2),
  customer_price_cents INTEGER,
  unit_label JSONB,                 -- {"en": "/step", "af": "/trap"}
  is_active BOOLEAN DEFAULT true,
  UNIQUE(extra_id, material_variant)
);

CREATE INDEX idx_extras_pricing_extra ON extras_pricing(extra_id);

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

CREATE TRIGGER set_updated_at BEFORE UPDATE ON markup_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed global markup
INSERT INTO markup_config (scope_type, scope_id, markup_percent) VALUES ('global', NULL, 40.00);

-- Board dimension options per material (for calculator and designer)
CREATE TABLE board_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type_id UUID NOT NULL REFERENCES material_types(id) ON DELETE CASCADE,
  board_type TEXT NOT NULL CHECK (board_type IN ('deck', 'joist', 'bearer')),
  width_mm INTEGER NOT NULL,
  thickness_mm INTEGER NOT NULL,
  available_lengths_mm JSONB NOT NULL,    -- [2400, 3000, 3600, 4800]
  price_per_unit_cents INTEGER,
  product_id UUID REFERENCES products(id),
  coverage_m2_per_unit NUMERIC(6,3),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_board_dims_material ON board_dimensions(material_type_id);

-- Deck Lab pricing settings (extends site_settings from Migration 001)
INSERT INTO site_settings (key, value, value_type, category, label, description, is_public) VALUES
  ('global_markup_percent', '40', 'number', 'pricing', 'Default Markup %', 'Fallback markup on supplier prices', false),
  ('deposit_percent', '50', 'number', 'pricing', 'Deposit %', 'Deposit percentage for installation orders', true),
  ('delivery_fee_cents', '150000', 'number', 'pricing', 'Delivery Fee', 'Standard delivery fee (cents)', true),
  ('free_delivery_threshold_cents', '1500000', 'number', 'pricing', 'Free Delivery Threshold', 'Free delivery above this amount (cents)', true),
  ('wc_delivery_fee_cents', '100000', 'number', 'pricing', 'WC Delivery Fee', 'Western Cape delivery fee (cents)', true),
  ('national_delivery_fee_cents', '250000', 'number', 'pricing', 'National Delivery Fee', 'National shipping fee (cents)', true),
  ('vat_percent', '15', 'number', 'pricing', 'VAT %', 'South African VAT rate', true),
  ('currency', 'ZAR', 'text', 'pricing', 'Currency', 'Default currency code', true);

-- Calculator constants
INSERT INTO site_settings (key, value, value_type, category, label, description, is_public) VALUES
  ('calc_joist_spacing_multiplier', '20', 'number', 'calculator', 'Joist Spacing Multiplier', 'Multiplied by board thickness for joist spacing (mm)', true),
  ('calc_bearer_spacing_mm', '2400', 'number', 'calculator', 'Bearer Spacing', 'Standard post/bearer spacing in mm', true),
  ('calc_waste_factor', '1.05', 'number', 'calculator', 'Waste Factor', '5% general waste multiplier', true),
  ('calc_diagonal_multiplier', '1.10', 'number', 'calculator', 'Diagonal Multiplier', 'Extra material for diagonal layout', true),
  ('calc_herringbone_multiplier', '1.15', 'number', 'calculator', 'Herringbone Multiplier', 'Extra material for herringbone layout', true),
  ('calc_screws_per_crossing', '2', 'number', 'calculator', 'Screws Per Crossing', 'Screws per board per joist crossing', true),
  ('calc_screw_box_size', '200', 'number', 'calculator', 'Screws Per Box', 'Number of screws per box', true),
  ('calc_spacers_per_board', '1', 'number', 'calculator', 'Spacers Per Board', 'Number of spacers per board', true),
  ('calc_spacer_pack_size', '50', 'number', 'calculator', 'Spacers Per Pack', 'Number of spacers per pack', true),
  ('calc_joist_tape_roll_m', '20', 'number', 'calculator', 'Joist Tape Roll Length', 'Metres per roll of joist tape', true),
  ('calc_stain_coverage_m2_per_litre', '8', 'number', 'calculator', 'Stain Coverage', 'Square metres per litre per coat', true),
  ('calc_recommended_coats', '2', 'number', 'calculator', 'Recommended Coats', 'Number of stain/oil coats recommended', true),
  ('calc_pine_gap_mm', '5', 'number', 'calculator', 'Pine Board Gap', 'Gap between softwood boards in mm', true),
  ('calc_hardwood_gap_mm', '4', 'number', 'calculator', 'Hardwood Board Gap', 'Gap between hardwood boards in mm', true),
  ('calc_composite_gap_mm', '5', 'number', 'calculator', 'Composite Board Gap', 'Gap between composite boards in mm', true),
  ('calc_min_usable_offcut_mm', '300', 'number', 'calculator', 'Min Usable Offcut', 'Minimum offcut length to track for reuse', true);
