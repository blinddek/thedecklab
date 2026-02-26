# THE DECK LAB — Build Index

> **Purpose:** Each numbered build is a self-contained task for Claude Code.
> Feed one build at a time. Each includes context, deliverables, and acceptance criteria.
> Reference documents: PROJECT_BRIEF.md, TECHNICAL_DESIGN.md, CALCULATOR_REFERENCE.md, DECK_DESIGNER_SPEC.md, YOROS_I18N_DARKMODE_STANDARD.md

---

## Build Overview

| Build | Name | Type | Est. Time | Dependencies |
|-------|------|------|-----------|--------------|
| **FOUNDATION** | | | | |
| 01 | Project Scaffold | Setup | 30 min | None |
| 02 | Universal Database Foundation | Migration | 45 min | 01 |
| 03 | Materials & Products Schema | Migration | 30 min | 02 |
| 04 | Configurator Rates Schema | Migration | 30 min | 03 |
| 05 | Orders & Checkout Schema | Migration | 30 min | 04 |
| 06 | Quotes, Leads & Imports Schema | Migration | 20 min | 05 |
| 07 | RLS Policies & Indexes | Migration | 30 min | 06 |
| **DATA & PRICING** | | | | |
| 08 | Seed Data (Materials, Products, Rates) | Backend | 1–2 hrs | 07 |
| 09 | Configurator Pricing Engine | Backend | 1–2 hrs | 08 |
| 10 | Price Import (CSV/XLS) | Backend | 1–2 hrs | 07 |
| **ADMIN** | | | | |
| 11 | Admin: Auth & Layout | Frontend | 1–2 hrs | 07 |
| 12 | Admin: Material & Product Management | Frontend | 2–3 hrs | 11 |
| 13 | Admin: Shop Products (Detail Polish) | Frontend | 2–3 hrs | 12 |
| 14 | Admin: Kits & Bundles | Frontend | 1–2 hrs | 13 |
| 15 | Admin: Configurator Rates & Markup | Frontend | 1–2 hrs | 09, 11 |
| 16 | Admin: Price Import UI | Frontend | 1–2 hrs | 10, 11 |
| **CONFIGURATOR** | | | | |
| 17 | Configurator: Steps 1–2 (Type + Material) | Frontend | 1–2 hrs | 09 |
| 18 | Configurator: Step 3 — Deck Designer Canvas | Frontend | 4–6 hrs ⚠️ | 17 |
| 19 | Configurator: Step 3 — Board Layout Engine | Backend | 3–4 hrs | 18 |
| 20 | Configurator: Step 3 — Cutoff Optimization | Backend | 2–3 hrs | 19 |
| 21 | Configurator: Steps 4–6 (Direction, Finish, Extras) | Frontend | 2–3 hrs | 17 |
| 22 | Configurator: Step 7 (Installation Preference) | Frontend | 1 hr | 21 |
| 23 | Configurator: Step 8 (Quote Summary & Add to Cart) | Frontend | 2–3 hrs | 22 |
| **MATERIALS SHOP** | | | | |
| 24 | Shop: Category & Product Browse | Frontend | 2–3 hrs | 08 |
| 25 | Shop: Product Detail & Variants | Frontend | 2–3 hrs | 24 |
| 26 | Shop: Kit & Bundle Pages | Frontend | 1–2 hrs | 14, 24 |
| **CART & CHECKOUT** | | | | |
| 27 | Unified Cart (Configurator + Shop + Kit) | Frontend | 2–3 hrs | 23, 25 |
| 28 | Saved Quotes & Quote Resume | Full-stack | 1–2 hrs | 23, 27 |
| 29 | Checkout & Paystack Payment | Full-stack | 3–4 hrs | 27 |
| 30 | Admin: Order Management Pipeline | Full-stack | 2–3 hrs | 29, 11 |
| **BUILD PLAN** | | | | |
| 31 | Build Plan PDF (7-Page) | Backend | 3–4 hrs | 20, 29 |
| 32 | Nortier Install Workflow | Full-stack | 1–2 hrs | 31, 30 |
| **CALCULATOR (VALUE-ADD)** | | | | |
| 33 | Deck Materials Calculator | Full-stack | 3–4 hrs | 09, 19 |
| **ADMIN (LEADS)** | | | | |
| 34 | Admin: Quotes & Leads Dashboard | Frontend | 1–2 hrs | 28, 11 |
| **PUBLIC PAGES** | | | | |
| 35 | Public: Homepage & Layout | Frontend | 2–3 hrs | 02 |
| 36 | Public: About, Contact, FAQ, Gallery | Frontend | 2–3 hrs | 35 |
| 37 | SEO, Sitemap, Structured Data | Full-stack | 1–2 hrs | 35, 36 |
| **LAUNCH** | | | | |
| 38 | Final Polish, Performance Audit, Launch Prep | QA | 2–3 hrs | All |

**Total: 38 builds** | **Estimated: 65–95 hrs** | **~15 working days at pace, budget 4 weeks**

---

## Dependency Map

```
01 Scaffold
 └─ 02 Foundation DB
     ├─ 03 Materials Schema
     │   └─ 04 Configurator Rates Schema
     │       └─ 05 Orders Schema
     │           └─ 06 Quotes/Leads Schema
     │               └─ 07 RLS Policies
     │                   ├─ 08 Seed Data ──────────────────────┐
     │                   │   ├─ 09 Pricing Engine ─────────────┤
     │                   │   │   ├─ 15 Admin: Rates & Markup   │
     │                   │   │   ├─ 17 Config: Steps 1–2       │
     │                   │   │   │   ├─ 18 Config: Designer ───┤
     │                   │   │   │   │   ├─ 19 Board Layout ───┤
     │                   │   │   │   │   │   └─ 20 Cutoff Opt ─┤
     │                   │   │   │   │   │       └─ 31 Build Plan PDF
     │                   │   │   │   │   │           └─ 32 Nortier Workflow
     │                   │   │   │   │   │                      │
     │                   │   │   │   └─ 21 Config: Steps 4–6   │
     │                   │   │   │       └─ 22 Config: Step 7  │
     │                   │   │   │           └─ 23 Config: Step 8
     │                   │   │   │               └─ 28 Saved Quotes
     │                   │   │   │                   └─ 34 Admin: Quotes/Leads
     │                   │   │   └─ 33 Calculator              │
     │                   │   ├─ 24 Shop: Browse ───────────────┤
     │                   │   │   └─ 25 Shop: Product Detail    │
     │                   │   │       └─ 26 Shop: Kits          │
     │                   │   │                                  │
     │                   │   └─ 27 Unified Cart ◄──────────────┘
     │                   │       └─ 29 Checkout & Paystack
     │                   │           └─ 30 Admin: Orders
     │                   │               └─ 32 Nortier Workflow
     │                   │
     │                   ├─ 10 Price Import
     │                   │   └─ 16 Admin: Import UI
     │                   │
     │                   └─ 11 Admin: Auth & Layout
     │                       ├─ 12 Admin: Materials
     │                       │   └─ 13 Admin: Products
     │                       │       └─ 14 Admin: Kits
     │                       ├─ 15 Admin: Rates
     │                       ├─ 16 Admin: Import UI
     │                       ├─ 30 Admin: Orders
     │                       └─ 34 Admin: Quotes/Leads
     │
     ├─ 35 Homepage & Layout
     │   └─ 36 Public Pages
     │       └─ 37 SEO
     │
     └─ 38 Final Polish (depends on ALL)
```

---

## Critical Path

The longest dependency chain determines minimum build time:

```
01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 17 → 18 → 19 → 20 → 31 → 32 → 38
                                                    └→ 21 → 22 → 23 → 27 → 29 → 30 → 38
= 18–20 sequential builds on the critical path
```

The designer canvas (Build 18) and board layout engine (Build 19) are the highest-risk items — they're the most complex and most novel. Everything else is proven Yoros patterns.

---

## Parallel Tracks

Once Build 07 (RLS) is complete, three tracks can run in parallel:

**Track A: Admin** (Builds 11–16)
**Track B: Configurator** (Builds 08–09 → 17–23)
**Track C: Shop** (Builds 08 → 24–26)

Tracks converge at Build 27 (Unified Cart).

After Build 29 (Checkout), two more parallel tracks:
**Track D: Build Plan** (Builds 31–32)
**Track E: Admin Orders/Leads** (Builds 30, 34)

Public pages (Builds 35–37) can run any time after Build 02.

---

## Reuse from Blindly

| Build | Reuse | Notes |
|-------|-------|-------|
| 01 | ✅ 90% | Swap brand tokens, add i18n/dark mode |
| 02 | ✅ 100% | Identical SQL |
| 03 | 🔶 30% | Different product model (JSONB i18n fields) |
| 04 | 🔶 20% | Markup cascade reusable, rates are new |
| 05 | 🔶 50% | Orders table similar, items tables different |
| 06 | 🔶 60% | Quote save pattern same, lead types different |
| 07 | ✅ 80% | Same RLS pattern, different table names |
| 08 | 🔶 30% | Seed pattern same, data completely different |
| 09 | 🔶 20% | Markup cascade reusable, pricing logic different |
| 10 | 🔶 30% | Import pattern reusable, simpler than Blindly |
| 11 | ✅ 85% | Same admin shell, different sidebar |
| 12–14 | 🔶 40% | CRUD patterns same, product model different |
| 15 | 🔶 50% | Markup UI reusable, rate management new |
| 16 | 🔶 40% | Import UI pattern, simpler flow |
| 17 | 🔶 30% | Wizard pattern, different content |
| 18–20 | ❌ 0% | Completely new (designer + layout + cutoff) |
| 21–23 | 🔶 30% | Wizard steps, different configurator |
| 24–26 | ❌ 0% | Full e-commerce shop, Blindly has none |
| 27 | 🔶 30% | Cart concept same, mixed cart is new |
| 28 | ✅ 70% | Quote save/share very similar |
| 29 | ✅ 80% | Paystack flow nearly identical (adds deposit) |
| 30 | ✅ 70% | Order management similar |
| 31–32 | 🔶 20% | PDF pattern, completely different content |
| 33 | ❌ 0% | New value-add feature |
| 34 | ✅ 70% | Leads management similar |
| 35 | ✅ 80% | Homepage/layout same pattern |
| 36 | ✅ 80% | Public pages same pattern |
| 37 | ✅ 90% | SEO identical |
| 38 | ✅ 100% | Same checklist |

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Designer canvas complexity (Build 18) | ⚠️ High | Start with grid-snap only, defer freeform. Rectangle + L-shape covers 80% of decks. |
| Board layout algorithm (Build 19) | ⚠️ High | Extensive testing with known examples. Compare against manual calculations. |
| Cutoff optimizer (Build 20) | 🟡 Medium | Greedy algorithm is good enough. Don't over-engineer. |
| Mixed cart (Build 27) | 🟡 Medium | Clean type discrimination per cart item type. |
| Deposit payment flow (Build 29) | 🟡 Medium | First payment = standard Paystack. Balance = payment link later. |
| Build plan PDF (Build 31) | 🟡 Medium | Render SVG → image → embed in PDF. Don't draw with PDF primitives. |
| Scope creep on designer | ⚠️ High | Hard scope: grid-snap + rectangles + L-shapes. Freeform = Phase 2. |

---

## Suggested Build Order (Optimal)

**Week 1: Foundation + Data**
- Day 1: Builds 01–07 (scaffold + all migrations)
- Day 2: Builds 08–10 (seed data, pricing engine, import)
- Day 3: Build 11 (admin auth) + Build 35 (homepage layout)

**Week 2: Admin + Configurator Start**
- Day 4: Builds 12–14 (admin product management)
- Day 5: Builds 15–16 (admin pricing + import UI)
- Day 6: Builds 17–18 (configurator Steps 1–3 canvas)

**Week 3: Designer + Shop**
- Day 7: Builds 19–20 (board layout + cutoff optimization)
- Day 8: Builds 21–23 (configurator Steps 4–8)
- Day 9: Builds 24–26 (materials shop)

**Week 4: Cart, Checkout, Build Plan, Polish**
- Day 10: Builds 27–29 (cart + quotes + checkout)
- Day 11: Builds 30–32 (admin orders + build plan + workflow)
- Day 12: Build 33 (calculator) + Build 34 (admin leads)
- Day 13: Builds 36–37 (public pages + SEO)
- Day 14: Build 38 (final polish + launch prep)

**Total: ~14 working days (3 weeks)** if everything goes smoothly. Budget 4 weeks.
