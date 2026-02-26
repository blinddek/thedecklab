-- ============================================================
-- MIGRATION 029: QUOTES, LEADS & IMPORTS — DECK LAB
-- ============================================================

-- ---------------------
-- 1. SAVED QUOTES (Abandoned Cart Recovery)
-- ---------------------
CREATE TABLE saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  quote_data JSONB NOT NULL,               -- Full configurator/cart state snapshot
  total_cents INTEGER NOT NULL,

  -- Follow-up drip tracking
  email_sent_24h BOOLEAN DEFAULT false,
  email_sent_72h BOOLEAN DEFAULT false,
  email_sent_7d BOOLEAN DEFAULT false,
  converted_to_order_id UUID REFERENCES decklab_orders(id),

  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_quotes_token ON saved_quotes(quote_token);
CREATE INDEX idx_saved_quotes_email ON saved_quotes(customer_email);
CREATE INDEX idx_saved_quotes_created ON saved_quotes(created_at DESC);

-- ---------------------
-- 2. CONSULTATION REQUESTS (Site Visits)
-- ---------------------
CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address JSONB,                           -- {street, city, province, postal_code}
  property_type TEXT,                      -- 'house', 'townhouse', 'apartment', 'commercial'
  deck_type_interest TEXT,                 -- Which deck type they're interested in
  estimated_area_m2 NUMERIC(6,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'scheduled', 'visited', 'quoted', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 3. SAMPLE REQUESTS (Material swatches/offcuts)
-- ---------------------
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address JSONB NOT NULL,
  material_type_id UUID REFERENCES material_types(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'sent', 'delivered')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sample_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------
-- 4. PRICE IMPORTS (Audit trail)
-- ---------------------
CREATE TABLE price_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  supplier TEXT NOT NULL DEFAULT 'internal',
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_unchanged INTEGER DEFAULT 0,
  import_mode TEXT DEFAULT 'replace_all'
    CHECK (import_mode IN ('replace_all', 'update_changed')),
  imported_by UUID REFERENCES user_profiles(id),
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
