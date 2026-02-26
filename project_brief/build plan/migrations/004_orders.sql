-- ============================================================
-- MIGRATION 004: ORDERS & CHECKOUT
-- Handles configurator, shop, and mixed orders
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('configurator', 'shop', 'mixed')),

  -- Customer info (guest checkout — no auth required)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_company TEXT,
  delivery_address JSONB,
  delivery_type TEXT NOT NULL
    CHECK (delivery_type IN ('installation', 'supply_deliver', 'supply_collect')),
  delivery_region TEXT
    CHECK (delivery_region IN ('western_cape', 'national')),

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
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'deposit_paid', 'paid', 'failed', 'refunded')),

  -- Status pipeline
  order_status TEXT NOT NULL DEFAULT 'new'
    CHECK (order_status IN (
      'new', 'confirmed', 'materials_ordered', 'in_progress',
      'ready_for_delivery', 'shipped', 'delivered',
      'installation_scheduled', 'installed', 'completed',
      'cancelled'
    )),

  -- Installation scheduling
  scheduled_installation_date DATE,
  estimated_duration_days INTEGER,
  installer_notes TEXT,

  -- Balance payment tracking
  balance_payment_method TEXT,           -- 'eft', 'cash', 'paystack'
  balance_payment_reference TEXT,
  balance_payment_date DATE,

  -- Build plan
  build_plan_generated BOOLEAN DEFAULT false,
  build_plan_url TEXT,

  -- Meta
  customer_notes TEXT,
  admin_notes TEXT,
  estimated_completion DATE,
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

  -- Margin tracking (admin only)
  supplier_cost_cents INTEGER NOT NULL,
  markup_percent NUMERIC(5,2) NOT NULL,
  margin_cents INTEGER NOT NULL,

  -- Deck design data (from designer canvas — for build plan PDF)
  deck_design JSONB,

  -- Selected extras
  selected_extras JSONB DEFAULT '[]',
  extras_total_cents INTEGER DEFAULT 0,
  line_total_cents INTEGER NOT NULL,

  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_configurator_items_order ON configurator_items(order_id);

-- Shop order items (individual products and kits)
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

-- Order number sequence: DL-YYYY-NNNN
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
