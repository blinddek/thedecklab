# Build 06 — Quotes, Leads & Imports Schema

> **Type:** Migration
> **Estimated Time:** 20 min
> **Dependencies:** Build 05
> **Context Files:** TECHNICAL_DESIGN.md §2 (Migration 005)
> **Reuse from Blindly:** 🔶 60% — quote save pattern same, lead types different

---

## Objective

Create the lead capture and quote management tables. These support the abandoned cart recovery flow (saved quotes), consultation booking (site visits), material sample requests, and price import audit trail.

---

## Tasks

### 1. Create Migration File

Create `supabase/migrations/005_quotes_leads.sql`

### 2. Tables to Create

| Table | Purpose | Blindly Equivalent |
|-------|---------|-------------------|
| saved_quotes | Abandoned cart recovery — saves full configurator/cart state | saved_quotes (identical pattern) |
| consultation_requests | Site visit bookings for complex decks | measure_requests (adapted) |
| sample_requests | Material swatch/offcut requests | swatch_requests (adapted) |
| price_imports | Audit trail for CSV/XLS price imports | price_imports (same pattern) |

### 3. Key Differences from Blindly

**saved_quotes** stores `quote_data JSONB` instead of `cart_data JSONB` — same concept, different content. The JSONB holds the full configurator state or cart snapshot.

**consultation_requests** replaces Blindly's measure_requests. Status pipeline is longer:
```
new → contacted → scheduled → visited → quoted → completed → cancelled
```
Includes property_type, deck_type_interest, and estimated_area_m2 to pre-qualify the lead.

**sample_requests** replaces swatch_requests. References material_type_id instead of blind_range_id.

**price_imports** is simpler than Blindly — no XLS parser or sheet mappings. Just tracks CSV/manual imports.

### 4. Full SQL

```sql
-- ============================================================
-- MIGRATION 005: QUOTES, CONSULTATIONS & LEAD CAPTURE
-- ============================================================

CREATE TABLE saved_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_token TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  quote_data JSONB NOT NULL,
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

CREATE TABLE consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address JSONB,
  property_type TEXT,
  deck_type_interest TEXT,
  estimated_area_m2 NUMERIC(8,2),
  preferred_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'scheduled', 'visited', 'quoted', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON consultation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address JSONB NOT NULL,
  material_type_id UUID REFERENCES material_types(id),
  material_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'sent', 'delivered')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sample_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE price_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  supplier TEXT,
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_unchanged INTEGER DEFAULT 0,
  import_mode TEXT DEFAULT 'update'
    CHECK (import_mode IN ('replace_all', 'update_changed', 'add_new')),
  imported_by UUID REFERENCES user_profiles(id),
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5. Generate TypeScript Types

Update `src/types/database.ts` with all 4 new tables.

---

## Acceptance Criteria

```
✅ Migration runs without errors
✅ All 4 tables created with correct constraints
✅ saved_quotes.quote_token is UNIQUE
✅ consultation_requests has 7-state status pipeline
✅ sample_requests references material_types
✅ price_imports tracks create/update/unchanged counts
✅ All updated_at triggers fire correctly
✅ TypeScript types generated
```

---

## Notes for Claude Code

- The `quote_token` should be generated with `nanoid(12)` when creating a quote — this happens in the application layer (Build 28), not in the database
- The `quote_data` JSONB for a configurator quote looks like: `{deck_type, material, dimensions, direction, profile, finish, extras, pricing_breakdown, deck_design}`
- The `quote_data` JSONB for a mixed cart looks like: `{configurator_items: [...], shop_items: [...], totals}`
- `consultation_requests` is the lead capture path for complex decks that can't be instantly quoted — these are valuable leads for Nortier
- `price_imports` is much simpler than Blindly's — no sheet mappings or parser types needed since Deck Lab uses CSV or manual entry instead of complex XLS files
