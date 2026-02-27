-- ============================================================
-- seed.sql — The Deck Lab site data
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
    "business_hours": "Mon-Fri 07:30-17:00, Sat 08:00-13:00",
    "social_links": []
  }'::jsonb)
on conflict (section_key) do update set content = excluded.content;

-- ─── Navigation Links ────────────────────────────────────────
delete from public.nav_links;
insert into public.nav_links (label, href, display_order, is_active) values
  ('{"en": "Home", "af": "Tuis"}'::jsonb, '/', 1, true),
  ('{"en": "Design Your Deck", "af": "Ontwerp Jou Dek"}'::jsonb, '/configure', 2, true),
  ('{"en": "Shop", "af": "Winkel"}'::jsonb, '/shop', 3, true),
  ('{"en": "Gallery", "af": "Galery"}'::jsonb, '/portfolio', 4, true),
  ('{"en": "About", "af": "Oor Ons"}'::jsonb, '/about', 5, true),
  ('{"en": "Contact", "af": "Kontak"}'::jsonb, '/contact', 6, true),
  ('{"en": "FAQ", "af": "Vrae"}'::jsonb, '/faq', 7, true);

-- ─── Footer Sections ─────────────────────────────────────────
delete from public.footer_sections;
insert into public.footer_sections (title, links, display_order, is_active) values
  (
    '{"en": "Products", "af": "Produkte"}'::jsonb,
    '[
      {"label": {"en": "Shop All", "af": "Koop Alles"}, "href": "/shop"},
      {"label": {"en": "Deck Boards", "af": "Dekplanke"}, "href": "/shop?category=boards"},
      {"label": {"en": "Substructure", "af": "Substruktuur"}, "href": "/shop?category=substructure"},
      {"label": {"en": "Fixings & Accessories", "af": "Bevestigings & Bykomstighede"}, "href": "/shop?category=fixings"},
      {"label": {"en": "Stain & Finish", "af": "Beis & Afwerking"}, "href": "/shop?category=finishing"}
    ]'::jsonb,
    1, true
  ),
  (
    '{"en": "Company", "af": "Maatskappy"}'::jsonb,
    '[
      {"label": {"en": "About Us", "af": "Oor Ons"}, "href": "/about"},
      {"label": {"en": "Gallery", "af": "Galery"}, "href": "/portfolio"},
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
  );

-- ─── Page SEO ────────────────────────────────────────────────
insert into public.page_seo (page_key, title, description) values
  ('home',     '{"en": "The Deck Lab — Custom Decking, Configured & Installed", "af": "The Deck Lab — Pasgemaakte Dekke, Gekonfigureer & Geïnstalleer"}'::jsonb,
               '{"en": "Design your dream deck online. Choose materials, configure your layout, and get an instant quote — delivered or professionally installed.", "af": "Ontwerp jou droomdek aanlyn. Kies materiale, konfigureer jou uitleg, en kry ''n onmiddellike kwotasie — afgelewer of professioneel geïnstalleer."}'::jsonb),
  ('about',    '{"en": "About The Deck Lab — Precision Decking by Nortier Group", "af": "Oor The Deck Lab — Presisie-dekke deur Nortier Group"}'::jsonb,
               '{"en": "Part of the Nortier Group — bringing precision craftsmanship and smart technology to outdoor living spaces.", "af": "Deel van die Nortier Group — ons bring presisie-vakmanskap en slim tegnologie na buitelug-leefruimtes."}'::jsonb),
  ('services', '{"en": "Deck Types — The Deck Lab", "af": "Dektipes — The Deck Lab"}'::jsonb,
               '{"en": "Ground-level, raised, pool, and balcony decks — custom designed and built to last.", "af": "Grondvlak-, verhoogde-, swembad- en balkondekke — pasgemaak ontwerp en gebou om te hou."}'::jsonb),
  ('shop',     '{"en": "Shop Decking Materials — The Deck Lab", "af": "Koop Dekmateriaal — The Deck Lab"}'::jsonb,
               '{"en": "Browse premium deck boards, substructure, fixings, and finishing products. Pine, hardwood, and composite options.", "af": "Blaai deur premium dekplanke, substruktuur, bevestigings en afwerkingsprodukte."}'::jsonb),
  ('gallery',  '{"en": "Project Gallery — The Deck Lab", "af": "Projekgalery — The Deck Lab"}'::jsonb,
               '{"en": "See our completed deck installations across the Western Cape.", "af": "Sien ons voltooide dekinstallasies regoor die Wes-Kaap."}'::jsonb),
  ('contact',  '{"en": "Contact The Deck Lab", "af": "Kontak The Deck Lab"}'::jsonb,
               '{"en": "Get in touch for a free site visit, custom quote, or material advice.", "af": "Kontak ons vir ''n gratis terreinbesoek, pasgemaakte kwotasie of materiaaladvies."}'::jsonb),
  ('faq',      '{"en": "FAQ — The Deck Lab", "af": "Vrae — The Deck Lab"}'::jsonb,
               '{"en": "Frequently asked questions about decking materials, pricing, installation, and maintenance.", "af": "Gereelde vrae oor dekmateriaal, pryse, installering en onderhoud."}'::jsonb),
  ('terms',    '{"en": "Terms of Service — The Deck Lab", "af": "Diensvoorwaardes — The Deck Lab"}'::jsonb,
               '{"en": "Terms and conditions for purchases and installations from The Deck Lab.", "af": "Terme en voorwaardes vir aankope en installasies van The Deck Lab."}'::jsonb),
  ('privacy',  '{"en": "Privacy Policy — The Deck Lab", "af": "Privaatheidsbeleid — The Deck Lab"}'::jsonb,
               '{"en": "How The Deck Lab collects, uses, and protects your personal data.", "af": "Hoe The Deck Lab jou persoonlike data versamel, gebruik en beskerm."}'::jsonb)
on conflict (page_key) do update set
  title = excluded.title,
  description = excluded.description;

-- ─── Homepage Sections ───────────────────────────────────────
delete from public.homepage_sections;
insert into public.homepage_sections (section_key, content, display_order, is_active) values
  ('hero', '{
    "heading": {"en": "Design Your Deck. Built to Last.", "af": "Ontwerp Jou Dek. Gebou om te Hou."},
    "subheading": {"en": "Custom decking — configured, quoted, and installed. Design your dream deck online or order materials for your DIY project.", "af": "Pasgemaakte dekke — gekonfigureer, gekwoteer en geïnstalleer. Ontwerp jou droomdek aanlyn of bestel materiale vir jou DIY-projek."},
    "cta_text": {"en": "Design Your Deck", "af": "Ontwerp Jou Dek"},
    "cta_url": "/configure",
    "cta_secondary_text": {"en": "Browse Materials", "af": "Blaai deur Materiale"},
    "cta_secondary_url": "/shop",
    "background_image": null
  }'::jsonb, 1, true),

  ('trust_stats', '{
    "items": [
      {"icon": "🔨", "value": "Pro", "label": {"en": "Installation in WC", "af": "Installering in WK"}},
      {"icon": "🚚", "value": "National", "label": {"en": "Materials Delivery", "af": "Materiaalaflewering"}},
      {"icon": "📋", "value": "Free", "label": {"en": "Build Plans Included", "af": "Bouplanne Ingesluit"}},
      {"icon": "♻️", "value": "<5%", "label": {"en": "Material Waste", "af": "Materiaalafval"}}
    ]
  }'::jsonb, 2, true),

  ('how_it_works', '{
    "heading": {"en": "How It Works", "af": "Hoe Dit Werk"},
    "subheading": {"en": "From design to delivery — or full professional installation.", "af": "Van ontwerp tot aflewering — of volle professionele installering."},
    "items": [
      {"step": "1", "title": {"en": "Configure", "af": "Konfigureer"}, "description": {"en": "Choose your deck type, material, dimensions, and extras using our online designer.", "af": "Kies jou dektipe, materiaal, afmetings en ekstras met ons aanlyn ontwerper."}},
      {"step": "2", "title": {"en": "Quote", "af": "Kwoteer"}, "description": {"en": "Get an instant, itemised quote with an exact bill of materials — down to the last screw.", "af": "Kry ''n onmiddellike, geïtemiseerde kwotasie met ''n presiese materiaalrekening — tot by die laaste skroef."}},
      {"step": "3", "title": {"en": "Order", "af": "Bestel"}, "description": {"en": "Pay securely online. Choose supply-only delivery or full professional installation.", "af": "Betaal veilig aanlyn. Kies slegs-voorsiening aflewering of volle professionele installering."}},
      {"step": "4", "title": {"en": "Enjoy", "af": "Geniet"}, "description": {"en": "Receive your materials with a detailed build plan, or sit back while our team builds your deck.", "af": "Ontvang jou materiale met ''n gedetailleerde bouplan, of sit terug terwyl ons span jou dek bou."}}
    ]
  }'::jsonb, 3, true),

  ('materials', '{
    "heading": {"en": "Choose Your Material", "af": "Kies Jou Materiaal"},
    "subheading": {"en": "Premium decking materials for every budget and style.", "af": "Premium dekmateriaal vir elke begroting en styl."},
    "items": [
      {
        "icon": "🌲",
        "title": {"en": "Treated Pine (CCA)", "af": "Behandelde Den (CCA)"},
        "description": {"en": "Affordable, versatile, and stainable. The most popular choice for residential decks.", "af": "Bekostigbaar, veelsydig en kleurbaar. Die gewildste keuse vir residensiële dekke."},
        "from_price": null,
        "image": null
      },
      {
        "icon": "🪵",
        "title": {"en": "Hardwood (Balau)", "af": "Balau Hardhout"},
        "description": {"en": "Dense, durable, and naturally beautiful. Rich grain with excellent weather resistance.", "af": "Dig, duursaam en natuurlik mooi. Ryk nerf met uitstekende weerbestandheid."},
        "from_price": null,
        "image": null
      },
      {
        "icon": "✨",
        "title": {"en": "Hardwood (Garapa)", "af": "Garapa Hardhout"},
        "description": {"en": "Golden tones that age beautifully. Excellent durability with a premium finish.", "af": "Goue tone wat mooi verouder. Uitstekende duursaamheid met ''n premium afwerking."},
        "from_price": null,
        "image": null
      },
      {
        "icon": "🏗️",
        "title": {"en": "Composite (WPC)", "af": "Saamgestelde (WPC)"},
        "description": {"en": "Low maintenance, consistent colour, and eco-friendly. No staining or sealing required.", "af": "Lae onderhoud, konsekwente kleur en ekovriendelik. Geen beis of verseëling nodig nie."},
        "from_price": null,
        "image": null
      }
    ]
  }'::jsonb, 4, true),

  ('services', '{
    "heading": {"en": "How It Works", "af": "Hoe Dit Werk"},
    "subheading": {"en": "From design to delivery — or full installation.", "af": "Van ontwerp tot aflewering — of volle installering."},
    "items": [
      {"title": {"en": "Configure", "af": "Konfigureer"}, "description": {"en": "Use our online deck designer to choose materials, set dimensions, and see your layout.", "af": "Gebruik ons aanlyn dekontwerper om materiale te kies, afmetings te stel en jou uitleg te sien."}},
      {"title": {"en": "Quote", "af": "Kwoteer"}, "description": {"en": "Get an instant, itemised quote with an exact bill of materials — down to the last screw.", "af": "Kry ''n onmiddellike, geïtemiseerde kwotasie met ''n presiese materiaalrekening — tot by die laaste skroef."}},
      {"title": {"en": "Build", "af": "Bou"}, "description": {"en": "Order materials for DIY delivery, or book our team for professional installation.", "af": "Bestel materiale vir DIY-aflewering, of bespreek ons span vir professionele installering."}}
    ]
  }'::jsonb, 5, true),

  ('about', '{
    "heading": {"en": "About The Deck Lab", "af": "Oor The Deck Lab"},
    "body": {"en": "Part of the Nortier Group, The Deck Lab brings decades of craftsmanship and precision to outdoor living. We believe designing a deck should be as enjoyable as using one.", "af": "Deel van die Nortier Group, The Deck Lab bring dekades se vakmanskap en presisie na buitelug-leefruimtes. Ons glo die ontwerp van ''n dek moet net so lekker wees soos om een te gebruik."}
  }'::jsonb, 6, true),

  ('cta', '{
    "heading": {"en": "Ready? Design your deck in under 5 minutes.", "af": "Gereed? Ontwerp jou dek in minder as 5 minute."},
    "body": {"en": "Our configurator calculates everything — materials, substructure, fixings, and labour. Get an instant quote or book a free site visit.", "af": "Ons konfigurator bereken alles — materiale, substruktuur, bevestigings en arbeid. Kry ''n onmiddellike kwotasie of bespreek ''n gratis terreinbesoek."},
    "button_text": {"en": "Design Your Deck", "af": "Ontwerp Jou Dek"},
    "button_url": "/configure"
  }'::jsonb, 7, true);

-- ─── Trust Strip (key-value) ─────────────────────────────────
insert into public.site_content (section_key, content) values
  ('trust_strip', '{"values": ["Installation in Western Cape", "Delivery Nationwide", "Free Build Plans", "Waste Optimized", "Exact Bill of Materials"]}'::jsonb)
on conflict (section_key) do update set content = excluded.content;

-- ─── About Page Content ──────────────────────────────────────
insert into public.site_content (section_key, content) values
  ('about', '{
    "heading": {"en": "About The Deck Lab", "af": "Oor The Deck Lab"},
    "mission": {"en": "Making custom decking accessible — design online, get exact pricing, and choose supply-only or full installation.", "af": "Pasgemaakte dekke toeganklik maak — ontwerp aanlyn, kry presiese pryse, en kies slegs-voorsiening of volle installering."},
    "body": {"en": "The Deck Lab was born from a simple idea: building a deck shouldn''t require guesswork. Traditional quotes involve site visits, phone tag, and vague estimates. We knew technology could do better.\n\nOur online configurator lets you design your deck step by step. Choose your material — treated pine, Balau hardwood, Garapa, or composite. Set your dimensions. See your layout with board-by-board precision. Get an instant quote that includes every board, joist, bearer, screw, and spacer.\n\nWe don''t estimate. We calculate. Our board layout engine optimises cuts to minimise waste (typically under 5%), recommends the right board width to avoid ugly ripped edges, and generates a complete build plan you can follow or hand to your contractor.\n\nFor homeowners in the Western Cape, we offer full professional installation — from foundation to final stain. For DIY builders and contractors anywhere in South Africa, we supply cut-to-spec materials with nationwide delivery and detailed build plans.\n\nThe Deck Lab is part of the Nortier Group, bringing decades of home improvement experience and craftsmanship into the digital age.", "af": "The Deck Lab is gebore uit ''n eenvoudige idee: die bou van ''n dek moenie raaiwerk vereis nie. Tradisionele kwotasies behels terreinbesoeke, telefoontjies heen en weer, en vae ramings. Ons het geweet tegnologie kan dit beter doen.\n\nOns aanlyn konfigurator laat jou toe om jou dek stap vir stap te ontwerp. Kies jou materiaal — behandelde den, Balau hardhout, Garapa, of saamgestelde. Stel jou afmetings. Sien jou uitleg met plank-vir-plank presisie. Kry ''n onmiddellike kwotasie wat elke plank, dwarsbalk, draer, skroef en afstandhouer insluit.\n\nOns raam nie. Ons bereken. Ons plankuitleg-enjin optimeer snitte om afval te minimeer (tipies onder 5%), beveel die regte plankwydte aan om lelike geskeurde rande te vermy, en genereer ''n volledige bouplan wat jy kan volg of aan jou kontrakteur kan gee.\n\nVir huiseienaars in die Wes-Kaap bied ons volle professionele installering — van fondasie tot finale beis. Vir DIY-bouers en kontrakteurs enige plek in Suid-Afrika voorsien ons materiale gesny volgens spesifikasie met nasionale aflewering en gedetailleerde bouplanne.\n\nThe Deck Lab is deel van die Nortier Group, wat dekades se huisverbeteringservaring en vakmanskap na die digitale era bring."},
    "process": [
      {"step": "1", "title": {"en": "Configure", "af": "Konfigureer"}, "description": {"en": "Use our guided wizard to choose your deck type, material, dimensions, board direction, colour, and extras.", "af": "Gebruik ons geleide towenaar om jou dektipe, materiaal, afmetings, plankrigting, kleur en ekstras te kies."}},
      {"step": "2", "title": {"en": "Quote", "af": "Kwoteer"}, "description": {"en": "See your price update in real time. Get an exact bill of materials — boards, joists, bearers, fixings, stain.", "af": "Sien jou prys intyds opdateer. Kry ''n presiese materiaalrekening — planke, dwarsbalke, draers, bevestigings, beis."}},
      {"step": "3", "title": {"en": "Order", "af": "Bestel"}, "description": {"en": "Pay securely online. Choose supply-only (shipped nationally) or full installation (Western Cape).", "af": "Betaal veilig aanlyn. Kies slegs-voorsiening (nasionaal versend) of volle installering (Wes-Kaap)."}},
      {"step": "4", "title": {"en": "Build", "af": "Bou"}, "description": {"en": "Receive your materials with a 7-page build plan, or sit back while our team handles everything.", "af": "Ontvang jou materiale met ''n 7-bladsy bouplan, of sit terug terwyl ons span alles hanteer."}}
    ],
    "values": [
      {"title": {"en": "Exact, Not Estimated", "af": "Presies, Nie Geraam Nie"}, "description": {"en": "Our configurator calculates every board, joist, and screw. No vague m² estimates — you see exactly what you''re getting.", "af": "Ons konfigurator bereken elke plank, dwarsbalk en skroef. Geen vae m²-ramings nie — jy sien presies wat jy kry."}},
      {"title": {"en": "Waste Optimised", "af": "Afval Geoptimeer"}, "description": {"en": "Our board layout engine reuses offcuts intelligently. Typical waste is under 5%, saving you money and materials.", "af": "Ons plankuitleg-enjin hergebruik afsnysels slim. Tipiese afval is onder 5%, wat jou geld en materiale bespaar."}},
      {"title": {"en": "Instant Pricing", "af": "Onmiddellike Pryse"}, "description": {"en": "No waiting for callbacks or site visits. Configure your deck and see your price update in real time.", "af": "Geen wag vir terugbelle of terreinbesoeke nie. Konfigureer jou dek en sien jou prys intyds opdateer."}},
      {"title": {"en": "Supply or Install", "af": "Voorsien of Installeer"}, "description": {"en": "Full installation in the Western Cape, or supply-only with nationwide delivery. Your choice.", "af": "Volle installering in die Wes-Kaap, of slegs-voorsiening met nasionale aflewering. Jou keuse."}},
      {"title": {"en": "Free Build Plans", "af": "Gratis Bouplanne"}, "description": {"en": "Every order includes a detailed 7-page build plan with board layout, substructure, cut list, and installation notes.", "af": "Elke bestelling sluit ''n gedetailleerde 7-bladsy bouplan in met plankuitleg, substruktuur, snylys en installeringnotas."}},
      {"title": {"en": "Part of Nortier Group", "af": "Deel van Nortier Group"}, "description": {"en": "Backed by decades of home improvement experience. Quality craftsmanship meets modern technology.", "af": "Gerugsteun deur dekades se huisverbeteringservaring. Kwaliteit vakmanskap ontmoet moderne tegnologie."}}
    ],
    "service_area": {"en": "We install decks throughout the Western Cape — Paarl, Stellenbosch, Franschhoek, Somerset West, Cape Town, and surrounding areas. Materials can be delivered anywhere in South Africa.", "af": "Ons installeer dekke regoor die Wes-Kaap — Paarl, Stellenbosch, Franschhoek, Somerset West, Kaapstad en omliggende gebiede. Materiale kan enige plek in Suid-Afrika afgelewer word."}
  }'::jsonb)
on conflict (section_key) do update set content = excluded.content;

-- ─── Services Detail ─────────────────────────────────────────
insert into public.site_content (section_key, content) values
  ('services_detail', '{
    "heading": {"en": "Deck Types", "af": "Dektipes"},
    "intro": {"en": "Whether you''re building on flat ground, a slope, around a pool, or on a balcony — we''ve got a solution for every space.", "af": "Of jy op plat grond bou, ''n helling, rondom ''n swembad, of op ''n balkon — ons het ''n oplossing vir elke ruimte."},
    "items": [
      {
        "icon": "🏡",
        "title": {"en": "Ground-Level Decks", "af": "Grondvlakdekke"},
        "description": {"en": "The most popular option for flat gardens, patios, and outdoor living areas. Built directly on or close to ground level with a low-profile substructure.\n\nIdeal for entertainment areas, braai spaces, or extending your indoor living outdoors. Quick to build and cost-effective.", "af": "Die gewildste opsie vir plat tuine, patio''s en buitelug-leefruimtes. Gebou direk op of naby grondvlak met ''n laeprofiel-substruktuur.\n\nIdeaal vir vermaakgebiede, braai-ruimtes, of om jou binnenshuise leefruimte buitentoe uit te brei. Vinnig om te bou en koste-effektief."},
        "features": ["Flat gardens", "Patios", "Entertainment areas", "Pool surrounds", "Cost-effective"]
      },
      {
        "icon": "📐",
        "title": {"en": "Raised Decks", "af": "Verhoogde Dekke"},
        "description": {"en": "Perfect for sloped gardens, elevated terraces, or when you need to match an indoor floor level. Built on posts and bearers with a full structural substructure.\n\nRaised decks create usable outdoor space on otherwise difficult terrain and can include integrated steps, railings, and storage underneath.", "af": "Perfek vir skuins tuine, verhoogde terrasse, of wanneer jy ''n binnenshuise vloervlak moet ewenaar. Gebou op pale en draers met ''n volle strukturele substruktuur.\n\nVerhoogde dekke skep bruikbare buitelug-ruimte op andersins moeilike terrein en kan geïntegreerde trappe, relings en berging onderaan insluit."},
        "features": ["Sloped gardens", "Elevated terraces", "Multi-level", "Under-deck storage", "Integrated steps"]
      },
      {
        "icon": "🏊",
        "title": {"en": "Pool Decks", "af": "Swembaddekke"},
        "description": {"en": "Designed specifically for wet environments. Non-slip profiles, proper drainage, and moisture-resistant materials ensure safety and durability around your pool.\n\nWe recommend grooved board profiles and composite or treated hardwood for maximum longevity in pool environments.", "af": "Spesifiek ontwerp vir nat omgewings. Anti-glip profiele, behoorlike dreinering en vogbestande materiale verseker veiligheid en duursaamheid rondom jou swembad.\n\nOns beveel gegroefde plankprofiele en saamgestelde of behandelde hardhout aan vir maksimum lewensduur in swembadomgewings."},
        "features": ["Non-slip profiles", "Drainage design", "Moisture resistant", "Composite or hardwood", "Chemical resistant"]
      },
      {
        "icon": "🏢",
        "title": {"en": "Balcony & Rooftop Decks", "af": "Balkon- & Dakdekke"},
        "description": {"en": "Overlay decking for concrete balconies, rooftops, and flat roofs. Built on adjustable pedestals — no drilling into the existing surface required.\n\nPedestal systems allow for drainage underneath and can compensate for uneven surfaces. Lightweight composite boards are often ideal for these applications.", "af": "Oorleg-dekke vir beton balkonne, dakke en plat dakke. Gebou op verstelbare voetstukkies — geen boor in die bestaande oppervlak nodig nie.\n\nVoetstukkiesisteme maak dreinering onderaan moontlik en kan ongelyke oppervlaktes vergoed. Liggewig saamgestelde planke is dikwels ideaal vir hierdie toepassings."},
        "features": ["Pedestal system", "No drilling", "Drainage underneath", "Level correction", "Lightweight options"]
      }
    ]
  }'::jsonb)
on conflict (section_key) do update set content = excluded.content;

-- ─── FAQs ────────────────────────────────────────────────────
delete from public.faqs;
insert into public.faqs (question, answer, display_order, is_active) values
  -- Materials
  ('{"en": "What decking materials do you offer?", "af": "Watter dekmateriaal bied julle aan?"}'::jsonb,
   '{"en": "We offer four material categories: Treated Pine (CCA) — affordable and versatile, Balau Hardwood — dense and naturally durable, Garapa Hardwood — golden tones with excellent longevity, and Composite (WPC) — low maintenance with no staining required. Each is available in multiple profiles and dimensions.", "af": "Ons bied vier materiaalkategorieë aan: Behandelde Den (CCA) — bekostigbaar en veelsydig, Balau Hardhout — dig en natuurlik duursaam, Garapa Hardhout — goue tone met uitstekende lewensduur, en Saamgestelde (WPC) — lae onderhoud sonder beis nodig. Elk is beskikbaar in verskeie profiele en afmetings."}'::jsonb,
   1, true),

  ('{"en": "What''s the difference between pine, hardwood, and composite?", "af": "Wat is die verskil tussen den, hardhout en saamgestelde?"}'::jsonb,
   '{"en": "Treated pine is the most affordable option — it''s versatile and takes stain well, but needs regular maintenance (re-staining every 1-2 years). Hardwood (Balau/Garapa) is naturally durable and weather-resistant, with a beautiful grain, but costs more. Composite is the most expensive upfront but requires virtually zero maintenance — no staining, sealing, or sanding. Our configurator lets you compare prices for all materials side by side.", "af": "Behandelde den is die bekostigbaarste opsie — dit is veelsydig en neem beis goed aan, maar vereis gereelde onderhoud (herbeis elke 1-2 jaar). Hardhout (Balau/Garapa) is natuurlik duursaam en weerbestand, met ''n pragtige nerf, maar kos meer. Saamgestelde is die duurste vooraf, maar vereis feitlik geen onderhoud nie — geen beis, verseëling of skuur nie. Ons konfigurator laat jou toe om pryse vir alle materiale langs mekaar te vergelyk."}'::jsonb,
   2, true),

  ('{"en": "How long will my deck last?", "af": "Hoe lank sal my dek hou?"}'::jsonb,
   '{"en": "With proper maintenance: Treated Pine 15-20 years, Hardwood (Balau/Garapa) 25-40 years, Composite 25+ years. Lifespan depends on exposure, maintenance, and installation quality. We provide maintenance guides with every build plan.", "af": "Met behoorlike onderhoud: Behandelde Den 15-20 jaar, Hardhout (Balau/Garapa) 25-40 jaar, Saamgestelde 25+ jaar. Lewensduur hang af van blootstelling, onderhoud en installeringskwaliteit. Ons voorsien onderhoudsgidse met elke bouplan."}'::jsonb,
   3, true),

  -- Pricing
  ('{"en": "How is pricing calculated?", "af": "Hoe word pryse bereken?"}'::jsonb,
   '{"en": "Our configurator calculates exact quantities based on your dimensions — every board, joist, bearer, screw, and spacer. Pricing factors include material type, deck area, board direction (diagonal uses ~10% more material), extras (steps, railings), and installation if selected. The price you see is the price you pay.", "af": "Ons konfigurator bereken presiese hoeveelhede gebaseer op jou afmetings — elke plank, dwarsbalk, draer, skroef en afstandhouer. Prysfaktore sluit in materiaaltipe, dekoppervlakte, plankrigting (diagonaal gebruik ~10% meer materiaal), ekstras (trappe, relings), en installering indien gekies. Die prys wat jy sien, is die prys wat jy betaal."}'::jsonb,
   4, true),

  ('{"en": "Why does diagonal board direction cost more?", "af": "Hoekom kos diagonale plankrigting meer?"}'::jsonb,
   '{"en": "Diagonal boards require approximately 10% more material due to angled cuts at the edges, and herringbone/chevron patterns use about 15% more. Our configurator accounts for this automatically and shows you the exact difference in price.", "af": "Diagonale planke vereis ongeveer 10% meer materiaal weens hoeksnitte aan die rande, en visgraat-/chevron-patrone gebruik ongeveer 15% meer. Ons konfigurator verreken dit outomaties en wys jou die presiese prysverskil."}'::jsonb,
   5, true),

  -- Installation
  ('{"en": "Do you install outside the Western Cape?", "af": "Installeer julle buite die Wes-Kaap?"}'::jsonb,
   '{"en": "Currently, our installation team operates throughout the Western Cape — Paarl, Stellenbosch, Franschhoek, Somerset West, Cape Town, and surrounding areas. For other regions, we offer supply-only with nationwide delivery and a detailed 7-page build plan so you or your contractor can install with confidence.", "af": "Tans bedryf ons installeringspan regoor die Wes-Kaap — Paarl, Stellenbosch, Franschhoek, Somerset West, Kaapstad en omliggende gebiede. Vir ander streke bied ons slegs-voorsiening aan met nasionale aflewering en ''n gedetailleerde 7-bladsy bouplan sodat jy of jou kontrakteur met vertroue kan installeer."}'::jsonb,
   6, true),

  ('{"en": "How long does installation take?", "af": "Hoe lank neem installering?"}'::jsonb,
   '{"en": "A typical ground-level deck (15-25m²) takes 2-3 days. Raised decks and more complex designs may take 4-5 days. We''ll confirm the timeline after the free site visit. Installation includes all materials, labour, and cleanup.", "af": "''n Tipiese grondvlakdek (15-25m²) neem 2-3 dae. Verhoogde dekke en meer komplekse ontwerpe kan 4-5 dae neem. Ons sal die tydlyn bevestig na die gratis terreinbesoek. Installering sluit alle materiale, arbeid en skoonmaak in."}'::jsonb,
   7, true),

  ('{"en": "Can I order materials without installation?", "af": "Kan ek materiale bestel sonder installering?"}'::jsonb,
   '{"en": "Absolutely. Our supply-only option delivers cut-to-spec materials anywhere in South Africa. Every order includes a free 7-page build plan with board layout, substructure diagram, cut list, screw pattern, and installation notes — everything you or your contractor needs to build.", "af": "Absoluut. Ons slegs-voorsiening opsie lewer materiale gesny volgens spesifikasie enige plek in Suid-Afrika af. Elke bestelling sluit ''n gratis 7-bladsy bouplan in met plankuitleg, substruktuurdiagram, snylys, skroefpatroon en installeringnotas — alles wat jy of jou kontrakteur nodig het om te bou."}'::jsonb,
   8, true),

  -- Maintenance
  ('{"en": "How do I maintain my deck?", "af": "Hoe onderhou ek my dek?"}'::jsonb,
   '{"en": "For timber decks: clean with a deck-specific cleaner annually, and re-stain every 1-2 years (pine) or apply oil annually (hardwood). Avoid pressure washing at high pressure as it can damage the wood grain. Composite decks only need occasional washing with soapy water. We include a maintenance guide with every build plan.", "af": "Vir houtdekke: maak jaarliks skoon met ''n dekspesifieke reiniger, en herbeis elke 1-2 jaar (den) of smeer jaarliks olie aan (hardhout). Vermy hoëdruk-spuit aangesien dit die houtnerf kan beskadig. Saamgestelde dekke benodig slegs af en toe ''n was met seepwater. Ons sluit ''n onderhoudsgids by elke bouplan in."}'::jsonb,
   9, true),

  -- Delivery
  ('{"en": "How long does delivery take?", "af": "Hoe lank neem aflewering?"}'::jsonb,
   '{"en": "Materials are typically delivered within 5-10 business days, depending on your location and product availability. Western Cape deliveries are usually faster. You''ll receive tracking information once your order ships.", "af": "Materiale word tipies binne 5-10 werksdae afgelewer, afhangende van jou ligging en produkbeskikbaarheid. Wes-Kaap aflewerings is gewoonlik vinniger. Jy sal opsporingsinligting ontvang sodra jou bestelling versend word."}'::jsonb,
   10, true),

  ('{"en": "Do you offer free site visits?", "af": "Bied julle gratis terreinbesoeke aan?"}'::jsonb,
   '{"en": "Yes, for installation projects in the Western Cape we offer a free site visit to assess the area, confirm measurements, check for any site-specific requirements, and discuss your design preferences. Book via our contact page or configurator.", "af": "Ja, vir installeringsprojekte in die Wes-Kaap bied ons ''n gratis terreinbesoek aan om die area te assesseer, afmetings te bevestig, vir enige terreinspesifieke vereistes te kyk, en jou ontwerpvoorkeure te bespreek. Bespreek via ons kontakbladsy of konfigurator."}'::jsonb,
   11, true),

  ('{"en": "How accurate are the online quotes?", "af": "Hoe akkuraat is die aanlyn kwotasies?"}'::jsonb,
   '{"en": "Very accurate. The configurator calculates exact quantities for boards, substructure, fixings, and trims based on your dimensions. Final pricing may only vary if a site visit reveals additional substructure requirements (e.g., significant slope or poor soil conditions).", "af": "Baie akkuraat. Die konfigurator bereken presiese hoeveelhede vir planke, substruktuur, bevestigings en afwerkings gebaseer op jou afmetings. Finale pryse kan slegs verskil as ''n terreinbesoek addisionele substruktuurvereistes onthul (bv. beduidende helling of swak grondtoestande)."}'::jsonb,
   12, true);

-- ─── Legacy Key-Value Content ────────────────────────────────
insert into public.site_content (section_key, content) values
  ('hero_heading',       '{"en": "Design Your Deck. Built to Last.", "af": "Ontwerp Jou Dek. Gebou om te Hou."}'::jsonb),
  ('hero_subheading',    '{"en": "Custom decking — configured, quoted, and installed. Design your dream deck online or order materials for your DIY project.", "af": "Pasgemaakte dekke — gekonfigureer, gekwoteer en geïnstalleer. Ontwerp jou droomdek aanlyn of bestel materiale vir jou DIY-projek."}'::jsonb),
  ('hero_cta_primary',   '{"en": "Design Your Deck", "af": "Ontwerp Jou Dek"}'::jsonb),
  ('hero_cta_secondary', '{"en": "Browse Materials", "af": "Blaai deur Materiale"}'::jsonb),
  ('cta_heading',        '{"en": "Ready? Design your deck in under 5 minutes.", "af": "Gereed? Ontwerp jou dek in minder as 5 minute."}'::jsonb),
  ('cta_text',           '{"en": "Our configurator calculates everything — materials, substructure, fixings, and labour. Get an instant quote or book a free site visit.", "af": "Ons konfigurator bereken alles — materiale, substruktuur, bevestigings en arbeid. Kry ''n onmiddellike kwotasie of bespreek ''n gratis terreinbesoek."}'::jsonb)
on conflict (section_key) do update set content = excluded.content;

-- ============================================================
-- CONFIGURATOR SEED DATA
-- ============================================================

-- ─── Material Types ────────────────────────────────────────
insert into public.material_types (id, name, slug, description, durability_rating, maintenance_level, lifespan_years_min, lifespan_years_max, is_composite, display_order, is_active) values
  ('mt-pine',      '{"en":"Treated Pine (CCA)","af":"Behandelde Den"}'::jsonb,       'treated-pine',  '{"en":"Affordable, versatile, and stainable. The most popular choice for residential decks.","af":"Bekostigbaar, veelsydig en kleurbaar."}'::jsonb, 3, 'medium', 15, 20, false, 1, true),
  ('mt-balau',     '{"en":"Balau Hardwood","af":"Balau Hardhout"}'::jsonb,            'balau',         '{"en":"Dense, durable, and naturally beautiful. Rich grain with excellent weather resistance.","af":"Dig, duursaam en natuurlik mooi."}'::jsonb, 5, 'low', 25, 40, false, 2, true),
  ('mt-garapa',    '{"en":"Garapa Hardwood","af":"Garapa Hardhout"}'::jsonb,          'garapa',        '{"en":"Golden tones that age beautifully. Excellent durability with a premium finish.","af":"Goue tone wat mooi verouder."}'::jsonb, 4, 'low', 25, 35, false, 3, true),
  ('mt-composite', '{"en":"Composite (WPC)","af":"Saamgestelde (WPC)"}'::jsonb,      'composite',     '{"en":"Low maintenance, consistent colour, and eco-friendly. No staining or sealing required.","af":"Lae onderhoud, konsekwente kleur en ekovriendelik."}'::jsonb, 5, 'none', 25, 50, true, 4, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, durability_rating=excluded.durability_rating, maintenance_level=excluded.maintenance_level, lifespan_years_min=excluded.lifespan_years_min, lifespan_years_max=excluded.lifespan_years_max, is_composite=excluded.is_composite, display_order=excluded.display_order;

-- ─── Deck Types ────────────────────────────────────────────
insert into public.deck_types (id, name, slug, description, image_url, complexity_multiplier, labour_complexity_multiplier, applicable_extras, display_order, is_active) values
  ('dt-ground',   '{"en":"Ground-Level Deck","af":"Grondvlak Dek"}'::jsonb,   'ground-level', '{"en":"Built directly on or close to ground level. Ideal for patios and entertainment areas.","af":"Gebou direk op of naby grondvlak. Ideaal vir patio''s en vermaakgebiede."}'::jsonb, null, 1.0, 1.0, '{}', 1, true),
  ('dt-raised',   '{"en":"Raised Deck","af":"Verhoogde Dek"}'::jsonb,         'raised',       '{"en":"Built on posts and bearers for sloped gardens or elevated terraces.","af":"Gebou op pale en draers vir skuins tuine of verhoogde terrasse."}'::jsonb, null, 1.25, 1.3, '{}', 2, true),
  ('dt-pool',     '{"en":"Pool Deck","af":"Swembad Dek"}'::jsonb,             'pool',         '{"en":"Designed for wet environments with non-slip profiles and drainage.","af":"Ontwerp vir nat omgewings met anti-glip profiele en dreinering."}'::jsonb, null, 1.15, 1.2, '{}', 3, true),
  ('dt-balcony',  '{"en":"Balcony / Rooftop","af":"Balkon / Dakdek"}'::jsonb, 'balcony',      '{"en":"Overlay decking on pedestals — no drilling into existing surfaces.","af":"Oorleg-dekke op voetstukkies — geen boor in bestaande oppervlaktes nie."}'::jsonb, null, 1.3, 1.35, '{}', 4, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, complexity_multiplier=excluded.complexity_multiplier, labour_complexity_multiplier=excluded.labour_complexity_multiplier, display_order=excluded.display_order;

-- ─── Board Directions ──────────────────────────────────────
insert into public.board_directions (id, name, slug, description, image_url, material_multiplier, labour_multiplier, display_order, is_active) values
  ('bd-straight',    '{"en":"Straight","af":"Reguit"}'::jsonb,           'straight',    '{"en":"Boards run parallel to the longest edge. Most efficient use of materials."}'::jsonb, null, 1.0,  1.0,  1, true),
  ('bd-diagonal',    '{"en":"Diagonal (45°)","af":"Diagonaal (45°)"}'::jsonb, 'diagonal', '{"en":"Boards at 45° angle. Uses ~10% more material due to angled cuts."}'::jsonb, null, 1.10, 1.10, 2, true),
  ('bd-herringbone', '{"en":"Herringbone","af":"Visgraat"}'::jsonb,      'herringbone', '{"en":"Classic V-pattern. Uses ~15% more material and takes longer to install."}'::jsonb, null, 1.15, 1.25, 3, true),
  ('bd-chevron',     '{"en":"Chevron","af":"Chevron"}'::jsonb,           'chevron',     '{"en":"Mitre-cut V-pattern for a clean point. Premium look with higher material use."}'::jsonb, null, 1.15, 1.30, 4, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, material_multiplier=excluded.material_multiplier, labour_multiplier=excluded.labour_multiplier, display_order=excluded.display_order;

-- ─── Board Profiles ────────────────────────────────────────
insert into public.board_profiles (id, name, slug, description, image_url, price_modifier_percent, display_order, is_active) values
  ('bp-smooth',  '{"en":"Smooth (Planed)","af":"Glad (Geskaafd)"}'::jsonb, 'smooth',  '{"en":"Clean, contemporary finish. Best for barefoot comfort."}'::jsonb, null, 0,  1, true),
  ('bp-grooved', '{"en":"Grooved (Anti-slip)","af":"Gegroef (Anti-glip)"}'::jsonb, 'grooved', '{"en":"Channels for grip and drainage. Recommended for pool and wet areas."}'::jsonb, null, 5,  2, true),
  ('bp-brushed', '{"en":"Brushed (Textured)","af":"Geborstel (Tekstuur)"}'::jsonb, 'brushed', '{"en":"Wire-brushed texture for a natural, rustic look with good grip."}'::jsonb, null, 8, 3, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, price_modifier_percent=excluded.price_modifier_percent, display_order=excluded.display_order;

-- ─── Finish Options (per material) ─────────────────────────
insert into public.finish_options (id, material_type_id, name, slug, hex_colour, price_modifier_cents, display_order, is_active) values
  -- Pine finishes
  ('fo-pine-natural',   'mt-pine', '{"en":"Natural (Unfinished)","af":"Natuurlik"}'::jsonb,     'natural',       null,     0,      1, true),
  ('fo-pine-clear',     'mt-pine', '{"en":"Clear Seal","af":"Deursigtige Seël"}'::jsonb,        'clear-seal',    null,     4500,   2, true),
  ('fo-pine-honey',     'mt-pine', '{"en":"Honey Oak Stain","af":"Heuningeik Beis"}'::jsonb,    'honey-oak',     '#C4963A', 5500,  3, true),
  ('fo-pine-walnut',    'mt-pine', '{"en":"Dark Walnut Stain","af":"Donker Okkerneut"}'::jsonb, 'dark-walnut',   '#5C3A1E', 5500,  4, true),
  ('fo-pine-charcoal',  'mt-pine', '{"en":"Charcoal Stain","af":"Houtskool Beis"}'::jsonb,     'charcoal',      '#3A3A3A', 5500,  5, true),
  -- Balau finishes
  ('fo-balau-natural',  'mt-balau', '{"en":"Natural (Oil)","af":"Natuurlik (Olie)"}'::jsonb,    'natural-oil',   '#8B6B3D', 3500,  1, true),
  ('fo-balau-teak',     'mt-balau', '{"en":"Teak Oil","af":"Teak Olie"}'::jsonb,                'teak-oil',      '#A67C52', 4500,  2, true),
  -- Garapa finishes
  ('fo-garapa-natural', 'mt-garapa', '{"en":"Natural (Oil)","af":"Natuurlik (Olie)"}'::jsonb,   'garapa-natural', '#C4A04A', 3500, 1, true),
  ('fo-garapa-golden',  'mt-garapa', '{"en":"Golden Oil","af":"Goue Olie"}'::jsonb,             'golden-oil',    '#D4B04A', 4500,  2, true),
  -- Composite finishes (colour is built in)
  ('fo-comp-teak',      'mt-composite', '{"en":"Teak","af":"Teak"}'::jsonb,                     'comp-teak',     '#A67C52', 0,     1, true),
  ('fo-comp-grey',      'mt-composite', '{"en":"Stone Grey","af":"Klipgrys"}'::jsonb,           'comp-grey',     '#8A8A82', 0,     2, true),
  ('fo-comp-charcoal',  'mt-composite', '{"en":"Charcoal","af":"Houtskool"}'::jsonb,            'comp-charcoal', '#4A4A48', 0,     3, true),
  ('fo-comp-walnut',    'mt-composite', '{"en":"Walnut","af":"Okkerneut"}'::jsonb,              'comp-walnut',   '#6B4E37', 0,     4, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, hex_colour=excluded.hex_colour, price_modifier_cents=excluded.price_modifier_cents, display_order=excluded.display_order;

-- ─── Configurator Rates (per material × rate type) ─────────
-- Prices in cents per m²
insert into public.configurator_rates (id, material_type_id, rate_type, supplier_cost_cents, customer_price_cents, unit, is_active) values
  -- Pine rates
  ('cr-pine-boards',  'mt-pine', 'boards_per_m2',       45000,  63000,  'per_m2', true),
  ('cr-pine-sub',     'mt-pine', 'substructure_per_m2', 18000,  25200,  'per_m2', true),
  ('cr-pine-fix',     'mt-pine', 'fixings_per_m2',       4500,   6300,  'per_m2', true),
  ('cr-pine-labour',  'mt-pine', 'labour_per_m2',       25000,  35000,  'per_m2', true),
  ('cr-pine-stain',   'mt-pine', 'staining_per_m2',      3500,   5000,  'per_m2', true),
  -- Balau rates
  ('cr-balau-boards', 'mt-balau', 'boards_per_m2',       85000, 119000, 'per_m2', true),
  ('cr-balau-sub',    'mt-balau', 'substructure_per_m2',  22000,  30800, 'per_m2', true),
  ('cr-balau-fix',    'mt-balau', 'fixings_per_m2',        5500,   7700, 'per_m2', true),
  ('cr-balau-labour', 'mt-balau', 'labour_per_m2',        32000,  44800, 'per_m2', true),
  ('cr-balau-stain',  'mt-balau', 'staining_per_m2',       3000,   4200, 'per_m2', true),
  -- Garapa rates
  ('cr-garapa-boards','mt-garapa', 'boards_per_m2',       78000, 109200, 'per_m2', true),
  ('cr-garapa-sub',   'mt-garapa', 'substructure_per_m2',  22000,  30800, 'per_m2', true),
  ('cr-garapa-fix',   'mt-garapa', 'fixings_per_m2',        5500,   7700, 'per_m2', true),
  ('cr-garapa-labour','mt-garapa', 'labour_per_m2',        30000,  42000, 'per_m2', true),
  ('cr-garapa-stain', 'mt-garapa', 'staining_per_m2',       3000,   4200, 'per_m2', true),
  -- Composite rates
  ('cr-comp-boards',  'mt-composite', 'boards_per_m2',      95000, 133000, 'per_m2', true),
  ('cr-comp-sub',     'mt-composite', 'substructure_per_m2', 20000,  28000, 'per_m2', true),
  ('cr-comp-fix',     'mt-composite', 'fixings_per_m2',       6000,   8400, 'per_m2', true),
  ('cr-comp-labour',  'mt-composite', 'labour_per_m2',       28000,  39200, 'per_m2', true)
on conflict (id) do update set supplier_cost_cents=excluded.supplier_cost_cents, customer_price_cents=excluded.customer_price_cents;

-- ─── Configurator Extras ───────────────────────────────────
insert into public.configurator_extras (id, name, slug, description, icon, pricing_model, display_order, is_active) values
  ('ce-steps',    '{"en":"Steps","af":"Trappe"}'::jsonb,                  'steps',     '{"en":"Add timber steps to your deck.","af":"Voeg houttrappe by jou dek."}'::jsonb,                     'stairs',     'per_step_metre',    1, true),
  ('ce-railing',  '{"en":"Railing","af":"Reling"}'::jsonb,               'railing',   '{"en":"Timber or stainless steel balustrade along edges.","af":"Hout- of vlekvrystaal balustrade langs rande."}'::jsonb,   'fence',      'per_linear_metre',  2, true),
  ('ce-fascia',   '{"en":"Fascia Board","af":"Fassiabord"}'::jsonb,      'fascia',    '{"en":"Trim boards to cover exposed substructure.","af":"Randborde om blootgestelde substruktuur te bedek."}'::jsonb,          'layers',     'per_linear_metre',  3, true),
  ('ce-lighting', '{"en":"LED Deck Lights","af":"LED Dekligte"}'::jsonb, 'lighting',  '{"en":"Recessed LED lights in deck boards or steps.","af":"Versteekte LED-ligte in dekplanke of trappe."}'::jsonb,        'lightbulb',  'per_unit',          4, true),
  ('ce-skirting', '{"en":"Skirting","af":"Plint"}'::jsonb,               'skirting',  '{"en":"Enclose the space under a raised deck.","af":"Sluit die ruimte onder ''n verhoogde dek in."}'::jsonb,              'panel-left', 'per_linear_metre',  5, true),
  ('ce-pergola',  '{"en":"Pergola Frame","af":"Pergolatrame"}'::jsonb,   'pergola',   '{"en":"Timber pergola structure over your deck.","af":"Hout pergolastruktuur oor jou dek."}'::jsonb,            'tent',       'per_m2',            6, true)
on conflict (id) do update set name=excluded.name, slug=excluded.slug, description=excluded.description, pricing_model=excluded.pricing_model, display_order=excluded.display_order;

-- ─── Extras Pricing (per extra, optionally per material) ───
insert into public.extras_pricing (id, extra_id, material_type_id, variant_label, supplier_cost_cents, customer_price_cents, display_order, is_active) values
  -- Steps: per step-metre (width of step × number of steps)
  ('ep-steps-pine',    'ce-steps',   'mt-pine',      'Pine',      85000,  119000, 1, true),
  ('ep-steps-balau',   'ce-steps',   'mt-balau',     'Balau',    145000,  203000, 2, true),
  ('ep-steps-garapa',  'ce-steps',   'mt-garapa',    'Garapa',   135000,  189000, 3, true),
  ('ep-steps-comp',    'ce-steps',   'mt-composite', 'Composite',120000,  168000, 4, true),
  -- Railing: per linear metre
  ('ep-rail-timber',   'ce-railing',  null,  'Timber',           65000,   91000, 1, true),
  ('ep-rail-steel',    'ce-railing',  null,  'Stainless Steel', 125000,  175000, 2, true),
  ('ep-rail-glass',    'ce-railing',  null,  'Glass Panel',     185000,  259000, 3, true),
  -- Fascia: per linear metre
  ('ep-fascia-pine',   'ce-fascia',  'mt-pine',      'Pine',      12000,   16800, 1, true),
  ('ep-fascia-balau',  'ce-fascia',  'mt-balau',     'Balau',     22000,   30800, 2, true),
  ('ep-fascia-garapa', 'ce-fascia',  'mt-garapa',    'Garapa',    20000,   28000, 3, true),
  ('ep-fascia-comp',   'ce-fascia',  'mt-composite', 'Composite', 18000,   25200, 4, true),
  -- LED lights: per unit
  ('ep-light-recessed','ce-lighting', null, 'Recessed (warm white)', 15000, 21000, 1, true),
  ('ep-light-step',    'ce-lighting', null, 'Step light (warm white)', 18000, 25200, 2, true),
  -- Skirting: per linear metre
  ('ep-skirt-pine',    'ce-skirting', 'mt-pine',      'Pine',      18000,  25200, 1, true),
  ('ep-skirt-comp',    'ce-skirting', 'mt-composite', 'Composite', 25000,  35000, 2, true),
  -- Pergola: per m²
  ('ep-pergola-pine',  'ce-pergola',  'mt-pine',  'Pine',         95000, 133000, 1, true),
  ('ep-pergola-balau', 'ce-pergola',  'mt-balau', 'Balau',       155000, 217000, 2, true)
on conflict (id) do update set supplier_cost_cents=excluded.supplier_cost_cents, customer_price_cents=excluded.customer_price_cents, display_order=excluded.display_order;

-- ═══════════════════════════════════════════════════════════════
-- BUILD 08 — PRODUCT CATALOGUE SEED DATA
-- Products, Variants, Board Dimensions, Kits, Bulk Pricing
-- ═══════════════════════════════════════════════════════════════

-- ─── Product Categories (hierarchical) ──────────────────────
delete from public.product_categories;
insert into public.product_categories (id, name, slug, parent_id, material_type_id, display_order, is_active) values
  -- Top-level categories
  ('pc-boards',       '{"en":"Deck Boards","af":"Dekplanke"}'::jsonb,       'deck-boards',    null, null, 1, true),
  ('pc-substructure', '{"en":"Substructure","af":"Substruktuur"}'::jsonb,    'substructure',   null, null, 2, true),
  ('pc-fixings',      '{"en":"Fixings","af":"Bevestigings"}'::jsonb,        'fixings',        null, null, 3, true),
  ('pc-finishing',    '{"en":"Finishing","af":"Afwerking"}'::jsonb,          'finishing',      null, null, 4, true),
  ('pc-kits',         '{"en":"Deck Kits","af":"Dekstelle"}'::jsonb,         'deck-kits',      null, null, 5, true),
  -- Board subcategories per material
  ('pc-boards-pine',      '{"en":"Pine Boards","af":"Denplanke"}'::jsonb,             'pine-boards',      'pc-boards', 'mt-pine',      1, true),
  ('pc-boards-balau',     '{"en":"Balau Boards","af":"Balau-planke"}'::jsonb,         'balau-boards',     'pc-boards', 'mt-balau',     2, true),
  ('pc-boards-garapa',    '{"en":"Garapa Boards","af":"Garapa-planke"}'::jsonb,       'garapa-boards',    'pc-boards', 'mt-garapa',    3, true),
  ('pc-boards-composite', '{"en":"Composite Boards","af":"Saamgestelde Planke"}'::jsonb, 'composite-boards', 'pc-boards', 'mt-composite', 4, true),
  -- Substructure subcategories
  ('pc-sub-joists',   '{"en":"Joists","af":"Balke"}'::jsonb,   'joists',  'pc-substructure', 'mt-pine', 1, true),
  ('pc-sub-bearers',  '{"en":"Bearers","af":"Draers"}'::jsonb, 'bearers', 'pc-substructure', 'mt-pine', 2, true);

-- ─── Products ───────────────────────────────────────────────
delete from public.products where id in (
  'p-pine-22x108','p-pine-32x114','p-balau-19x90','p-garapa-19x90','p-garapa-19x140',
  'p-comp-22x140','p-joist-38x114','p-joist-38x152','p-bearer-76x228',
  'p-fix-ss-screws','p-fix-galv-screws','p-fix-spacers','p-fix-joist-tape',
  'p-fin-stain','p-fin-cleaner'
);
insert into public.products (id, name, slug, description, price_cents, images, category_id, stock_quantity, is_active, sku, material_type_id, dimensions, weight_kg) values
  -- ── Deck Boards ──
  ('p-pine-22x108',
   '{"en":"Pine CCA 22×108mm Deck Board","af":"Den CCA 22×108mm Dekplank"}'::jsonb,
   'pine-22x108',
   '{"en":"CCA H3 treated pine deck board. Budget-friendly, ideal for ground-level residential decks. FSC certified.","af":"CCA H3 behandelde den dekplank. Bekostigbaar, ideaal vir grondvlak residensiële dekke. FSC gesertifiseer."}'::jsonb,
   4500, '[]'::jsonb, 'pc-boards-pine', 200, true,
   'DKB-PINE-22108', 'mt-pine', '{"width_mm":108,"thickness_mm":22}'::jsonb, 1.8),

  ('p-pine-32x114',
   '{"en":"Pine CCA 32×114mm Deck Board","af":"Den CCA 32×114mm Dekplank"}'::jsonb,
   'pine-32x114',
   '{"en":"Heavy-duty CCA treated pine board. Thicker profile for wider joist spacing and longer spans.","af":"Swaargewig CCA behandelde denplank. Dikker profiel vir wyer balkafstand en langer spanne."}'::jsonb,
   7500, '[]'::jsonb, 'pc-boards-pine', 150, true,
   'DKB-PINE-32114', 'mt-pine', '{"width_mm":114,"thickness_mm":32}'::jsonb, 3.2),

  ('p-balau-19x90',
   '{"en":"Balau 19×90mm Deck Board","af":"Balau 19×90mm Dekplank"}'::jsonb,
   'balau-19x90',
   '{"en":"Premium African hardwood with exceptional durability (Class 1). Naturally resistant to rot and insects. Beautiful grain.","af":"Premium Afrika-harthout met uitsonderlike duursaamheid (Klas 1). Natuurlik bestand teen vrot en insekte. Pragtige nerf."}'::jsonb,
   8000, '[]'::jsonb, 'pc-boards-balau', 100, true,
   'DKB-BALAU-1990', 'mt-balau', '{"width_mm":90,"thickness_mm":19}'::jsonb, 1.5),

  ('p-garapa-19x90',
   '{"en":"Garapa 19×90mm Deck Board","af":"Garapa 19×90mm Dekplank"}'::jsonb,
   'garapa-19x90',
   '{"en":"Golden Brazilian hardwood with Class 2 durability. Lighter colour that weathers to silver-grey. Excellent value.","af":"Goue Brasiliaanse harthout met Klas 2 duursaamheid. Ligter kleur wat verweer na silwergrys. Uitstekende waarde."}'::jsonb,
   7500, '[]'::jsonb, 'pc-boards-garapa', 120, true,
   'DKB-GARAPA-1990', 'mt-garapa', '{"width_mm":90,"thickness_mm":19}'::jsonb, 1.4),

  ('p-garapa-19x140',
   '{"en":"Garapa 19×140mm Wide Deck Board","af":"Garapa 19×140mm Breë Dekplank"}'::jsonb,
   'garapa-19x140',
   '{"en":"Wide-format Garapa board for fewer joints and a contemporary look. Same durability, bigger visual impact.","af":"Breëformaat Garapa-plank vir minder nate en ''n kontemporêre voorkoms. Dieselfde duursaamheid, groter visuele impak."}'::jsonb,
   11000, '[]'::jsonb, 'pc-boards-garapa', 80, true,
   'DKB-GARAPA-19140', 'mt-garapa', '{"width_mm":140,"thickness_mm":19}'::jsonb, 2.1),

  ('p-comp-22x140',
   '{"en":"Composite WPC 22×140mm Deck Board","af":"Saamgestelde WPC 22×140mm Dekplank"}'::jsonb,
   'composite-22x140',
   '{"en":"Wood-plastic composite board. Zero maintenance, splinter-free, UV stable. Available in 4 colours. 25-year warranty.","af":"Hout-plastiek saamgestelde plank. Geen onderhoud, splintervry, UV-stabiel. Beskikbaar in 4 kleure. 25-jaar waarborg."}'::jsonb,
   25000, '[]'::jsonb, 'pc-boards-composite', 200, true,
   'DKB-COMP-22140', 'mt-composite', '{"width_mm":140,"thickness_mm":22}'::jsonb, 3.5),

  -- ── Substructure ──
  ('p-joist-38x114',
   '{"en":"Pine CCA 38×114mm Joist","af":"Den CCA 38×114mm Balk"}'::jsonb,
   'joist-38x114',
   '{"en":"Standard treated pine joist for residential decking. Supports spans up to 1.8m at 450mm centres.","af":"Standaard behandelde denbalk vir residensiële dekke. Ondersteun spanne tot 1.8m teen 450mm senters."}'::jsonb,
   8500, '[]'::jsonb, 'pc-sub-joists', 150, true,
   'SUB-JOIST-38114', 'mt-pine', '{"width_mm":114,"thickness_mm":38}'::jsonb, 4.2),

  ('p-joist-38x152',
   '{"en":"Pine CCA 38×152mm Heavy Joist","af":"Den CCA 38×152mm Swaar Balk"}'::jsonb,
   'joist-38x152',
   '{"en":"Heavy-duty joist for raised decks and longer spans. Required for balcony and rooftop installations.","af":"Swaargewig balk vir verhoogde dekke en langer spanne. Vereis vir balkon- en dakinstallasies."}'::jsonb,
   13000, '[]'::jsonb, 'pc-sub-joists', 100, true,
   'SUB-JOIST-38152', 'mt-pine', '{"width_mm":152,"thickness_mm":38}'::jsonb, 5.6),

  ('p-bearer-76x228',
   '{"en":"Pine CCA 76×228mm Bearer","af":"Den CCA 76×228mm Draer"}'::jsonb,
   'bearer-76x228',
   '{"en":"Foundation bearer for raised deck structures. Supports joists over concrete piers or stumps.","af":"Fondamentdraer vir verhoogde dekstrukture. Ondersteun balke oor betonpilare of stompe."}'::jsonb,
   32000, '[]'::jsonb, 'pc-sub-bearers', 60, true,
   'SUB-BEARER-76228', 'mt-pine', '{"width_mm":228,"thickness_mm":76}'::jsonb, 12.5),

  -- ── Fixings ──
  ('p-fix-ss-screws',
   '{"en":"Stainless Steel Deck Screws (200pc)","af":"Vlekvrystaal Dekskroewe (200st)"}'::jsonb,
   'stainless-deck-screws-200',
   '{"en":"Grade 316 stainless steel 50mm countersunk deck screws. Corrosion-proof for coastal and pool areas. Box of 200.","af":"Graad 316 vlekvrystaal 50mm versinkde dekskroewe. Korrosiebestand vir kus- en swembadgebiede. Boks van 200."}'::jsonb,
   25000, '[]'::jsonb, 'pc-fixings', 300, true,
   'FIX-SS-50-200', null, null, 1.2),

  ('p-fix-galv-screws',
   '{"en":"Galvanised Deck Screws (200pc)","af":"Gegalvaniseerde Dekskroewe (200st)"}'::jsonb,
   'galvanised-deck-screws-200',
   '{"en":"Hot-dip galvanised 50mm countersunk screws. Cost-effective for covered and inland applications. Box of 200.","af":"Warmgedompelde gegalvaniseerde 50mm versinkde skroewe. Koste-effektief vir bedekte en binnelandse toepassings. Boks van 200."}'::jsonb,
   15000, '[]'::jsonb, 'pc-fixings', 500, true,
   'FIX-GALV-50-200', null, null, 1.1),

  ('p-fix-spacers',
   '{"en":"Board Spacers (100pc)","af":"Plankafstandhouers (100st)"}'::jsonb,
   'board-spacers-100',
   '{"en":"5mm polypropylene deck board spacers. Ensures consistent gaps for drainage and expansion. Pack of 100.","af":"5mm polipropileen dekplank-afstandhouers. Verseker konsekwente gapings vir dreinering en uitsetting. Pak van 100."}'::jsonb,
   9500, '[]'::jsonb, 'pc-fixings', 400, true,
   'FIX-SPACERS-100', null, null, 0.3),

  ('p-fix-joist-tape',
   '{"en":"Joist Protection Tape (10m)","af":"Balkbeskermingsband (10m)"}'::jsonb,
   'joist-tape-10m',
   '{"en":"Self-adhesive butyl rubber tape to protect joist tops from moisture. Extends substructure lifespan by 50%. Roll of 10m.","af":"Selfklewende butielrubberband om balkkruine teen vog te beskerm. Verleng substruktuurleeftyd met 50%. Rol van 10m."}'::jsonb,
   18000, '[]'::jsonb, 'pc-fixings', 200, true,
   'FIX-TAPE-10M', null, null, 0.5),

  -- ── Finishing ──
  ('p-fin-stain',
   '{"en":"Deck Stain & Sealer","af":"Dekbeis & Seëlmiddel"}'::jsonb,
   'deck-stain',
   '{"en":"UV-protective oil-based deck stain. Penetrates deeply for long-lasting colour and water resistance. Available in 4 colours.","af":"UV-beskermende oliebasis dekbeis. Dring diep in vir langdurige kleur en waterbestandheid. Beskikbaar in 4 kleure."}'::jsonb,
   12000, '[]'::jsonb, 'pc-finishing', 200, true,
   'FIN-STAIN', null, null, 1.0),

  ('p-fin-cleaner',
   '{"en":"Deck Cleaner & Restorer","af":"Dekreiniger & Hersteller"}'::jsonb,
   'deck-cleaner',
   '{"en":"Oxygen-based deck cleaner that removes grey weathering, mildew and dirt. Safe for all wood types. Covers ~20m² per litre.","af":"Suurstofgebaseerde dekreiniger wat grys verwering, skimmel en vuil verwyder. Veilig vir alle houttipes. Dek ~20m² per liter."}'::jsonb,
   8500, '[]'::jsonb, 'pc-finishing', 150, true,
   'FIN-CLEANER', null, null, 1.0);

-- ─── Product Variants ───────────────────────────────────────
delete from public.product_variants;
insert into public.product_variants (id, product_id, name, sku, length_mm, colour, price_cents, supplier_cost_cents, stock_quantity, display_order, is_active) values
  -- Pine 22×108mm (4 lengths)
  ('pv-pine22-2400', 'p-pine-22x108', '{"en":"2.4m Length","af":"2.4m Lengte"}'::jsonb, 'DKB-PINE-22108-2400', 2400, null, 4500,  3200, 200, 1, true),
  ('pv-pine22-3000', 'p-pine-22x108', '{"en":"3.0m Length","af":"3.0m Lengte"}'::jsonb, 'DKB-PINE-22108-3000', 3000, null, 5500,  3900, 180, 2, true),
  ('pv-pine22-3600', 'p-pine-22x108', '{"en":"3.6m Length","af":"3.6m Lengte"}'::jsonb, 'DKB-PINE-22108-3600', 3600, null, 6500,  4600, 160, 3, true),
  ('pv-pine22-4800', 'p-pine-22x108', '{"en":"4.8m Length","af":"4.8m Lengte"}'::jsonb, 'DKB-PINE-22108-4800', 4800, null, 8500,  6100, 120, 4, true),
  -- Pine 32×114mm (4 lengths)
  ('pv-pine32-2400', 'p-pine-32x114', '{"en":"2.4m Length","af":"2.4m Lengte"}'::jsonb, 'DKB-PINE-32114-2400', 2400, null, 7500,  5400, 150, 1, true),
  ('pv-pine32-3000', 'p-pine-32x114', '{"en":"3.0m Length","af":"3.0m Lengte"}'::jsonb, 'DKB-PINE-32114-3000', 3000, null, 9000,  6400, 120, 2, true),
  ('pv-pine32-3600', 'p-pine-32x114', '{"en":"3.6m Length","af":"3.6m Lengte"}'::jsonb, 'DKB-PINE-32114-3600', 3600, null, 11000, 7900, 100, 3, true),
  ('pv-pine32-4800', 'p-pine-32x114', '{"en":"4.8m Length","af":"4.8m Lengte"}'::jsonb, 'DKB-PINE-32114-4800', 4800, null, 14500, 10400, 80, 4, true),
  -- Balau 19×90mm (5 lengths)
  ('pv-balau-0900', 'p-balau-19x90', '{"en":"0.9m Length","af":"0.9m Lengte"}'::jsonb, 'DKB-BALAU-1990-0900', 900,  null, 8000,   5700, 100, 1, true),
  ('pv-balau-1200', 'p-balau-19x90', '{"en":"1.2m Length","af":"1.2m Lengte"}'::jsonb, 'DKB-BALAU-1990-1200', 1200, null, 10500,  7500, 100, 2, true),
  ('pv-balau-1500', 'p-balau-19x90', '{"en":"1.5m Length","af":"1.5m Lengte"}'::jsonb, 'DKB-BALAU-1990-1500', 1500, null, 13000,  9300, 80,  3, true),
  ('pv-balau-1800', 'p-balau-19x90', '{"en":"1.8m Length","af":"1.8m Lengte"}'::jsonb, 'DKB-BALAU-1990-1800', 1800, null, 18000, 12900, 60,  4, true),
  ('pv-balau-2100', 'p-balau-19x90', '{"en":"2.1m Length","af":"2.1m Lengte"}'::jsonb, 'DKB-BALAU-1990-2100', 2100, null, 21000, 15000, 40,  5, true),
  -- Garapa 19×90mm (5 lengths)
  ('pv-garapa90-0900', 'p-garapa-19x90', '{"en":"0.9m Length","af":"0.9m Lengte"}'::jsonb, 'DKB-GARAPA-1990-0900', 900,  null, 7500,   5400, 120, 1, true),
  ('pv-garapa90-1200', 'p-garapa-19x90', '{"en":"1.2m Length","af":"1.2m Lengte"}'::jsonb, 'DKB-GARAPA-1990-1200', 1200, null, 10000,  7100, 100, 2, true),
  ('pv-garapa90-1500', 'p-garapa-19x90', '{"en":"1.5m Length","af":"1.5m Lengte"}'::jsonb, 'DKB-GARAPA-1990-1500', 1500, null, 12500,  8900, 80,  3, true),
  ('pv-garapa90-1800', 'p-garapa-19x90', '{"en":"1.8m Length","af":"1.8m Lengte"}'::jsonb, 'DKB-GARAPA-1990-1800', 1800, null, 16500, 11800, 60,  4, true),
  ('pv-garapa90-2100', 'p-garapa-19x90', '{"en":"2.1m Length","af":"2.1m Lengte"}'::jsonb, 'DKB-GARAPA-1990-2100', 2100, null, 19500, 13900, 40,  5, true),
  -- Garapa 19×140mm (5 lengths)
  ('pv-garapa140-0900', 'p-garapa-19x140', '{"en":"0.9m Length","af":"0.9m Lengte"}'::jsonb, 'DKB-GARAPA-19140-0900', 900,  null, 11000,  7900, 80,  1, true),
  ('pv-garapa140-1200', 'p-garapa-19x140', '{"en":"1.2m Length","af":"1.2m Lengte"}'::jsonb, 'DKB-GARAPA-19140-1200', 1200, null, 14500, 10400, 80,  2, true),
  ('pv-garapa140-1500', 'p-garapa-19x140', '{"en":"1.5m Length","af":"1.5m Lengte"}'::jsonb, 'DKB-GARAPA-19140-1500', 1500, null, 18000, 12900, 60,  3, true),
  ('pv-garapa140-1800', 'p-garapa-19x140', '{"en":"1.8m Length","af":"1.8m Lengte"}'::jsonb, 'DKB-GARAPA-19140-1800', 1800, null, 24000, 17100, 40,  4, true),
  ('pv-garapa140-2100', 'p-garapa-19x140', '{"en":"2.1m Length","af":"2.1m Lengte"}'::jsonb, 'DKB-GARAPA-19140-2100', 2100, null, 28000, 20000, 30,  5, true),
  -- Composite 22×140mm (3 lengths × 4 colours = 12 variants)
  ('pv-comp-2200-teak',     'p-comp-22x140', '{"en":"2.2m — Teak","af":"2.2m — Teak"}'::jsonb,           'DKB-COMP-22140-2200-TK', 2200, 'Teak',       25000, 17900, 200, 1,  true),
  ('pv-comp-2200-grey',     'p-comp-22x140', '{"en":"2.2m — Stone Grey","af":"2.2m — Klipgrys"}'::jsonb,  'DKB-COMP-22140-2200-GR', 2200, 'Stone Grey', 25000, 17900, 200, 2,  true),
  ('pv-comp-2200-charcoal', 'p-comp-22x140', '{"en":"2.2m — Charcoal","af":"2.2m — Houtskool"}'::jsonb,  'DKB-COMP-22140-2200-CH', 2200, 'Charcoal',   25000, 17900, 200, 3,  true),
  ('pv-comp-2200-walnut',   'p-comp-22x140', '{"en":"2.2m — Walnut","af":"2.2m — Okkerneut"}'::jsonb,    'DKB-COMP-22140-2200-WA', 2200, 'Walnut',     25000, 17900, 150, 4,  true),
  ('pv-comp-3600-teak',     'p-comp-22x140', '{"en":"3.6m — Teak","af":"3.6m — Teak"}'::jsonb,           'DKB-COMP-22140-3600-TK', 3600, 'Teak',       35000, 25000, 150, 5,  true),
  ('pv-comp-3600-grey',     'p-comp-22x140', '{"en":"3.6m — Stone Grey","af":"3.6m — Klipgrys"}'::jsonb,  'DKB-COMP-22140-3600-GR', 3600, 'Stone Grey', 35000, 25000, 150, 6,  true),
  ('pv-comp-3600-charcoal', 'p-comp-22x140', '{"en":"3.6m — Charcoal","af":"3.6m — Houtskool"}'::jsonb,  'DKB-COMP-22140-3600-CH', 3600, 'Charcoal',   35000, 25000, 150, 7,  true),
  ('pv-comp-3600-walnut',   'p-comp-22x140', '{"en":"3.6m — Walnut","af":"3.6m — Okkerneut"}'::jsonb,    'DKB-COMP-22140-3600-WA', 3600, 'Walnut',     35000, 25000, 100, 8,  true),
  ('pv-comp-5400-teak',     'p-comp-22x140', '{"en":"5.4m — Teak","af":"5.4m — Teak"}'::jsonb,           'DKB-COMP-22140-5400-TK', 5400, 'Teak',       50000, 35700, 80,  9,  true),
  ('pv-comp-5400-grey',     'p-comp-22x140', '{"en":"5.4m — Stone Grey","af":"5.4m — Klipgrys"}'::jsonb,  'DKB-COMP-22140-5400-GR', 5400, 'Stone Grey', 50000, 35700, 80,  10, true),
  ('pv-comp-5400-charcoal', 'p-comp-22x140', '{"en":"5.4m — Charcoal","af":"5.4m — Houtskool"}'::jsonb,  'DKB-COMP-22140-5400-CH', 5400, 'Charcoal',   50000, 35700, 80,  11, true),
  ('pv-comp-5400-walnut',   'p-comp-22x140', '{"en":"5.4m — Walnut","af":"5.4m — Okkerneut"}'::jsonb,    'DKB-COMP-22140-5400-WA', 5400, 'Walnut',     50000, 35700, 60,  12, true),
  -- Joists 38×114mm (4 lengths)
  ('pv-joist114-2400', 'p-joist-38x114', '{"en":"2.4m Length","af":"2.4m Lengte"}'::jsonb, 'SUB-JOIST-38114-2400', 2400, null, 8500,  6100, 150, 1, true),
  ('pv-joist114-3000', 'p-joist-38x114', '{"en":"3.0m Length","af":"3.0m Lengte"}'::jsonb, 'SUB-JOIST-38114-3000', 3000, null, 10500, 7500, 120, 2, true),
  ('pv-joist114-3600', 'p-joist-38x114', '{"en":"3.6m Length","af":"3.6m Lengte"}'::jsonb, 'SUB-JOIST-38114-3600', 3600, null, 12500, 8900, 100, 3, true),
  ('pv-joist114-4800', 'p-joist-38x114', '{"en":"4.8m Length","af":"4.8m Lengte"}'::jsonb, 'SUB-JOIST-38114-4800', 4800, null, 16500, 11800, 80, 4, true),
  -- Joists 38×152mm (3 lengths)
  ('pv-joist152-3000', 'p-joist-38x152', '{"en":"3.0m Length","af":"3.0m Lengte"}'::jsonb, 'SUB-JOIST-38152-3000', 3000, null, 13000, 9300, 100, 1, true),
  ('pv-joist152-3600', 'p-joist-38x152', '{"en":"3.6m Length","af":"3.6m Lengte"}'::jsonb, 'SUB-JOIST-38152-3600', 3600, null, 15500, 11100, 80,  2, true),
  ('pv-joist152-4800', 'p-joist-38x152', '{"en":"4.8m Length","af":"4.8m Lengte"}'::jsonb, 'SUB-JOIST-38152-4800', 4800, null, 21000, 15000, 60,  3, true),
  -- Bearer 76×228mm (3 lengths)
  ('pv-bearer-2400', 'p-bearer-76x228', '{"en":"2.4m Length","af":"2.4m Lengte"}'::jsonb, 'SUB-BEARER-76228-2400', 2400, null, 32000, 22900, 60, 1, true),
  ('pv-bearer-3000', 'p-bearer-76x228', '{"en":"3.0m Length","af":"3.0m Lengte"}'::jsonb, 'SUB-BEARER-76228-3000', 3000, null, 39500, 28200, 40, 2, true),
  ('pv-bearer-3600', 'p-bearer-76x228', '{"en":"3.6m Length","af":"3.6m Lengte"}'::jsonb, 'SUB-BEARER-76228-3600', 3600, null, 47500, 33900, 30, 3, true),
  -- Fixings (single variant each)
  ('pv-ss-screws',   'p-fix-ss-screws',   '{"en":"Box of 200","af":"Boks van 200"}'::jsonb, 'FIX-SS-50-200-V1',   null, null, 25000, 17900, 300, 1, true),
  ('pv-galv-screws', 'p-fix-galv-screws', '{"en":"Box of 200","af":"Boks van 200"}'::jsonb, 'FIX-GALV-50-200-V1', null, null, 15000, 10700, 500, 1, true),
  ('pv-spacers',     'p-fix-spacers',     '{"en":"Pack of 100","af":"Pak van 100"}'::jsonb,  'FIX-SPACERS-100-V1', null, null, 9500,  6800,  400, 1, true),
  ('pv-joist-tape',  'p-fix-joist-tape',  '{"en":"10m Roll","af":"10m Rol"}'::jsonb,         'FIX-TAPE-10M-V1',   null, null, 18000, 12900, 200, 1, true),
  -- Stain (4 colours × 2 sizes = 8 variants)
  ('pv-stain-clear-1',    'p-fin-stain', '{"en":"Clear Seal — 1L","af":"Deursigtige Seël — 1L"}'::jsonb,  'FIN-STAIN-CLEAR-1L',    null, 'Clear Seal',  12000, 8600,  200, 1, true),
  ('pv-stain-clear-5',    'p-fin-stain', '{"en":"Clear Seal — 5L","af":"Deursigtige Seël — 5L"}'::jsonb,  'FIN-STAIN-CLEAR-5L',    null, 'Clear Seal',  45000, 32100, 80,  2, true),
  ('pv-stain-honey-1',    'p-fin-stain', '{"en":"Honey Oak — 1L","af":"Heuningeik — 1L"}'::jsonb,         'FIN-STAIN-HONEY-1L',    null, 'Honey Oak',   12000, 8600,  200, 3, true),
  ('pv-stain-honey-5',    'p-fin-stain', '{"en":"Honey Oak — 5L","af":"Heuningeik — 5L"}'::jsonb,         'FIN-STAIN-HONEY-5L',    null, 'Honey Oak',   45000, 32100, 80,  4, true),
  ('pv-stain-walnut-1',   'p-fin-stain', '{"en":"Dark Walnut — 1L","af":"Donker Okkerneut — 1L"}'::jsonb, 'FIN-STAIN-WALNUT-1L',   null, 'Dark Walnut', 12000, 8600,  200, 5, true),
  ('pv-stain-walnut-5',   'p-fin-stain', '{"en":"Dark Walnut — 5L","af":"Donker Okkerneut — 5L"}'::jsonb, 'FIN-STAIN-WALNUT-5L',   null, 'Dark Walnut', 45000, 32100, 80,  6, true),
  ('pv-stain-charcoal-1', 'p-fin-stain', '{"en":"Charcoal — 1L","af":"Houtskool — 1L"}'::jsonb,           'FIN-STAIN-CHARCOAL-1L', null, 'Charcoal',    12000, 8600,  200, 7, true),
  ('pv-stain-charcoal-5', 'p-fin-stain', '{"en":"Charcoal — 5L","af":"Houtskool — 5L"}'::jsonb,           'FIN-STAIN-CHARCOAL-5L', null, 'Charcoal',    45000, 32100, 80,  8, true),
  -- Cleaner (2 sizes)
  ('pv-cleaner-1', 'p-fin-cleaner', '{"en":"1L Bottle","af":"1L Bottel"}'::jsonb,    'FIN-CLEANER-1L', null, null, 8500,  6100, 150, 1, true),
  ('pv-cleaner-5', 'p-fin-cleaner', '{"en":"5L Container","af":"5L Houer"}'::jsonb, 'FIN-CLEANER-5L', null, null, 32000, 22900, 60, 2, true);

-- ─── Board Dimensions (for layout engine) ───────────────────
insert into public.board_dimensions (id, material_type_id, board_type, width_mm, thickness_mm, available_lengths_mm, price_per_metre_cents, display_order, is_active) values
  ('bdim-pine-22x108',   'mt-pine',      'deck_board', 108, 22, '{2400,3000,3600,4800}',      1875,  1, true),
  ('bdim-pine-32x114',   'mt-pine',      'deck_board', 114, 32, '{2400,3000,3600,4800}',      3125,  2, true),
  ('bdim-balau-19x90',   'mt-balau',     'deck_board', 90,  19, '{900,1200,1500,1800,2100}',  10000, 1, true),
  ('bdim-garapa-19x90',  'mt-garapa',    'deck_board', 90,  19, '{900,1200,1500,1800,2100}',  8333,  1, true),
  ('bdim-garapa-19x140', 'mt-garapa',    'deck_board', 140, 19, '{900,1200,1500,1800,2100}',  12222, 2, true),
  ('bdim-comp-22x140',   'mt-composite', 'deck_board', 140, 22, '{2200,3600,5400}',           9722,  1, true),
  ('bdim-joist-38x114',  'mt-pine',      'joist',      114, 38, '{2400,3000,3600,4800}',      3542,  1, true),
  ('bdim-joist-38x152',  'mt-pine',      'joist',      152, 38, '{3000,3600,4800}',           4333,  2, true),
  ('bdim-bearer-76x228', 'mt-pine',      'bearer',     228, 76, '{2400,3000,3600}',           13333, 1, true)
on conflict (id) do update set
  material_type_id=excluded.material_type_id, board_type=excluded.board_type,
  width_mm=excluded.width_mm, thickness_mm=excluded.thickness_mm,
  available_lengths_mm=excluded.available_lengths_mm, price_per_metre_cents=excluded.price_per_metre_cents;

-- ─── Bulk Pricing (quantity discounts) ──────────────────────
delete from public.bulk_pricing;
insert into public.bulk_pricing (product_id, variant_id, min_quantity, price_cents) values
  -- Pine 22×108 popular lengths
  (null, 'pv-pine22-2400', 20, 4200), (null, 'pv-pine22-2400', 50, 3900), (null, 'pv-pine22-2400', 100, 3600),
  (null, 'pv-pine22-3600', 20, 6000), (null, 'pv-pine22-3600', 50, 5700), (null, 'pv-pine22-3600', 100, 5200),
  (null, 'pv-pine22-4800', 20, 7900), (null, 'pv-pine22-4800', 50, 7400), (null, 'pv-pine22-4800', 100, 6800),
  -- Composite 3.6m (popular)
  (null, 'pv-comp-3600-teak', 20, 32500), (null, 'pv-comp-3600-teak', 50, 30000),
  -- Screws bulk
  (null, 'pv-ss-screws', 5, 23800), (null, 'pv-ss-screws', 10, 22500),
  (null, 'pv-galv-screws', 5, 14300), (null, 'pv-galv-screws', 10, 13500),
  -- Joists 38×114 3.6m
  (null, 'pv-joist114-3600', 10, 11500), (null, 'pv-joist114-3600', 25, 10500);

-- ─── Kits / Bundles ─────────────────────────────────────────
delete from public.kits;
insert into public.kits (id, name, slug, description, image_url, price_cents, supplier_cost_cents, material_type_id, area_m2, display_order, is_active) values
  ('kit-pine-starter',
   '{"en":"Pine Starter Deck Kit — 10m²","af":"Den Beginnersdekstel — 10m²"}'::jsonb,
   'pine-starter-10',
   '{"en":"Everything you need for a 10m² ground-level pine deck. Includes boards, joists, fixings and finishing. Just add labour!","af":"Alles wat jy nodig het vir ''n 10m² grondvlak dendek. Sluit planke, balke, bevestigings en afwerking in. Voeg net arbeid by!"}'::jsonb,
   null, 850000, 607000, 'mt-pine', 10.00, 1, true),
  ('kit-balau-premium',
   '{"en":"Balau Premium Deck Kit — 10m²","af":"Balau Premium Dekstel — 10m²"}'::jsonb,
   'balau-premium-10',
   '{"en":"Premium Balau hardwood deck kit for 10m². Includes boards, substructure, stainless fixings and teak oil. Built to last 30+ years.","af":"Premium Balau-harthout dekstel vir 10m². Sluit planke, substruktuur, vlekvrystaal bevestigings en teak-olie in. Gebou om 30+ jaar te hou."}'::jsonb,
   null, 1650000, 1179000, 'mt-balau', 10.00, 2, true),
  ('kit-comp-easy',
   '{"en":"Composite Easy Deck Kit — 10m²","af":"Saamgestelde Maklike Dekstel — 10m²"}'::jsonb,
   'composite-easy-10',
   '{"en":"Zero-maintenance composite deck kit for 10m². Includes boards, joists, hidden clips and edge trim. 25-year warranty.","af":"Geen-onderhoud saamgestelde dekstel vir 10m². Sluit planke, balke, versteekte knippies en randafwerking in. 25-jaar waarborg."}'::jsonb,
   null, 1450000, 1036000, 'mt-composite', 10.00, 3, true),
  ('kit-pine-diy-15',
   '{"en":"Pine DIY Deck Kit — 15m²","af":"Den DIY Dekstel — 15m²"}'::jsonb,
   'pine-diy-15',
   '{"en":"Large pine deck kit for the serious DIYer. Covers 15m² with heavy-duty 32mm boards, joists, bearers and all fixings.","af":"Groot dendekstel vir die ernstige DIY-er. Dek 15m² met swaargewig 32mm-planke, balke, draers en alle bevestigings."}'::jsonb,
   null, 1550000, 1107000, 'mt-pine', 15.00, 4, true);

-- ─── Kit Components ─────────────────────────────────────────
delete from public.kit_components;
insert into public.kit_components (kit_id, product_id, variant_id, quantity, display_order) values
  -- Pine Starter 10m²
  ('kit-pine-starter', 'p-pine-22x108',   'pv-pine22-3600',    28, 1),
  ('kit-pine-starter', 'p-joist-38x114',  'pv-joist114-3600',  14, 2),
  ('kit-pine-starter', 'p-fix-ss-screws', 'pv-ss-screws',       3, 3),
  ('kit-pine-starter', 'p-fix-spacers',   'pv-spacers',         1, 4),
  ('kit-pine-starter', 'p-fix-joist-tape','pv-joist-tape',       2, 5),
  ('kit-pine-starter', 'p-fin-stain',     'pv-stain-clear-5',   1, 6),
  -- Balau Premium 10m²
  ('kit-balau-premium', 'p-balau-19x90',   'pv-balau-1800',     56, 1),
  ('kit-balau-premium', 'p-joist-38x152',  'pv-joist152-3600',  10, 2),
  ('kit-balau-premium', 'p-fix-ss-screws', 'pv-ss-screws',       4, 3),
  ('kit-balau-premium', 'p-fix-spacers',   'pv-spacers',         1, 4),
  ('kit-balau-premium', 'p-fix-joist-tape','pv-joist-tape',       2, 5),
  -- Composite Easy 10m²
  ('kit-comp-easy', 'p-comp-22x140',   'pv-comp-3600-teak',  20, 1),
  ('kit-comp-easy', 'p-joist-38x114',  'pv-joist114-3600',   14, 2),
  ('kit-comp-easy', 'p-fix-ss-screws', 'pv-ss-screws',        3, 3),
  ('kit-comp-easy', 'p-fix-spacers',   'pv-spacers',          1, 4),
  -- Pine DIY 15m²
  ('kit-pine-diy-15', 'p-pine-32x114',   'pv-pine32-4800',   32, 1),
  ('kit-pine-diy-15', 'p-joist-38x152',  'pv-joist152-4800',  12, 2),
  ('kit-pine-diy-15', 'p-bearer-76x228', 'pv-bearer-3000',     4, 3),
  ('kit-pine-diy-15', 'p-fix-ss-screws', 'pv-ss-screws',       5, 4),
  ('kit-pine-diy-15', 'p-fix-spacers',   'pv-spacers',         2, 5),
  ('kit-pine-diy-15', 'p-fix-joist-tape','pv-joist-tape',       3, 6),
  ('kit-pine-diy-15', 'p-fin-stain',     'pv-stain-honey-5',   2, 7);

-- ─── Product Relations (cross-sell) ─────────────────────────
delete from public.product_relations;
insert into public.product_relations (product_id, related_product_id, relation_type, display_order) values
  ('p-pine-22x108',  'p-fix-ss-screws', 'frequently_bought_together', 1),
  ('p-pine-22x108',  'p-fix-spacers',   'frequently_bought_together', 2),
  ('p-pine-22x108',  'p-fin-stain',     'frequently_bought_together', 3),
  ('p-pine-32x114',  'p-fix-ss-screws', 'frequently_bought_together', 1),
  ('p-pine-32x114',  'p-fin-stain',     'frequently_bought_together', 2),
  ('p-balau-19x90',  'p-fix-ss-screws', 'frequently_bought_together', 1),
  ('p-balau-19x90',  'p-fix-spacers',   'frequently_bought_together', 2),
  ('p-garapa-19x90', 'p-fix-ss-screws', 'frequently_bought_together', 1),
  ('p-garapa-19x90', 'p-fin-stain',     'frequently_bought_together', 2),
  ('p-comp-22x140',  'p-fix-ss-screws', 'frequently_bought_together', 1),
  ('p-fix-ss-screws',   'p-fix-spacers',    'frequently_bought_together', 1),
  ('p-fix-ss-screws',   'p-fix-joist-tape', 'frequently_bought_together', 2),
  ('p-fix-galv-screws', 'p-fix-spacers',    'frequently_bought_together', 1),
  ('p-fin-stain',   'p-fin-cleaner', 'frequently_bought_together', 1),
  ('p-fin-cleaner', 'p-fin-stain',   'frequently_bought_together', 1);

-- ═══════════════════════════════════════════════════════════════
-- BUILD 35 — FAQ SEED DATA (10 bilingual deck-related FAQs)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.faqs (id, question, answer, display_order, is_active) VALUES
  (
    'faq-01-how-long',
    '{"en":"How long does a deck installation take?","af":"Hoe lank neem ''n dekinstallasie?"}',
    '{"en":"A standard ground-level deck (10–20 m²) typically takes 3–5 working days. Raised decks, pool surrounds, and complex shapes may take 5–10 days. We''ll give you a firm timeline in your quote.","af":"''n Standaard grondvlak-dek (10–20 m²) neem gewoonlik 3–5 werksdae. Verhoogde dekke, swembadsorronde en komplekse vorms kan 5–10 dae neem. Ons sal jou ''n vaste tydlyn in jou kwotasie gee."}',
    1, true
  ),
  (
    'faq-02-pine-vs-hardwood',
    '{"en":"What is the difference between pine and hardwood decking?","af":"Wat is die verskil tussen denne- en hardehoutvloere?"}',
    '{"en":"Pine (CCA-treated) is the most affordable option and works well for ground-level decks. It needs staining every 1–2 years. Hardwoods like balau and garapa are naturally durable, resist rot and insects, and age to a beautiful silver-grey if left untreated. They cost more upfront but last 25+ years with minimal maintenance.","af":"Denne (CCA-behandeld) is die bekostigste opsie en werk goed vir grondvlakdekke. Dit moet elke 1–2 jaar gebeis word. Hardehoute soos balau en garapa is natuurlik duursaam, bestand teen verrotting en insekte, en verouder tot ''n pragtige silwergrys as dit onbehandeld gelaat word. Hulle kos meer aanvanklik, maar hou 25+ jaar met minimale onderhoud."}',
    2, true
  ),
  (
    'faq-03-composite',
    '{"en":"Is composite decking worth it?","af":"Is saamgestelde dekmateriaal die moeite werd?"}',
    '{"en":"Composite boards never need staining, won''t splinter, and resist fading. They''re ideal for pool areas and low-maintenance homes. The upfront cost is higher than pine but lower than premium hardwood, and you save on yearly maintenance costs.","af":"Saamgestelde planke hoef nooit gebeis te word nie, sal nie splinter nie en is bestand teen verbleking. Hulle is ideaal vir swembadgebiede en lae-onderhoud huise. Die aanvanklike koste is hoër as denne, maar laer as premie hardehout, en jy spaar op jaarlikse onderhoudskoste."}',
    3, true
  ),
  (
    'faq-04-cost',
    '{"en":"How much does a deck cost per square metre?","af":"Hoeveel kos ''n dek per vierkante meter?"}',
    '{"en":"Prices vary by material and complexity. As a rough guide: pine decks start from R850/m² (supply only) or R1,500/m² (installed). Hardwood runs R1,800–R2,500/m² installed. Composite sits between R1,600–R2,200/m² installed. Use our online configurator for an instant, accurate quote.","af":"Pryse wissel na gelang van materiaal en kompleksiteit. As ''n rowwe riglyn: dennedekke begin vanaf R850/m² (slegs voorsiening) of R1 500/m² (geïnstalleer). Hardehout is R1 800–R2 500/m² geïnstalleer. Saamgesteld is tussen R1 600–R2 200/m² geïnstalleer. Gebruik ons aanlyn konfigurator vir ''n vinnige, akkurate kwotasie."}',
    4, true
  ),
  (
    'faq-05-maintenance',
    '{"en":"How do I maintain my deck?","af":"Hoe onderhou ek my dek?"}',
    '{"en":"For pine: clean annually with a deck wash, sand lightly, and apply a quality deck stain every 12–18 months. For hardwood: clean annually; staining is optional (it keeps the original colour, or let it silver naturally). For composite: just hose it down — no staining needed.","af":"Vir denne: was jaarliks met ''n dekwas, skuur liggies, en smeer ''n kwaliteit dekbeis elke 12–18 maande. Vir hardehout: was jaarliks; beis is opsioneel (dit hou die oorspronklike kleur, of laat dit natuurlik versilwer). Vir saamgesteld: spuit dit net af — geen beis nodig nie."}',
    5, true
  ),
  (
    'faq-06-diy',
    '{"en":"Can I install the deck myself?","af":"Kan ek die dek self installeer?"}',
    '{"en":"Absolutely! We offer a supply-only option with all the materials, fixings, and a detailed build plan. Our DIY kits include pre-cut boards and step-by-step instructions. If you get stuck, you can always book a consultation or upgrade to full installation.","af":"Absoluut! Ons bied ''n slegs-voorsiening opsie met al die materiale, hegstukke en ''n gedetailleerde bouplan. Ons DIY-stelle sluit voorafgesnyde planke en stap-vir-stap instruksies in. As jy vashaak, kan jy altyd ''n konsultasie bespreek of opgradeer na volledige installasie."}',
    6, true
  ),
  (
    'faq-07-warranty',
    '{"en":"Do you offer a warranty?","af":"Bied julle ''n waarborg?"}',
    '{"en":"Yes. All installed decks carry a 2-year workmanship warranty. Material warranties depend on the supplier: CCA pine has a 20-year treatment guarantee, balau and garapa carry natural durability guarantees, and composite boards typically have a 10–25 year manufacturer warranty.","af":"Ja. Alle geïnstalleerde dekke het ''n 2-jaar vakmanskap waarborg. Materiaalwaarborge hang af van die verskaffer: CCA-denne het ''n 20-jaar behandelingswaarborg, balau en garapa het natuurlike duursaamheidswaarborge, en saamgestelde planke het gewoonlik ''n 10–25 jaar vervaardigerwaarborg."}',
    7, true
  ),
  (
    'faq-08-service-area',
    '{"en":"Where do you operate?","af":"Waar bedryf julle?"}',
    '{"en":"We install decks throughout the Western Cape — Cape Town, Stellenbosch, Paarl, Somerset West, Hermanus, and surrounding areas. For supply-only orders, we deliver nationwide via courier.","af":"Ons installeer dekke regdeur die Wes-Kaap — Kaapstad, Stellenbosch, Paarl, Somerset-Wes, Hermanus en omliggende gebiede. Vir slegs-voorsiening bestellings lewer ons landwyd via koerier."}',
    8, true
  ),
  (
    'faq-09-raised-deck',
    '{"en":"Can you build a raised or multi-level deck?","af":"Kan julle ''n verhoogde of multi-vlak dek bou?"}',
    '{"en":"Yes — raised decks, split-level designs, and multi-tier configurations are our speciality. These require additional substructure (bearers and posts) and may need council approval if over 500 mm above ground. We handle the engineering and can advise on regulations.","af":"Ja — verhoogde dekke, verdeelde-vlak ontwerpe en multi-vlak konfigurasies is ons spesialiteit. Hierdie vereis addisionele substruktuur (draers en pale) en mag raadsgoedkeuring nodig hê as dit meer as 500 mm bo die grond is. Ons hanteer die ingenieurswese en kan adviseer oor regulasies."}',
    9, true
  ),
  (
    'faq-10-quote-process',
    '{"en":"How does the quoting process work?","af":"Hoe werk die kwotasieproses?"}',
    '{"en":"Use our online deck configurator to get an instant estimate. You can save your quote and we''ll email you a detailed PDF. For complex projects, book a free on-site consultation — we''ll measure up, discuss options, and provide a fixed-price quote within 48 hours.","af":"Gebruik ons aanlyn dek-konfigurator om ''n onmiddellike beraming te kry. Jy kan jou kwotasie stoor en ons sal jou ''n gedetailleerde PDF e-pos. Vir komplekse projekte, bespreek ''n gratis terreinbesoek — ons sal opmeet, opsies bespreek, en ''n vasteprys-kwotasie binne 48 uur verskaf."}',
    10, true
  )
ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question, answer = EXCLUDED.answer, display_order = EXCLUDED.display_order;

-- ═══════════════════════════════════════════════════════════════
-- SITE SETTINGS, NAV LINKS, FOOTER SECTIONS
-- ═══════════════════════════════════════════════════════════════

-- Site settings (stored in site_content with section_key='site_settings')
INSERT INTO public.site_content (id, section_key, content) VALUES
  (
    'sc-site-settings',
    'site_settings',
    '{
      "logo_text": "The Deck Lab",
      "company_name": "The Deck Lab",
      "company_tagline": {"en":"Custom decking — designed, supplied & installed","af":"Pasgemaakte dekke — ontwerp, voorsien & geïnstalleer"},
      "phone_number": "+27 21 000 0000",
      "whatsapp_number": "+27 82 000 0000",
      "email": "info@thedecklab.co.za",
      "address": "Cape Town, Western Cape, South Africa",
      "business_hours": "Mon–Fri 07:30–17:00, Sat 08:00–13:00",
      "cta_label": {"en":"Get a Quote","af":"Kry ''n Kwotasie"},
      "cta_url": "/configurator",
      "social_links": [
        {"platform":"facebook","url":"https://facebook.com/thedecklab"},
        {"platform":"instagram","url":"https://instagram.com/thedecklab"}
      ]
    }'
  )
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- Navigation links
INSERT INTO public.nav_links (id, label, href, display_order, is_active) VALUES
  ('nav-home',        '{"en":"Home","af":"Tuis"}',          '/',              1, true),
  ('nav-configurator','{"en":"Design Your Deck","af":"Ontwerp Jou Dek"}', '/configurator', 2, true),
  ('nav-shop',        '{"en":"Shop","af":"Winkel"}',        '/shop',          3, true),
  ('nav-services',    '{"en":"Services","af":"Dienste"}',   '/services',      4, true),
  ('nav-about',       '{"en":"About","af":"Oor Ons"}',      '/about',         5, true),
  ('nav-contact',     '{"en":"Contact","af":"Kontak"}',     '/contact',       6, true)
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, href = EXCLUDED.href, display_order = EXCLUDED.display_order;

-- Footer sections
INSERT INTO public.footer_sections (id, title, links, display_order, is_active) VALUES
  (
    'fs-navigate',
    '{"en":"Navigate","af":"Navigeer"}',
    '[
      {"label":{"en":"Home","af":"Tuis"},"href":"/"},
      {"label":{"en":"Design Your Deck","af":"Ontwerp Jou Dek"},"href":"/configurator"},
      {"label":{"en":"Shop Materials","af":"Koop Materiale"},"href":"/shop"},
      {"label":{"en":"Deck Kits","af":"Dekstelle"},"href":"/shop/kits"}
    ]',
    1, true
  ),
  (
    'fs-company',
    '{"en":"Company","af":"Maatskappy"}',
    '[
      {"label":{"en":"About Us","af":"Oor Ons"},"href":"/about"},
      {"label":{"en":"Services","af":"Dienste"},"href":"/services"},
      {"label":{"en":"Gallery","af":"Galery"},"href":"/gallery"},
      {"label":{"en":"FAQ","af":"Vrae"},"href":"/faq"}
    ]',
    2, true
  ),
  (
    'fs-support',
    '{"en":"Support","af":"Ondersteuning"}',
    '[
      {"label":{"en":"Contact Us","af":"Kontak Ons"},"href":"/contact"},
      {"label":{"en":"Terms & Conditions","af":"Bepalings & Voorwaardes"},"href":"/terms"},
      {"label":{"en":"Privacy Policy","af":"Privaatheidsbeleid"},"href":"/privacy"}
    ]',
    3, true
  )
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, links = EXCLUDED.links, display_order = EXCLUDED.display_order;

-- ═══════════════════════════════════════════════════════════════
-- HOMEPAGE SECTIONS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.homepage_sections (id, section_key, content, display_order, is_active) VALUES
  (
    'hs-hero',
    'hero',
    '{
      "heading": {"en":"Your Deck, Your Way","af":"Jou Dek, Jou Manier"},
      "subheading": {"en":"Design online, choose your materials, and get an instant quote — or let us handle everything from design to installation.","af":"Ontwerp aanlyn, kies jou materiale en kry ''n onmiddellike kwotasie — of laat ons alles hanteer van ontwerp tot installasie."},
      "cta_primary": {"label":{"en":"Design Your Deck","af":"Ontwerp Jou Dek"},"href":"/configurator"},
      "cta_secondary": {"label":{"en":"Browse Materials","af":"Blaai deur Materiale"},"href":"/shop"},
      "background_image": "/images/hero-deck.jpg"
    }',
    1, true
  ),
  (
    'hs-trust-stats',
    'trust_stats',
    '{
      "items": [
        {"icon":"Ruler","value":"500+","label":{"en":"Decks Built","af":"Dekke Gebou"}},
        {"icon":"Star","value":"4.9","label":{"en":"Google Rating","af":"Google-gradering"}},
        {"icon":"MapPin","value":"Western Cape","label":{"en":"Service Area","af":"Diensgebied"}},
        {"icon":"ShieldCheck","value":"2 Year","label":{"en":"Warranty","af":"Waarborg"}}
      ]
    }',
    2, true
  ),
  (
    'hs-how-it-works',
    'how_it_works',
    '{
      "heading": {"en":"How It Works","af":"Hoe Dit Werk"},
      "steps": [
        {"icon":"PenTool","title":{"en":"Design","af":"Ontwerp"},"description":{"en":"Use our online configurator to choose your deck type, materials, and dimensions.","af":"Gebruik ons aanlyn konfigurator om jou dektipe, materiale en afmetings te kies."}},
        {"icon":"Calculator","title":{"en":"Quote","af":"Kwotasie"},"description":{"en":"Get an instant price breakdown — materials, labour, and delivery included.","af":"Kry ''n onmiddellike prysuiteensetting — materiale, arbeid en aflewering ingesluit."}},
        {"icon":"ShoppingCart","title":{"en":"Order","af":"Bestel"},"description":{"en":"Order a supply-only kit or book full installation with a 50% deposit.","af":"Bestel ''n slegs-voorsiening stel of bespreek volledige installasie met ''n 50% deposito."}},
        {"icon":"Hammer","title":{"en":"Build","af":"Bou"},"description":{"en":"We deliver and install your deck — on time, on budget, built to last.","af":"Ons lewer en installeer jou dek — betyds, binne begroting, gebou om te hou."}}
      ]
    }',
    3, true
  ),
  (
    'hs-materials',
    'materials',
    '{
      "heading": {"en":"Premium Materials","af":"Premium Materiale"},
      "subheading": {"en":"We source the finest decking timber and composite boards in South Africa.","af":"Ons verkry die beste dekhout en saamgestelde planke in Suid-Afrika."},
      "items": [
        {"title":{"en":"CCA Pine","af":"CCA Denne"},"description":{"en":"Affordable, pressure-treated, ideal for ground-level decks.","af":"Bekostigbaar, drukbehandeld, ideaal vir grondvlakdekke."},"image":"/images/pine.jpg"},
        {"title":{"en":"Balau Hardwood","af":"Balau Hardehout"},"description":{"en":"Dense, naturally durable, rich brown tones. 25+ year lifespan.","af":"Dig, natuurlik duursaam, ryk bruin tone. 25+ jaar lewensduur."},"image":"/images/balau.jpg"},
        {"title":{"en":"Garapa","af":"Garapa"},"description":{"en":"Golden-yellow hardwood with excellent dimensional stability.","af":"Goue-geel hardehout met uitstekende dimensionele stabiliteit."},"image":"/images/garapa.jpg"},
        {"title":{"en":"Composite","af":"Saamgesteld"},"description":{"en":"Zero maintenance, splinter-free, eco-friendly. Perfect for pools.","af":"Geen onderhoud, splintergevry, ekovriendelik. Perfek vir swembaddens."},"image":"/images/composite.jpg"}
      ]
    }',
    4, true
  ),
  (
    'hs-cta',
    'cta_banner',
    '{
      "heading": {"en":"Ready to Build Your Dream Deck?","af":"Gereed om Jou Droomdek te Bou?"},
      "subheading": {"en":"Get a free instant quote in under 2 minutes.","af":"Kry ''n gratis onmiddellike kwotasie in minder as 2 minute."},
      "cta": {"label":{"en":"Start Designing","af":"Begin Ontwerp"},"href":"/configurator"}
    }',
    5, true
  )
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, display_order = EXCLUDED.display_order;

-- ═══════════════════════════════════════════════════════════════
-- PAGE SEO METADATA
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.page_seo (id, page_key, title, description) VALUES
  ('seo-home',        'home',         '{"en":"Custom Decking — Design, Supply & Install | The Deck Lab","af":"Pasgemaakte Dekke — Ontwerp, Voorsien & Installeer | The Deck Lab"}',
    '{"en":"Design your perfect deck online, get an instant quote, and order premium materials or full installation. Serving the Western Cape.","af":"Ontwerp jou perfekte dek aanlyn, kry ''n onmiddellike kwotasie, en bestel premium materiale of volledige installasie. Bedien die Wes-Kaap."}'),
  ('seo-about',       'about',        '{"en":"About The Deck Lab — Our Story","af":"Oor The Deck Lab — Ons Storie"}',
    '{"en":"Learn about our team of decking specialists, our craftsmanship philosophy, and why Cape Town homeowners trust The Deck Lab.","af":"Leer oor ons span dekvloerspesialiste, ons vakmanskap-filosofie, en waarom Kaapstadse huiseienaars The Deck Lab vertrou."}'),
  ('seo-services',    'services',     '{"en":"Decking Services — Design, Supply & Installation","af":"Dekdienste — Ontwerp, Voorsiening & Installasie"}',
    '{"en":"From design consultations to full turnkey installation, we offer complete decking services across the Western Cape.","af":"Van ontwerpkonsultasies tot volledige sleutelklaar installasie, ons bied volledige dekdienste regdeur die Wes-Kaap."}'),
  ('seo-contact',     'contact',      '{"en":"Contact The Deck Lab — Get in Touch","af":"Kontak The Deck Lab — Kom in Aanraking"}',
    '{"en":"Get in touch for a free consultation, quote, or any decking questions. We''re based in Cape Town and serve the Western Cape.","af":"Kom in aanraking vir ''n gratis konsultasie, kwotasie, of enige dekvrae. Ons is gebaseer in Kaapstad en bedien die Wes-Kaap."}'),
  ('seo-faq',         'faq',          '{"en":"Frequently Asked Questions — Decking FAQ","af":"Gereelde Vrae — Dek Vrae"}',
    '{"en":"Answers to common questions about deck materials, costs, installation, maintenance, and our services.","af":"Antwoorde op algemene vrae oor dekmateriaal, koste, installasie, onderhoud en ons dienste."}'),
  ('seo-terms',       'terms',        '{"en":"Terms & Conditions | The Deck Lab","af":"Bepalings & Voorwaardes | The Deck Lab"}',
    '{"en":"Read our terms and conditions for deck installations, material supply, and online orders.","af":"Lees ons bepalings en voorwaardes vir dekinstallasies, materiaalvoorsiening en aanlyn bestellings."}'),
  ('seo-privacy',     'privacy',      '{"en":"Privacy Policy | The Deck Lab","af":"Privaatheidsbeleid | The Deck Lab"}',
    '{"en":"How we collect, use, and protect your personal information in compliance with POPIA.","af":"Hoe ons jou persoonlike inligting versamel, gebruik en beskerm in ooreenstemming met POPIA."}'),
  ('seo-shop',        'shop',         '{"en":"Shop Decking Materials — Boards, Fixings & Kits","af":"Koop Dekmateriaal — Planke, Hegstukke & Stelle"}',
    '{"en":"Browse and order premium decking boards, fixings, stains, and complete DIY kits. Nationwide delivery available.","af":"Blaai en bestel premium dekplanke, hegstukke, beitse en volledige DIY-stelle. Landwye aflewering beskikbaar."}'),
  ('seo-configurator', 'configurator', '{"en":"Deck Configurator — Design & Price Your Deck Online","af":"Dek Konfigurator — Ontwerp & Prys Jou Dek Aanlyn"}',
    '{"en":"Choose your deck type, material, dimensions, and extras — get an instant price in under 2 minutes.","af":"Kies jou dektipe, materiaal, afmetings en ekstras — kry ''n onmiddellike prys in minder as 2 minute."}')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

-- ═══════════════════════════════════════════════════════════════
-- LEGAL CONTENT (Terms & Privacy)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO public.site_content (id, section_key, content) VALUES
  (
    'sc-terms',
    'terms',
    '{
      "title": {"en":"Terms & Conditions","af":"Bepalings & Voorwaardes"},
      "last_updated": "2026-02-27",
      "sections": [
        {"heading":{"en":"1. Introduction","af":"1. Inleiding"},"body":{"en":"These terms govern your use of The Deck Lab website and all orders placed through it. By using our site or placing an order, you agree to be bound by these terms.","af":"Hierdie bepalings beheer jou gebruik van The Deck Lab webwerf en alle bestellings wat daardeur geplaas word. Deur ons webwerf te gebruik of ''n bestelling te plaas, stem jy in om deur hierdie bepalings gebind te word."}},
        {"heading":{"en":"2. Quotations & Pricing","af":"2. Kwotasies & Pryse"},"body":{"en":"All quotes are valid for 14 days from the date of issue. Prices include VAT at 15% unless otherwise stated. Material prices may fluctuate due to supplier pricing changes — we will notify you of any changes before proceeding.","af":"Alle kwotasies is geldig vir 14 dae vanaf die datum van uitreiking. Pryse sluit BTW teen 15% in tensy anders vermeld. Materiaalpryse kan wissel weens veranderinge in verskafferspryse — ons sal jou van enige veranderinge in kennis stel voordat ons voortgaan."}},
        {"heading":{"en":"3. Orders & Payment","af":"3. Bestellings & Betaling"},"body":{"en":"A 50% deposit is required to confirm installation orders. The balance is due on completion. Supply-only orders require full payment before dispatch. We accept EFT, credit card (via Paystack), and SnapScan.","af":"''n 50% deposito word vereis om installasie-bestellings te bevestig. Die balans is verskuldig by voltooiing. Slegs-voorsiening bestellings vereis volle betaling voor versending. Ons aanvaar EFT, kredietkaart (via Paystack) en SnapScan."}},
        {"heading":{"en":"4. Delivery","af":"4. Aflewering"},"body":{"en":"Delivery within the Cape Town metro is free for orders over R5,000. Regional and national deliveries are quoted separately. Delivery times are estimates and not guaranteed — we''ll keep you updated on any delays.","af":"Aflewering binne die Kaapstadse metro is gratis vir bestellings bo R5 000. Streeks- en nasionale aflewerings word apart gekwoteer. Afleweringstye is beramings en nie gewaarborg nie — ons sal jou op hoogte hou van enige vertragings."}},
        {"heading":{"en":"5. Installation Warranty","af":"5. Installasiewaarborg"},"body":{"en":"All installations carry a 2-year workmanship warranty. This covers structural defects, loose boards, and substructure issues. Normal wear, weathering, and damage from misuse are excluded. Material warranties are provided by the respective manufacturers.","af":"Alle installasies het ''n 2-jaar vakmanskap-waarborg. Dit dek strukturele defekte, los planke en substruktuurprobleme. Normale slytasie, verwering en skade weens misbruik word uitgesluit. Materiaalwaarborge word deur die onderskeie vervaardigers verskaf."}},
        {"heading":{"en":"6. Cancellations & Refunds","af":"6. Kansellasies & Terugbetalings"},"body":{"en":"Cancellations made more than 7 days before the scheduled start date receive a full deposit refund. Cancellations within 7 days may forfeit up to 50% of the deposit to cover materials already ordered. Custom-cut materials are non-refundable.","af":"Kansellasies wat meer as 7 dae voor die geskeduleerde begindatum gemaak word, ontvang ''n volle deposito-terugbetaling. Kansellasies binne 7 dae kan tot 50% van die deposito verbeur om materiale wat reeds bestel is, te dek. Pasgesnyde materiale is nie terugbetaalbaar nie."}},
        {"heading":{"en":"7. Governing Law","af":"7. Geldende Reg"},"body":{"en":"These terms are governed by the laws of the Republic of South Africa. Any disputes will be subject to the jurisdiction of the Western Cape High Court.","af":"Hierdie bepalings word beheer deur die wette van die Republiek van Suid-Afrika. Enige geskille sal onderhewig wees aan die jurisdiksie van die Wes-Kaapse Hoë Hof."}}
      ]
    }'
  ),
  (
    'sc-privacy',
    'privacy',
    '{
      "title": {"en":"Privacy Policy","af":"Privaatheidsbeleid"},
      "last_updated": "2026-02-27",
      "sections": [
        {"heading":{"en":"1. Introduction","af":"1. Inleiding"},"body":{"en":"The Deck Lab (\"we\", \"us\", \"our\") is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA). This policy explains how we collect, use, store, and share your data.","af":"The Deck Lab (\"ons\") is verbind tot die beskerming van jou persoonlike inligting in ooreenstemming met die Wet op Beskerming van Persoonlike Inligting (POPIA). Hierdie beleid verduidelik hoe ons jou data versamel, gebruik, stoor en deel."}},
        {"heading":{"en":"2. Information We Collect","af":"2. Inligting Wat Ons Versamel"},"body":{"en":"We collect: (a) information you provide — name, email, phone number, delivery address when placing orders or requesting quotes; (b) usage data — pages visited, configurator interactions, anonymised analytics; (c) payment data — processed securely by Paystack, we never store card details.","af":"Ons versamel: (a) inligting wat jy verskaf — naam, e-pos, telefoonnommer, afleweringsadres wanneer jy bestellings plaas of kwotasies versoek; (b) gebruiksdata — bladsye besoek, konfigurator-interaksies, geanonimiseerde ontledings; (c) betaaldata — veilig verwerk deur Paystack, ons stoor nooit kaartbesonderhede nie."}},
        {"heading":{"en":"3. How We Use Your Information","af":"3. Hoe Ons Jou Inligting Gebruik"},"body":{"en":"We use your information to: process orders and deliver products; provide quotations and follow-up communications; improve our website and services; send marketing communications (only with your consent); comply with legal obligations.","af":"Ons gebruik jou inligting om: bestellings te verwerk en produkte af te lewer; kwotasies en opvolgkommunikasie te verskaf; ons webwerf en dienste te verbeter; bemarkingskommunikasie te stuur (slegs met jou toestemming); aan wetlike verpligtinge te voldoen."}},
        {"heading":{"en":"4. Data Sharing","af":"4. Data-deling"},"body":{"en":"We may share your data with: payment processors (Paystack); courier services for deliveries; email service providers (Resend) for transactional emails. We never sell your personal information to third parties.","af":"Ons mag jou data deel met: betaalverwerkers (Paystack); koerierdienste vir aflewerings; e-posdiensverskaffers (Resend) vir transaksionele e-posse. Ons verkoop nooit jou persoonlike inligting aan derde partye nie."}},
        {"heading":{"en":"5. Data Retention","af":"5. Data-bewaring"},"body":{"en":"We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, or as required by law. Order records are kept for 5 years for tax compliance. You may request deletion of your data at any time.","af":"Ons bewaar jou persoonlike data so lank as wat nodig is om die doeleindes waarvoor dit versamel is te vervul, of soos deur die wet vereis. Bestelrekords word vir 5 jaar gehou vir belastingvoldoening. Jy kan te eniger tyd die skrapping van jou data versoek."}},
        {"heading":{"en":"6. Your Rights","af":"6. Jou Regte"},"body":{"en":"Under POPIA, you have the right to: access your personal information; correct inaccurate data; request deletion of your data; object to processing for marketing purposes; lodge a complaint with the Information Regulator. Contact us at privacy@thedecklab.co.za to exercise these rights.","af":"Kragtens POPIA het jy die reg om: toegang tot jou persoonlike inligting te kry; onakkurate data reg te stel; skrapping van jou data te versoek; beswaar te maak teen verwerking vir bemarkingsdoeleindes; ''n klagte by die Inligtingsreguleerder in te dien. Kontak ons by privacy@thedecklab.co.za om hierdie regte uit te oefen."}},
        {"heading":{"en":"7. Cookies","af":"7. Koekies"},"body":{"en":"Our website uses essential cookies for functionality and analytics cookies (Google Analytics) to understand usage patterns. You can manage cookie preferences through your browser settings or our cookie consent banner.","af":"Ons webwerf gebruik noodsaaklike koekies vir funksionaliteit en ontledingskoekies (Google Analytics) om gebruikspatrone te verstaan. Jy kan koekievoorkeure bestuur deur jou blaaierinstellings of ons koekietoestemming-vaandel."}}
      ]
    }'
  )
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

-- ─── Admin User Note ─────────────────────────────────────────
-- To create an admin user:
-- 1. Sign up via the Supabase Auth dashboard or the app's register page
-- 2. Then update the role in user_profiles:
--    UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- 3. The custom_access_token_hook will pick up the role on next login.
