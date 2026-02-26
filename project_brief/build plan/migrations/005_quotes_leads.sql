-- ============================================================
-- MIGRATION 005: QUOTES, CONSULTATIONS & LEAD CAPTURE
-- Handles abandoned cart recovery, site visit bookings,
-- material sample requests, and price import audit trail
-- ============================================================

-- ---------------------
-- 1. SAVED QUOTES
-- Abandoned cart recovery — saves full configurator/cart state
-- Token-based access (no auth required to view)
-- ---------------------
CREATE TABLE saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token TEXT UNIQUE NOT NULL,         -- nanoid(12), generated in application layer
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,

  -- Full configurator or cart state
  quote_data JSONB NOT NULL,                -- {deck_type, material, dimensions, extras, pricing...}
  total_cents INTEGER NOT NULL,

  -- Automated email follow-up tracking
  email_sent_24h BOOLEAN DEFAULT false,
  email_sent_72h BOOLEAN DEFAULT false,
  email_sent_7d BOOLEAN DEFAULT false,

  -- Conversion tracking
  converted_to_order_id UUID REFERENCES orders(id),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_quotes_token ON saved_quotes(quote_token);
CREATE INDEX idx_saved_quotes_email ON saved_quotes(customer_email);
CREATE INDEX idx_saved_quotes_expires ON saved_quotes(expires_at);
CREATE INDEX idx_saved_quotes_created ON saved_quotes(created_at DESC);
-- For cron job: unconverted, not expired, email not yet sent
CREATE INDEX idx_saved_quotes_followup ON saved_quotes(created_at)
  WHERE converted_to_order_id IS NULL AND expires_at > now();

-- ---------------------
-- 2. CONSULTATION REQUESTS
-- Site visit bookings for complex decks
-- Replaces Blindly's measure_requests
-- ---------------------
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Property & deck details (pre-qualification)
  address JSONB,                            -- {street, suburb, city, province, postal_code}
  property_type TEXT,                       -- house, townhouse, apartment, commercial
  deck_type_interest TEXT,                  -- from deck_types slug or free text
  estimated_area_m2 NUMERIC(8,2),
  preferred_date DATE,
  notes TEXT,

  -- Pipeline
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'scheduled', 'visited', 'quoted', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_consultation_status ON consultation_requests(status);
CREATE INDEX idx_consultation_created ON consultation_requests(created_at DESC);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 3. SAMPLE REQUESTS
-- Material swatch/offcut requests
-- Replaces Blindly's swatch_requests
-- ---------------------
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  delivery_address JSONB NOT NULL,          -- {street, suburb, city, province, postal_code}
  material_type_id UUID REFERENCES material_types(id),
  material_name TEXT NOT NULL,              -- denormalized for display even if material deleted

  -- Pipeline
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'sent', 'delivered')),
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_sample_status ON sample_requests(status);
CREATE INDEX idx_sample_created ON sample_requests(created_at DESC);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sample_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 4. PRICE IMPORTS
-- Audit trail for CSV/XLS price imports
-- ---------------------
CREATE TABLE price_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  supplier TEXT,
  import_type TEXT DEFAULT 'products'
    CHECK (import_type IN ('products', 'rates')),

  -- Results
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_unchanged INTEGER DEFAULT 0,

  import_mode TEXT DEFAULT 'update_changed'
    CHECK (import_mode IN ('replace_all', 'update_changed', 'add_new')),
  imported_by UUID REFERENCES user_profiles(id),
  error_log JSONB,                          -- [{row, sku, error}]

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_imports_created ON price_imports(created_at DESC);
