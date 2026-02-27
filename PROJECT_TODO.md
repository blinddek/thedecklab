# The Deck Lab — Project TODO

> Last updated: 2026-02-27

## Status: ~82% Complete (Foundation + Configurator + Canvas + Shop + Content + SEO + Admin Pricing + Build Plan PDF done)

Build specs: `project_brief/build plan/BUILD_INDEX.md`

---

### Phase 1: Foundation (Builds 01–07) — COMPLETE

- [x] Build 01: Project Scaffold (Next.js 16 + Supabase + Tailwind)
- [x] Build 02: Universal Database Foundation (migrations 001–025)
- [x] Build 03: Materials & Products Schema (migration 026)
- [x] Build 04: Configurator Rates & Options Schema (migration 027)
- [x] Build 05: Orders Schema (migration 028)
- [x] Build 06: Quotes & Leads Schema (migration 029)
- [x] Build 07: RLS Policies (migration 030)

### Phase 2: Configurator Wizard (Builds 08–17) — COMPLETE

- [x] Build 08: Seed Data — 15 products, 56 variants, 9 board dims, 4 kits, bulk pricing
- [x] Build 09: Pricing Engine — configurator rate-based calculation + BOM-based (Mode B)
- [x] Build 10: Configurator Step 1 — Deck Type (ground, raised, pool, balcony)
- [x] Build 11: Configurator Step 2 — Material Choice (pine, hardwood, composite)
- [x] Build 12: Configurator Step 3 — Dimensions (length × width, m²)
- [x] Build 13: Configurator Step 4 — Board Direction & Profile
- [x] Build 14: Configurator Step 5 — Style & Extras (finish, railings, steps, seating)
- [x] Build 15: Configurator Step 6 — Quote Summary with cost breakdown
- [x] Build 16: Quote Save & Lead Capture — save quote form + server actions
- [x] Build 17: Admin Configurator Rates UI — 6-tab hub + markup cascade + pricing simulator

### Phase 3: Designer Canvas (Builds 18–22) — MOSTLY DONE

- [x] Build 18: Grid-Snap Canvas — interactive deck shape drawing (3 modes: quick/designer/consultation)
- [x] Build 19: Board Layout Engine — scanline board placement, joists, bearers, fixings
- [x] Build 20: Cutoff Optimisation — greedy longest-first offcut reuse algorithm
- [x] Canvas → Calculator wiring — layout API, board overlay, BOM panel, loading widget
- [ ] Build 21: 3D Preview (optional stretch goal)
- [x] Build 22: Build Plan PDF — 7-page jsPDF document (cover, board layout, substructure, cut list, screw pattern, shopping list, installation notes)

### Phase 4: Shop & E-Commerce (Builds 23–29) — PARTIAL

- [x] Shop page structure (browse, detail, cart, checkout pages exist)
- [x] Build 23: Materials Catalogue — product data population (via seed)
- [x] Build 24: Shop Browse — category sidebar, material filters, search, sorting, pagination
- [x] Build 25: Product Detail — variant selector, bulk pricing, specs, related products
- [x] Build 26: Kits & Bundles — 4 pre-configured deck packages with component lists
- [ ] Build 27: Unified Cart — configurator + shop items together
- [ ] Build 28: Cart Upsells — accessories, maintenance products
- [ ] Build 29: Checkout & Paystack — payment integration

### Phase 5: Admin Dashboard (Builds 30–34) — PARTIAL

- [x] Admin auth, layout, sidebar (universal platform)
- [x] Admin configurator pricing (Build 17 — rates, deck types, board options, finishes, extras, constants, markup, simulator)
- [ ] Build 30: Admin Materials & Products management
- [ ] Build 31: Admin Shop product detail management
- [ ] Build 32: Admin Orders pipeline
- [ ] Build 33: Admin Quotes & Leads dashboard
- [ ] Build 34: Admin Price Import (CSV/XLS)

### Phase 6: Public Pages & Launch (Builds 35–38) — MOSTLY DONE

- [x] Homepage — Deck Lab branding + homepage sections seed data
- [x] About page
- [x] Services page
- [x] Contact page
- [x] Build 35: FAQ page — 10 bilingual FAQs seeded
- [x] Build 36: Legal pages — Terms & Privacy bilingual content seeded
- [x] Build 37: SEO — sitemap, robots, page_seo for all pages, structured data
- [ ] Build 38: Final Polish & Launch Prep

### Critical Path (Next Steps)

1. **Build 21** — 3D Preview (stretch goal)
2. **Build 27** — Unified cart (configurator + shop)
3. **Build 29** — Checkout + Paystack
4. **Builds 30–34** — Remaining admin dashboard
5. **Build 38** — Final polish & launch
