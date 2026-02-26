-- ============================================================
-- seed.sql — The Deck Lab starter data
-- Run after all migrations.
-- ============================================================

-- ─── Site Settings ───────────────────────────────────────────
insert into public.site_content (section_key, content) values
  ('site_settings', '{
    "logo_text": "The Deck Lab",
    "company_name": "The Deck Lab",
    "company_tagline": {"en": "Custom decking — design your deck, order materials, or get it installed.", "af": "Pasgemaakte dekke — ontwerp jou dek, bestel materiale, of laat dit installeer."},
    "login_label": {"en": "Login", "af": "Teken In"},
    "login_url": "/login",
    "cta_label": {"en": "Design Your Deck", "af": "Ontwerp Jou Dek"},
    "cta_url": "/configure",
    "whatsapp_number": "",
    "phone_number": "",
    "email": "",
    "address": "",
    "google_maps_url": "",
    "google_maps_coordinates": null,
    "business_hours": "Mon-Fri 08:00-17:00",
    "social_links": []
  }'::jsonb)
on conflict (section_key) do nothing;

-- ─── Navigation Links ────────────────────────────────────────
insert into public.nav_links (label, href, display_order, is_active, is_cta) values
  ('{"en": "Home", "af": "Tuis"}'::jsonb, '/', 1, true, false),
  ('{"en": "Shop", "af": "Winkel"}'::jsonb, '/shop', 2, true, false),
  ('{"en": "Gallery", "af": "Galery"}'::jsonb, '/gallery', 3, true, false),
  ('{"en": "About", "af": "Oor Ons"}'::jsonb, '/about', 4, true, false),
  ('{"en": "Contact", "af": "Kontak"}'::jsonb, '/contact', 5, true, false),
  ('{"en": "FAQ", "af": "Vrae"}'::jsonb, '/faq', 6, true, false),
  ('{"en": "Design Your Deck", "af": "Ontwerp Jou Dek"}'::jsonb, '/configure', 7, true, true)
on conflict do nothing;

-- ─── Footer Sections ─────────────────────────────────────────
insert into public.footer_sections (title, links, display_order, is_active) values
  (
    '{"en": "Products", "af": "Produkte"}'::jsonb,
    '[
      {"label": {"en": "Shop All", "af": "Blaai Alles"}, "href": "/shop"},
      {"label": {"en": "Deck Configurator", "af": "Dek Konfigurator"}, "href": "/configure"},
      {"label": {"en": "Gallery", "af": "Galery"}, "href": "/gallery"}
    ]'::jsonb,
    1, true
  ),
  (
    '{"en": "Company", "af": "Maatskappy"}'::jsonb,
    '[
      {"label": {"en": "About Us", "af": "Oor Ons"}, "href": "/about"},
      {"label": {"en": "Contact", "af": "Kontak"}, "href": "/contact"},
      {"label": {"en": "FAQ", "af": "Vrae"}, "href": "/faq"}
    ]'::jsonb,
    2, true
  ),
  (
    '{"en": "Legal", "af": "Regskennis"}'::jsonb,
    '[
      {"label": {"en": "Terms of Service", "af": "Diensvoorwaardes"}, "href": "/terms"},
      {"label": {"en": "Privacy Policy", "af": "Privaatheidsbeleid"}, "href": "/privacy"}
    ]'::jsonb,
    3, true
  )
on conflict do nothing;

-- ─── Page SEO ────────────────────────────────────────────────
insert into public.page_seo (page_key, title, description) values
  ('home',     '{"en": "The Deck Lab — Custom Decking, Configured & Installed", "af": "The Deck Lab — Pasgemaakte Dekke, Gekonfigureer & Geïnstalleer"}'::jsonb,
               '{"en": "Design your dream deck online. Choose materials, configure your layout, and get an instant quote — delivered or installed.", "af": "Ontwerp jou droomdek aanlyn. Kies materiale, konfigureer jou uitleg, en kry ''n onmiddellike kwotasie — afgelewer of geïnstalleer."}'::jsonb),
  ('about',    '{"en": "About The Deck Lab", "af": "Oor The Deck Lab"}'::jsonb,
               '{"en": "Part of the Nortier Group — bringing precision and craftsmanship to outdoor living.", "af": "Deel van die Nortier Groep — presisie en vakmanskap vir buite-leef."}'::jsonb),
  ('shop',     '{"en": "Shop Decking Materials", "af": "Koop Dekmateriaal"}'::jsonb,
               '{"en": "Browse our range of premium decking boards, substructure, and fixings.", "af": "Blaai deur ons reeks premium dekplanke, substruktuur, en hegstukke."}'::jsonb),
  ('gallery',  '{"en": "Project Gallery", "af": "Projek Galery"}'::jsonb,
               '{"en": "See our completed deck installations across the Western Cape.", "af": "Sien ons voltooide dekinstallasies regoor die Wes-Kaap."}'::jsonb),
  ('contact',  '{"en": "Contact Us", "af": "Kontak Ons"}'::jsonb,
               '{"en": "Get in touch for a free site visit or custom quote.", "af": "Kontak ons vir ''n gratis terreinbesoek of pasgemaakte kwotasie."}'::jsonb),
  ('faq',      '{"en": "FAQ", "af": "Vrae"}'::jsonb,
               '{"en": "Frequently asked questions about decking, materials, and installation.", "af": "Gereelde vrae oor dekke, materiale, en installasie."}'::jsonb),
  ('terms',    '{"en": "Terms of Service", "af": "Diensvoorwaardes"}'::jsonb,
               '{"en": "Our terms and conditions.", "af": "Ons bepalings en voorwaardes."}'::jsonb),
  ('privacy',  '{"en": "Privacy Policy", "af": "Privaatheidsbeleid"}'::jsonb,
               '{"en": "How we handle your data.", "af": "Hoe ons u data hanteer."}'::jsonb)
on conflict (page_key) do nothing;

-- ─── Site Content (i18n JSONB) ──────────────────────────────
insert into public.site_content (section_key, content) values
  ('hero_heading', '{"en": "Design Your Deck. Built to Last.", "af": "Ontwerp Jou Dek. Gebou om te Hou."}'::jsonb),
  ('hero_subheading', '{"en": "Custom decking — configured, quoted, and installed. Design your dream deck online or order materials for your DIY project.", "af": "Pasgemaakte dekke — gekonfigureer, gekwoteer, en geïnstalleer. Ontwerp jou droomdek aanlyn of bestel materiale vir jou DIY-projek."}'::jsonb),
  ('hero_cta_primary', '{"en": "Design Your Deck", "af": "Ontwerp Jou Dek"}'::jsonb),
  ('hero_cta_secondary', '{"en": "Browse Materials", "af": "Blaai deur Materiale"}'::jsonb),
  ('about_story', '{"en": "The Deck Lab is part of the Nortier Group, bringing the same precision and craftsmanship to outdoor living. We believe designing a deck should be as enjoyable as using one. Our online configurator lets you choose your material, design your layout, and get an instant quote — complete with an exact bill of materials down to the last screw.", "af": "The Deck Lab is deel van die Nortier Groep en bring dieselfde presisie en vakmanskap na buite-leef. Ons glo die ontwerp van ''n dek moet net so lekker wees soos om een te gebruik."}'::jsonb),
  ('trust_strip', '{"en": "Installation in WC · Delivery Nationwide · Free Build Plans · Waste Optimized", "af": "Installasie in WK · Aflewering Landwyd · Gratis Bouplanne · Vermorsing Geoptimeer"}'::jsonb),
  ('cta_heading', '{"en": "Ready? Design your deck in under 5 minutes.", "af": "Gereed? Ontwerp jou dek in minder as 5 minute."}'::jsonb),
  ('cta_text', '{"en": "Our configurator calculates everything — materials, substructure, fixings, and labour. Get an instant quote or book a free site visit.", "af": "Ons konfigurator bereken alles — materiale, substruktuur, hegstukke, en arbeid. Kry ''n onmiddellike kwotasie of bespreek ''n gratis terreinbesoek."}'::jsonb)
on conflict (section_key) do nothing;

-- ─── Homepage Sections ───────────────────────────────────────
insert into public.homepage_sections (section_key, content, display_order, is_active) values
  ('hero', '{
    "heading": {"en": "Design Your Deck. Built to Last.", "af": "Ontwerp Jou Dek. Gebou om te Hou."},
    "subheading": {"en": "Custom decking — configured, quoted, and installed. Design your dream deck online or order materials for your DIY project.", "af": "Pasgemaakte dekke — gekonfigureer, gekwoteer, en geïnstalleer. Ontwerp jou droomdek aanlyn of bestel materiale vir jou DIY-projek."},
    "cta_text": {"en": "Design Your Deck", "af": "Ontwerp Jou Dek"},
    "cta_url": "/configure",
    "cta_secondary_text": {"en": "Browse Materials", "af": "Blaai deur Materiale"},
    "cta_secondary_url": "/shop",
    "background_image": null
  }'::jsonb, 1, true),

  ('trust_strip', '{
    "text": {"en": "Installation in WC · Delivery Nationwide · Free Build Plans · Waste Optimized", "af": "Installasie in WK · Aflewering Landwyd · Gratis Bouplanne · Vermorsing Geoptimeer"}
  }'::jsonb, 2, true),

  ('services', '{
    "heading": {"en": "How It Works", "af": "Hoe Dit Werk"},
    "subheading": {"en": "From design to delivery — or full installation", "af": "Van ontwerp tot aflewering — of volledige installasie"},
    "items": [
      {"title": {"en": "Configure", "af": "Konfigureer"}, "description": {"en": "Use our online deck designer to choose materials, set dimensions, and see your layout.", "af": "Gebruik ons aanlyn dek-ontwerper om materiale te kies, afmetings te stel, en jou uitleg te sien."}},
      {"title": {"en": "Quote", "af": "Kwotasie"}, "description": {"en": "Get an instant, itemised quote with an exact bill of materials — down to the last screw.", "af": "Kry ''n onmiddellike, geïtemiseerde kwotasie met ''n presiese materiaalstaat — tot die laaste skroef."}},
      {"title": {"en": "Build", "af": "Bou"}, "description": {"en": "Order materials for DIY delivery, or book our team for professional installation.", "af": "Bestel materiale vir DIY-aflewering, of bespreek ons span vir professionele installasie."}}
    ]
  }'::jsonb, 3, true),

  ('about', '{
    "heading": {"en": "About The Deck Lab", "af": "Oor The Deck Lab"},
    "body": {"en": "The Deck Lab is part of the Nortier Group, bringing the same precision and craftsmanship to outdoor living. We believe designing a deck should be as enjoyable as using one.", "af": "The Deck Lab is deel van die Nortier Groep en bring dieselfde presisie en vakmanskap na buite-leef. Ons glo die ontwerp van ''n dek moet net so lekker wees soos om een te gebruik."},
    "image": null
  }'::jsonb, 4, true),

  ('cta', '{
    "heading": {"en": "Ready? Design your deck in under 5 minutes.", "af": "Gereed? Ontwerp jou dek in minder as 5 minute."},
    "body": {"en": "Our configurator calculates everything — materials, substructure, fixings, and labour. Get an instant quote or book a free site visit.", "af": "Ons konfigurator bereken alles — materiale, substruktuur, hegstukke, en arbeid. Kry ''n onmiddellike kwotasie of bespreek ''n gratis terreinbesoek."},
    "button_text": {"en": "Design Your Deck", "af": "Ontwerp Jou Dek"},
    "button_url": "/configure"
  }'::jsonb, 5, true)
on conflict (section_key) do nothing;

-- ─── FAQs ────────────────────────────────────────────────────
insert into public.faqs (question, answer, display_order, is_active) values
  ('{"en": "What decking materials do you offer?", "af": "Watter dekmateriaal bied julle aan?"}'::jsonb,
   '{"en": "We stock a range of premium hardwoods, treated pine, and composite decking. Each material is available in multiple profiles and finishes. Use our configurator to compare options side by side.", "af": "Ons hou ''n reeks premium houthout, behandelde denne, en saamgestelde dekke aan. Elke materiaal is beskikbaar in verskeie profiele en afwerkings. Gebruik ons konfigurator om opsies langs mekaar te vergelyk."}'::jsonb,
   1, true),
  ('{"en": "Can I order materials without installation?", "af": "Kan ek materiale sonder installasie bestel?"}'::jsonb,
   '{"en": "Absolutely. Our configurator generates a complete bill of materials that you can order for nationwide delivery. We include free build plans with every order so you can DIY with confidence.", "af": "Absoluut. Ons konfigurator genereer ''n volledige materiaalstaat wat jy kan bestel vir landwye aflewering. Ons sluit gratis bouplanne by elke bestelling in sodat jy met vertroue self kan bou."}'::jsonb,
   2, true),
  ('{"en": "Where do you install?", "af": "Waar installeer julle?"}'::jsonb,
   '{"en": "Our installation team operates throughout the Western Cape. For areas outside our service radius, we offer delivery with detailed build plans.", "af": "Ons installasiespan werk regoor die Wes-Kaap. Vir gebiede buite ons diensradius bied ons aflewering met gedetailleerde bouplanne."}'::jsonb,
   3, true),
  ('{"en": "How accurate are the online quotes?", "af": "Hoe akkuraat is die aanlyn kwotasies?"}'::jsonb,
   '{"en": "Very accurate. The configurator calculates exact quantities for boards, substructure, fixings, and edge trims based on your dimensions. Final pricing may only vary if site conditions require additional substructure work.", "af": "Baie akkuraat. Die konfigurator bereken presiese hoeveelhede vir planke, substruktuur, hegstukke, en randafwerkings gebaseer op jou afmetings. Finale pryse kan slegs wissel as terreintoestande addisionele substruktuurwerk vereis."}'::jsonb,
   4, true),
  ('{"en": "Do you offer free site visits?", "af": "Bied julle gratis terreinbesoeke aan?"}'::jsonb,
   '{"en": "Yes. For installation projects in the Western Cape, we offer a free site visit to assess the area, confirm measurements, and discuss your design preferences.", "af": "Ja. Vir installasieprojekte in die Wes-Kaap bied ons ''n gratis terreinbesoek aan om die area te assesseer, afmetings te bevestig, en jou ontwerpvoorkeure te bespreek."}'::jsonb,
   5, true)
on conflict do nothing;

-- ─── Admin User Note ─────────────────────────────────────────
-- To create an admin user:
-- 1. Sign up via the Supabase Auth dashboard or the app's register page
-- 2. Then update the role in user_profiles:
--    UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- 3. The custom_access_token_hook will pick up the role on next login.
