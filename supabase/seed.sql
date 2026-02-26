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

-- ─── Admin User Note ─────────────────────────────────────────
-- To create an admin user:
-- 1. Sign up via the Supabase Auth dashboard or the app's register page
-- 2. Then update the role in user_profiles:
--    UPDATE public.user_profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
-- 3. The custom_access_token_hook will pick up the role on next login.
