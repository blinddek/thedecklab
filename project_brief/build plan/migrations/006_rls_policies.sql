-- ============================================================
-- MIGRATION 006: ROW LEVEL SECURITY POLICIES
-- Locks down all 32 tables with appropriate access levels
-- ============================================================

-- ---------------------
-- ADMIN HELPER FUNCTION
-- ---------------------
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
-- FOUNDATION TABLES (Migration 001)
-- ==========================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings readable by all" ON site_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access to settings" ON site_settings FOR ALL USING (is_admin());

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active nav readable by all" ON navigation_items FOR SELECT USING (is_active = true);
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
-- MATERIALS & SHOP TABLES (Migration 002)
-- ==========================================

ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active materials readable" ON material_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to materials" ON material_types FOR ALL USING (is_admin());

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active categories readable" ON product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to categories" ON product_categories FOR ALL USING (is_admin());

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ⚠ Contains cost_price_cents — public API queries must exclude this column
CREATE POLICY "Active products readable" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to products" ON products FOR ALL USING (is_admin());

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
-- ⚠ Contains cost_price_cents — public API queries must exclude this column
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
-- CONFIGURATOR TABLES (Migration 003)
-- ==========================================

ALTER TABLE deck_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deck types readable" ON deck_types FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to deck types" ON deck_types FOR ALL USING (is_admin());

ALTER TABLE configurator_rates ENABLE ROW LEVEL SECURITY;
-- ⚠ Contains supplier_cost_cents — public API must return customer_price_cents ONLY
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
-- ⚠ Contains supplier_cost_cents — public API must return customer_price_cents ONLY
CREATE POLICY "Active extras pricing readable" ON extras_pricing FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras pricing" ON extras_pricing FOR ALL USING (is_admin());

ALTER TABLE board_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active board dims readable" ON board_dimensions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to board dims" ON board_dimensions FOR ALL USING (is_admin());

-- ⚠ ADMIN ONLY — markup strategy is confidential, never public
ALTER TABLE markup_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only markup config" ON markup_config FOR ALL USING (is_admin());


-- ==========================================
-- ORDER TABLES (Migration 004)
-- ==========================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders readable by all" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin full access to orders" ON orders FOR ALL USING (is_admin());

ALTER TABLE configurator_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create config items" ON configurator_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Config items readable" ON configurator_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to config items" ON configurator_items FOR ALL USING (is_admin());

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create shop items" ON shop_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Shop items readable" ON shop_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to shop items" ON shop_items FOR ALL USING (is_admin());


-- ==========================================
-- QUOTES & LEADS (Migration 005)
-- ==========================================

ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create quotes" ON saved_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Quotes readable by all" ON saved_quotes FOR SELECT USING (true);
CREATE POLICY "Admin full access to quotes" ON saved_quotes FOR ALL USING (is_admin());

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request consultations" ON consultation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to consultations" ON consultation_requests FOR ALL USING (is_admin());

ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request samples" ON sample_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to samples" ON sample_requests FOR ALL USING (is_admin());

ALTER TABLE price_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only price imports" ON price_imports FOR ALL USING (is_admin());


-- ==========================================
-- STOCK DECREMENT FUNCTIONS
-- Called after payment confirmation
-- ==========================================

CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0),
      stock_status = CASE
        WHEN stock_quantity - p_quantity <= 0 THEN 'out_of_stock'
        WHEN stock_quantity - p_quantity <= low_stock_threshold THEN 'low_stock'
        ELSE stock_status
      END
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = GREATEST(stock_quantity - p_quantity, 0)
  WHERE id = p_variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
