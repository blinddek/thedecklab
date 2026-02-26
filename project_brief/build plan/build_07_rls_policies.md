# Build 07 — RLS Policies & Indexes

> **Type:** Migration
> **Estimated Time:** 30 min
> **Dependencies:** Build 06
> **Context Files:** TECHNICAL_DESIGN.md §2 (Migration 006)
> **Reuse from Blindly:** ✅ 80% — same RLS pattern, different table names

---

## Objective

Lock down every table with Row Level Security policies. This is the security layer that ensures:
- Public users can READ active products, materials, rates (but NOT supplier costs)
- Public users can INSERT orders, quotes, contact forms (guest checkout)
- Admins have full CRUD on everything
- Markup config is admin-only (NEVER public)
- Supplier costs on configurator_rates and extras_pricing are readable but filtered by API routes — RLS allows SELECT but the API only returns customer_price_cents

---

## Tasks

### 1. Create Migration File

Create `supabase/migrations/006_rls_policies.sql`

### 2. Security Model

| Access Level | Tables | Policy |
|-------------|--------|--------|
| **Public read (active only)** | material_types, product_categories, products, product_variants, bulk_pricing, kits, kit_components, product_relations, deck_types, configurator_rates, board_directions, board_profiles, finish_options, configurator_extras, extras_pricing, board_dimensions | `FOR SELECT USING (is_active = true)` or `USING (true)` for junction tables |
| **Public read (always)** | site_settings (is_public only), media, orders, configurator_items, shop_items, saved_quotes | Various — settings filtered by is_public, orders by token/ID |
| **Public read (filtered)** | navigation_items (active only), pages (published only) | `USING (is_active = true)` / `USING (is_published = true)` |
| **Public insert** | orders, configurator_items, shop_items, saved_quotes, contact_submissions, newsletter_subscribers, consultation_requests, sample_requests | `FOR INSERT WITH CHECK (true)` — guest checkout |
| **Admin only** | markup_config, price_imports, activity_log | `FOR ALL USING (is_admin())` |
| **Own profile** | user_profiles | Users read/update own row, admin reads all |

### 3. Critical Security Notes

**⚠ configurator_rates and extras_pricing contain `supplier_cost_cents`:**
RLS allows public SELECT on these tables (needed for live pricing), but the PUBLIC API routes MUST only return `customer_price_cents`. The supplier cost filtering happens at the API/server action layer, not RLS. Admin API routes return the full data.

**⚠ markup_config is ADMIN ONLY:**
This table contains the margin strategy. No public access whatsoever.

**⚠ products.cost_price_cents and product_variants.cost_price_cents:**
Same as above — RLS allows SELECT (needed for admin), but public queries must exclude these columns. Use Supabase `.select('id, name, base_price_cents, ...')` without cost_price_cents in public queries.

### 4. Full SQL

```sql
-- ============================================================
-- MIGRATION 006: ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Admin helper function
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

-- ==========================================
-- FOUNDATION TABLES (same as Blindly)
-- ==========================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings readable by all" ON site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access to settings" ON site_settings FOR ALL USING (is_admin());

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nav readable by all" ON navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to nav" ON navigation_items FOR ALL USING (is_admin());

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published pages readable" ON pages FOR SELECT USING (is_published = true);
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
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to contacts" ON contact_submissions FOR ALL USING (is_admin());

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to subscribers" ON newsletter_subscribers FOR ALL USING (is_admin());

-- ==========================================
-- MATERIALS & SHOP TABLES
-- ==========================================

ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active materials readable" ON material_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to materials" ON material_types FOR ALL USING (is_admin());

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories readable" ON product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to categories" ON product_categories FOR ALL USING (is_admin());

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active products readable" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to products" ON products FOR ALL USING (is_admin());

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active variants readable" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to variants" ON product_variants FOR ALL USING (is_admin());

ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bulk pricing readable" ON bulk_pricing FOR SELECT USING (true);
CREATE POLICY "Admin full access to bulk pricing" ON bulk_pricing FOR ALL USING (is_admin());

ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active kits readable" ON kits FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to kits" ON kits FOR ALL USING (is_admin());

ALTER TABLE kit_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kit components readable" ON kit_components FOR SELECT USING (true);
CREATE POLICY "Admin full access to kit components" ON kit_components FOR ALL USING (is_admin());

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product relations readable" ON product_relations FOR SELECT USING (true);
CREATE POLICY "Admin full access to relations" ON product_relations FOR ALL USING (is_admin());

-- ==========================================
-- CONFIGURATOR TABLES
-- ==========================================

ALTER TABLE deck_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deck types readable" ON deck_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to deck types" ON deck_types FOR ALL USING (is_admin());

ALTER TABLE configurator_rates ENABLE ROW LEVEL SECURITY;
-- ⚠ Contains supplier_cost_cents — API must filter to customer_price_cents
CREATE POLICY "Active rates readable" ON configurator_rates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to rates" ON configurator_rates FOR ALL USING (is_admin());

ALTER TABLE board_directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active directions readable" ON board_directions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to directions" ON board_directions FOR ALL USING (is_admin());

ALTER TABLE board_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active profiles readable" ON board_profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to profiles" ON board_profiles FOR ALL USING (is_admin());

ALTER TABLE finish_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active finishes readable" ON finish_options FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to finishes" ON finish_options FOR ALL USING (is_admin());

ALTER TABLE configurator_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active extras readable" ON configurator_extras FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras" ON configurator_extras FOR ALL USING (is_admin());

ALTER TABLE extras_pricing ENABLE ROW LEVEL SECURITY;
-- ⚠ Contains supplier_cost_cents — API must filter to customer_price_cents
CREATE POLICY "Active extras pricing readable" ON extras_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras pricing" ON extras_pricing FOR ALL USING (is_admin());

ALTER TABLE board_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active board dims readable" ON board_dimensions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to board dims" ON board_dimensions FOR ALL USING (is_admin());

-- ⚠ ADMIN ONLY — markup strategy is confidential
ALTER TABLE markup_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only markup config" ON markup_config FOR ALL USING (is_admin());

-- ==========================================
-- ORDER TABLES
-- ==========================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders readable" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin full access to orders" ON orders FOR ALL USING (is_admin());

ALTER TABLE configurator_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config items readable" ON configurator_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create config items" ON configurator_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to config items" ON configurator_items FOR ALL USING (is_admin());

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items readable" ON shop_items FOR SELECT USING (true);
CREATE POLICY "Anyone can create shop items" ON shop_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to shop items" ON shop_items FOR ALL USING (is_admin());

-- ==========================================
-- QUOTES & LEADS
-- ==========================================

ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create quotes" ON saved_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Quotes readable by token" ON saved_quotes FOR SELECT USING (true);
CREATE POLICY "Admin full access to quotes" ON saved_quotes FOR ALL USING (is_admin());

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request consultations" ON consultation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to consultations" ON consultation_requests FOR ALL USING (is_admin());

ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request samples" ON sample_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to samples" ON sample_requests FOR ALL USING (is_admin());

ALTER TABLE price_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only price imports" ON price_imports FOR ALL USING (is_admin());
```

### 5. Create Admin User

After migration, create an admin user in Supabase Auth dashboard for testing. Then update their `user_profiles.role` to `'admin'`.

### 6. Verification Tests

Run these checks:

```sql
-- As anon (no auth):
SELECT * FROM markup_config;          -- Should return 0 rows (admin only)
SELECT * FROM site_settings;          -- Should return only is_public = true
SELECT * FROM material_types;         -- Should return only is_active = true
SELECT * FROM products;               -- Should return only is_active = true
SELECT * FROM configurator_rates;     -- Should return active rates (⚠ includes supplier_cost)

-- Verify insert works (guest checkout):
INSERT INTO orders (customer_name, customer_email, customer_phone, order_type, delivery_type, subtotal_cents, vat_cents, total_cents)
VALUES ('Test', 'test@test.com', '0821234567', 'shop', 'supply_deliver', 10000, 1500, 11500);
-- Should succeed

INSERT INTO contact_submissions (name, email, message)
VALUES ('Test', 'test@test.com', 'Hello');
-- Should succeed

-- As admin:
SELECT * FROM markup_config;          -- Should return all rows
SELECT * FROM configurator_rates;     -- Should return all including supplier costs
```

---

## Acceptance Criteria

```
✅ Migration runs without errors
✅ is_admin() function created
✅ RLS enabled on ALL tables (26 total across all migrations)
✅ Anon user CANNOT read markup_config
✅ Anon user CAN read active products, materials, deck types
✅ Anon user CAN read configurator_rates (⚠ API must still filter supplier costs)
✅ Anon user CAN insert orders, contact_submissions, saved_quotes, consultation_requests, sample_requests
✅ Admin CAN read and write all tables
✅ Admin test user created and verified
✅ Non-admin authenticated user redirected from /admin (middleware from Build 01)
```

---

## Notes for Claude Code

- This is the **security foundation** — get it right, everything else is safe. Get it wrong, supplier costs leak.
- The pattern is identical to Blindly — just more tables. Copy the structure, swap table names.
- The `is_admin()` function uses `SECURITY DEFINER` to bypass RLS for the check itself
- Public SELECT on configurator_rates and extras_pricing is intentional — the API layer filters out supplier_cost_cents. We don't restrict at the RLS level because the configurator needs live pricing data.
- After this build, the database is ready for seed data (Build 08). All tables exist, all policies are in place.

---

## Table Count Summary

After Build 07, the database has **27 tables**:

| Migration | Tables | Count |
|-----------|--------|-------|
| 001 Foundation | site_settings, navigation_items, pages, user_profiles, contact_submissions, newsletter_subscribers, media, activity_log | 8 |
| 002 Materials & Products | material_types, product_categories, products, product_variants, bulk_pricing, kits, kit_components, product_relations | 8 |
| 003 Configurator Rates | deck_types, configurator_rates, board_directions, board_profiles, finish_options, configurator_extras, extras_pricing, markup_config, board_dimensions | 9 |
| 004 Orders | orders, configurator_items, shop_items | 3 |
| 005 Quotes & Leads | saved_quotes, consultation_requests, sample_requests, price_imports | 4 |
| 006 RLS | (no new tables — policies on all 27 + is_admin function) | 0 |
| **Total** | | **32** |

*(Correction: 32 tables total including all)*
