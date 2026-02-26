# The Deck Lab — Project TODO

> Last updated: 2026-02-26

## Status: ~45% Complete (Foundation + Configurator UI done, shop/admin/canvas pending)

Build specs: `project_brief/build plan/BUILD_INDEX.md`

---

### Phase 1: Foundation (Builds 01–05) — COMPLETE

- [x] Build 01: Project Scaffold (Next.js 16 + Supabase + Tailwind)
- [x] Build 02: Universal Database Foundation (migrations 001–025)
- [x] Build 03: Materials & Products Schema (migration 026)
- [x] Build 04: Configurator Rates & Options Schema (migration 027)
- [x] Build 05: Orders Schema (migration 028)
- [x] Build 06: Quotes & Leads Schema (migration 029)
- [x] Build 07: RLS Policies (migration 030)

### Phase 2: Configurator Wizard (Builds 08–17) — PARTIAL

- [ ] Build 08: Seed Data — materials, products, rates, variants
- [x] Build 09: Pricing Engine — configurator rate-based calculation
- [x] Build 10: Configurator Step 1 — Deck Type (ground, raised, pool, balcony)
- [x] Build 11: Configurator Step 2 — Material Choice (pine, hardwood, composite)
- [x] Build 12: Configurator Step 3 — Dimensions (length × width, m²)
- [x] Build 13: Configurator Step 4 — Board Direction & Profile
- [x] Build 14: Configurator Step 5 — Style & Extras (finish, railings, steps, seating)
- [x] Build 15: Configurator Step 6 — Quote Summary with cost breakdown
- [ ] Build 16: Quote Save & Lead Capture
- [ ] Build 17: Admin Configurator Rates UI

### Phase 3: Designer Canvas (Builds 18–22) — NOT STARTED

- [ ] Build 18: Grid-Snap Canvas — interactive deck shape drawing
- [ ] Build 19: Board Layout Engine — smart board placement algorithm
- [ ] Build 20: Cutoff Optimisation — intelligent offcut reuse
- [ ] Build 21: 3D Preview (optional stretch goal)
- [ ] Build 22: Build Plan PDF — professional installation document

### Phase 4: Shop & E-Commerce (Builds 23–29) — SCAFFOLDED

- [x] Shop page structure (browse, detail, cart, checkout pages exist)
- [ ] Build 23: Materials Catalogue — product data population
- [ ] Build 24: Shop Browse — category filters, search, sorting
- [ ] Build 25: Product Detail — variants, pricing, add-to-cart
- [ ] Build 26: Kits & Bundles — pre-configured deck packages
- [ ] Build 27: Unified Cart — configurator + shop items together
- [ ] Build 28: Cart Upsells — accessories, maintenance products
- [ ] Build 29: Checkout & Paystack — payment integration

### Phase 5: Admin Dashboard (Builds 30–34) — NOT STARTED

- [ ] Build 30: Admin Materials & Products management
- [ ] Build 31: Admin Shop product detail management
- [ ] Build 32: Admin Orders pipeline
- [ ] Build 33: Admin Quotes & Leads dashboard
- [ ] Build 34: Admin Price Import (CSV/XLS)

### Phase 6: Public Pages & Launch (Builds 35–38) — PARTIAL

- [x] Homepage — Deck Lab branding
- [x] About page
- [x] Services page
- [x] Contact page
- [ ] Build 35: FAQ page content
- [ ] Build 36: Legal pages (Terms, Privacy)
- [ ] Build 37: SEO, Sitemap, Structured Data
- [ ] Build 38: Final Polish & Launch Prep

### Critical Path (Next Steps)

1. **Build 08** — Seed data (materials, products, rates) → unlocks shop
2. **Builds 18–20** — Designer Canvas → highest risk, core differentiator
3. **Builds 24–26** — Shop browse + product detail + kits
4. **Build 27** — Unified cart (configurator + shop)
5. **Build 29** — Checkout + Paystack
6. **Build 31** — Build Plan PDF
7. **Build 38** — Final polish & launch
