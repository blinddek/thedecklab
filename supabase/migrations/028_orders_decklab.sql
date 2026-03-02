-- ============================================================
-- MIGRATION 028: DECK LAB ORDERS & CHECKOUT
-- Supports configurator orders, shop orders, and mixed orders
-- ============================================================

-- ---------------------
-- 1. DECK LAB ORDERS
-- ---------------------
CREATE TABLE decklab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,       -- 'DL-2026-0001'

  -- Order type
  order_type TEXT NOT NULL DEFAULT 'shop'
    CHECK (order_type IN ('configurator', 'shop', 'mixed')),

  -- Customer (guest checkout)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address JSONB,                  -- {street, city, province, postal_code}
  delivery_region TEXT,                    -- 'local', 'regional', 'national'

  -- Delivery & Installation
  delivery_type TEXT NOT NULL
    CHECK (delivery_type IN ('installation', 'supply_deliver', 'supply_collect')),

  -- Pricing
  materials_total_cents INTEGER DEFAULT 0,
  labour_total_cents INTEGER DEFAULT 0,
  extras_total_cents INTEGER DEFAULT 0,
  subtotal_cents INTEGER NOT NULL,
  delivery_fee_cents INTEGER DEFAULT 0,
  vat_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,

  -- Deposit (for installation orders)
  deposit_percent NUMERIC(5,2) DEFAULT 50.00,
  deposit_cents INTEGER DEFAULT 0,
  balance_cents INTEGER DEFAULT 0,

  -- Payment
  paystack_reference TEXT,
  paystack_access_code TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'failed', 'refunded')),

  -- Pipeline
  order_status TEXT NOT NULL DEFAULT 'new'
    CHECK (order_status IN (
      'new', 'confirmed', 'materials_ordered', 'in_progress',
      'ready_for_delivery', 'shipped', 'delivered',
      'installation_scheduled', 'installed', 'completed', 'cancelled'
    )),

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_decklab_orders_status ON decklab_orders(order_status);
CREATE INDEX idx_decklab_orders_payment ON decklab_orders(payment_status);
CREATE INDEX idx_decklab_orders_email ON decklab_orders(customer_email);
CREATE INDEX idx_decklab_orders_number ON decklab_orders(order_number);
CREATE INDEX idx_decklab_orders_created ON decklab_orders(created_at DESC);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON decklab_orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ---------------------
-- 2. CONFIGURATOR ITEMS
-- Deck configurations within an order
-- ---------------------
CREATE TABLE configurator_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES decklab_orders(id) ON DELETE CASCADE,

  -- Configuration
  deck_type_id UUID NOT NULL REFERENCES deck_types(id),
  material_type_id UUID NOT NULL REFERENCES material_types(id),
  length_m NUMERIC(6,2) NOT NULL,
  width_m NUMERIC(6,2) NOT NULL,
  area_m2 NUMERIC(8,2) NOT NULL,

  -- Options
  board_direction_id UUID REFERENCES board_directions(id),
  board_profile_id UUID REFERENCES board_profiles(id),
  finish_option_id UUID REFERENCES finish_options(id),

  -- Pricing breakdown (cents)
  materials_cents INTEGER NOT NULL,
  substructure_cents INTEGER NOT NULL,
  fixings_cents INTEGER NOT NULL,
  labour_cents INTEGER DEFAULT 0,
  staining_cents INTEGER DEFAULT 0,
  extras_cents INTEGER DEFAULT 0,
  line_total_cents INTEGER NOT NULL,

  -- Selected extras
  selected_extras JSONB DEFAULT '[]',      -- [{"extra_id":"...","name":"...","quantity":5,"price_cents":...}]

  -- Full design data (for Build Plan PDF)
  deck_design JSONB,                       -- polygon outline, board layout, cut plan, joist positions

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_configurator_items_order ON configurator_items(order_id);

-- ---------------------
-- 3. SHOP ITEMS
-- Product/kit purchases within an order
-- ---------------------
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES decklab_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  kit_id UUID REFERENCES kits(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shop_items_order ON shop_items(order_id);

-- ---------------------
-- 4. ORDER NUMBER SEQUENCE
-- ---------------------
CREATE SEQUENCE decklab_order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_decklab_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'DL-' || EXTRACT(YEAR FROM now())::TEXT || '-' || LPAD(nextval('decklab_order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_decklab_order_number
  BEFORE INSERT ON decklab_orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_decklab_order_number();
