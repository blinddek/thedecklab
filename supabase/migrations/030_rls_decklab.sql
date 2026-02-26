-- ============================================================
-- MIGRATION 030: ROW LEVEL SECURITY — DECK LAB TABLES
-- ============================================================

-- ========== MATERIALS & PRODUCTS (public read) ==========

ALTER TABLE material_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active materials readable by all" ON material_types
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to materials" ON material_types
  FOR ALL USING (is_admin());

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active variants readable by all" ON product_variants
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to variants" ON product_variants
  FOR ALL USING (is_admin());

ALTER TABLE bulk_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bulk pricing readable by all" ON bulk_pricing
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to bulk pricing" ON bulk_pricing
  FOR ALL USING (is_admin());

ALTER TABLE kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active kits readable by all" ON kits
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to kits" ON kits
  FOR ALL USING (is_admin());

ALTER TABLE kit_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Kit components readable by all" ON kit_components
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to kit components" ON kit_components
  FOR ALL USING (is_admin());

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Product relations readable by all" ON product_relations
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to product relations" ON product_relations
  FOR ALL USING (is_admin());

-- ========== CONFIGURATOR TABLES (public read) ==========

ALTER TABLE deck_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active deck types readable by all" ON deck_types
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to deck types" ON deck_types
  FOR ALL USING (is_admin());

ALTER TABLE configurator_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active rates readable by all" ON configurator_rates
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to rates" ON configurator_rates
  FOR ALL USING (is_admin());

ALTER TABLE board_directions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active directions readable by all" ON board_directions
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to directions" ON board_directions
  FOR ALL USING (is_admin());

ALTER TABLE board_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active profiles readable by all" ON board_profiles
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to profiles" ON board_profiles
  FOR ALL USING (is_admin());

ALTER TABLE finish_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active finish options readable by all" ON finish_options
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to finish options" ON finish_options
  FOR ALL USING (is_admin());

ALTER TABLE configurator_extras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active extras readable by all" ON configurator_extras
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras" ON configurator_extras
  FOR ALL USING (is_admin());

ALTER TABLE extras_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active extras pricing readable by all" ON extras_pricing
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to extras pricing" ON extras_pricing
  FOR ALL USING (is_admin());

ALTER TABLE board_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active board dimensions readable by all" ON board_dimensions
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access to board dimensions" ON board_dimensions
  FOR ALL USING (is_admin());

-- ========== ADMIN-ONLY ==========

ALTER TABLE markup_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only markup config" ON markup_config
  FOR ALL USING (is_admin());

ALTER TABLE price_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only price imports" ON price_imports
  FOR ALL USING (is_admin());

-- ========== DECK LAB ORDERS ==========

ALTER TABLE decklab_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create orders" ON decklab_orders
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders readable by all" ON decklab_orders
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to orders" ON decklab_orders
  FOR ALL USING (is_admin());

ALTER TABLE configurator_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config items readable with order" ON configurator_items
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create config items" ON configurator_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to config items" ON configurator_items
  FOR ALL USING (is_admin());

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items readable with order" ON shop_items
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create shop items" ON shop_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to shop items" ON shop_items
  FOR ALL USING (is_admin());

-- ========== QUOTES & LEADS ==========

ALTER TABLE saved_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create quotes" ON saved_quotes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Quotes readable by token" ON saved_quotes
  FOR SELECT USING (true);
CREATE POLICY "Admin full access to quotes" ON saved_quotes
  FOR ALL USING (is_admin());

ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request consultation" ON consultation_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to consultations" ON consultation_requests
  FOR ALL USING (is_admin());

ALTER TABLE sample_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request samples" ON sample_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to samples" ON sample_requests
  FOR ALL USING (is_admin());
