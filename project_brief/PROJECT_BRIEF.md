# THE DECK LAB — Project Brief

> **Client:** Nortier Group
> **Project:** The Deck Lab — Custom Decking E-Commerce & Configurator Platform
> **Price:** R5,000 (flat rate pilot)
> **Status:** Scoping Complete — Ready for Brand Identity → Build
> **Last Updated:** 19 February 2026

---

## 1. Project Overview

The Deck Lab is a dual-purpose e-commerce platform: a **deck configurator** for customers who want a full deck designed, quoted, and optionally installed — PLUS a **materials shop** for DIY customers buying individual deck boards, fixings, stain, and kit bundles.

Unlike a standard webshop where every product has a fixed SKU, the configurator side calculates pricing dynamically based on deck dimensions (m²), material choice, and selected extras (steps, railings, pergolas, seating, staining). The materials shop side is a traditional e-commerce catalogue with individual items and pre-built kits.

### Business Context

- Part of 4 pilot websites for Nortier Group (Blindly, The Deck Lab, Nortier Cupboards, LMS)
- Decking is a high-value service with strong upsell potential (pergolas, railings, seating)
- Installation service is Western Cape only; materials ship nationally
- Cross-sell opportunity: deck customers often need cupboards (Nortier Cupboards) or blinds (Blindly)
- Client will provide 5-star review and beta-test full Yoros backend

### Two Revenue Streams

| Stream | Customer | Flow | Pricing |
|--------|----------|------|---------|
| **Deck Configurator** | Homeowner wanting a deck built | Configure deck → get instant quote → checkout (deposit or full) → installed | m² rate × area + extras |
| **Materials Shop** | DIY builder / contractor | Browse → add to cart → checkout → ship / collect | Fixed per-unit pricing |

Both streams share the same cart and checkout. A customer could configure a deck AND buy extra stain in the same order.

---

## 2. Brand Identity — "The Deck Lab"

### Concept
Fresh brand, no existing references. Full creative freedom.

### Name
"The Deck Lab" — suggests precision, craftsmanship, and a methodical approach to deck building. The "Lab" implies expertise and innovation, not a generic timber yard.

### Logo Direction
- The name lends itself to a mark that combines wood/deck imagery with a "lab" or precision concept
- Could incorporate deck board lines, wood grain, or a plank motif
- The "Lab" aspect could be subtle — a beaker, flask, or molecule isn't the right direction. Think more "workshop precision" than "science lab"
- Needs to work at all sizes: favicon, mobile nav, hero, vehicle signage
- SVG format, works on light and dark backgrounds

### Typography Direction
- Primary: a strong, grounded heading font — could be slab-serif or a bold sans-serif with character
- Body: clean, readable sans-serif
- Mono: for pricing and technical specs (dimensions, m², etc.)
- Must feel premium-but-approachable, not industrial/construction-heavy

### Colour Palette Direction
- Rooted in wood tones: warm browns, amber, charcoal
- Accent colour that pops against wood photography: could be a deep green (forest/nature connection), burnt orange, or a sophisticated teal
- Must work against outdoor/deck photography (sunlight, gardens, patios)
- Needs a light neutral for backgrounds (not pure white — something warm)
- Dark mode NOT required for this project (consumer-facing shop)

### Overall Brand Mood
- Craftsmanship and quality — handmade feel, attention to detail
- Outdoor living — sunshine, entertaining, family gatherings
- Premium but accessible — not a timber merchant, not a luxury architect
- Trustworthy and professional — people are spending R20k+ on decks
- Warm and natural — wood, nature, outdoor spaces

---

## 3. Customer Journey — Deck Configurator Flow

The configurator is a guided, step-by-step wizard (similar to Blindly's blind configurator but adapted for decking). This handles the "design your deck" side of the business.

### Step 1: Deck Type
**Question:** "What kind of deck are you planning?"

Visual cards:
- **Ground-Level Deck** — flush with the ground or slightly raised. Ideal for flat gardens, patios, and pool surrounds.
- **Raised Deck** — elevated above ground level. Requires substructure and often includes steps and railings. For sloped gardens, balconies, and elevated entertaining areas.
- **Pool Deck** — specifically designed for pool surrounds. Moisture-resistant materials, non-slip finish, drainage-friendly.
- **Balcony / Rooftop Deck** — overlay for existing concrete balconies or flat roofs. Lightweight composite or tile-on-pedestal options.

Each card: lifestyle photo + 1-line description. Selection determines which extras are applicable (e.g., raised decks need railings, ground-level may not).

### Step 2: Material Choice
**Question:** "What material do you prefer?"

Cards grouped by material family:
- **Treated Pine (CCA)** — affordable, versatile, traditional. Can be stained any colour. From R X/m²
- **Hardwood (Balau)** — naturally durable, rich grain, premium look. From R X/m²
- **Hardwood (Garapa)** — golden tones, excellent durability, ages beautifully. From R X/m²
- **Composite / WPC** — low maintenance, consistent colour, eco-friendly. No staining needed. From R X/m²

Each card shows: material swatch, key features (durability rating, maintenance level, lifespan), starting m² price.

### Step 3: Deck Shape & Dimensions
**Question:** "Design your deck"

Three entry modes:
- **Quick:** Length (m) × Width (m) for simple rectangles — instant m² estimate
- **Designer:** Interactive canvas for any shape — grid-snap templates (L, T, U, wrap-around) or freeform polygon drawing. See DECK_DESIGNER_SPEC.md for full specification.
- **Consultation:** "My deck is complex — book a site visit" → lead capture

The designer provides:
- Live area calculation from the actual drawn shape
- Board-by-board layout preview on the canvas
- Cutoff optimization (offcuts from long boards reused in shorter sections)
- Smart board width recommendations (avoids ugly ripped last boards)
- Joist and bearer auto-placement based on span tables
- Exact bill of materials (not m² estimates)

For simple rectangles, the quick input is enough. For anything else, the designer unlocks the full build plan PDF after purchase.

### Step 4: Board Direction & Profile
**Question:** "How should the boards run?"

Visual options:
- **Lengthwise** — boards run parallel to the longest side
- **Widthwise** — boards run parallel to the shortest side
- **Diagonal** — boards at 45° (uses ~10% more material)
- **Herringbone / Chevron** — pattern layout (uses ~15% more material, premium labour)

Board profile (if applicable to material):
- **Standard** — flat, smooth finish
- **Grooved** — ribbed surface for grip (recommended for pool decks)
- **Brushed** — textured, more natural feel

These choices affect material quantity calculations and labour pricing.

### Step 5: Colour / Finish
**Question:** "Choose your finish"

**For treated pine:** Stain colour swatches (natural, honey, walnut, charcoal, ebony, mahogany, clear seal). Shows "Staining service included" or "Staining service: + R X/m²" as an optional extra.

**For hardwood:** Natural oil options (clear, tinted). Hardwood is typically oiled, not stained.

**For composite:** Colour from manufacturer range (factory colours — brown, grey, charcoal, teak, etc.)

Colour disclaimer (same pattern as Blindly): "Colours shown on screen may vary from the actual product. We recommend requesting a free sample."

### Step 6: Extras & Add-Ons
**Question:** "Would you like any of these with your deck?"

Checklist with visual cards and pricing:
- **Steps** — Number of steps × width. Price per step calculated by width. "How many steps? [1-10] × Step width: [same as deck / custom]"
- **Railings / Balustrades** — Linear metres of railing. Material options (wood, stainless steel + wood, glass + wood). Price per linear metre.
- **Built-in Seating** — Linear metres of bench seating. Price per linear metre.
- **Built-in Planters** — Count × size. Fixed price per planter.
- **Pergola / Shade Structure** — Dimensions (L × W). Price per m² of pergola.
- **Staining / Sealing** — Per m² of deck area. Only for timber (not composite).

Each extra shows a price preview that updates live as quantities change.

### Step 7: Installation Preference
**Question:** "How would you like to proceed?"

Three paths:
- **Full Installation (Western Cape only)** — "We build it for you. Design → materials → installation → handover." Price includes labour. Deposit required (50%), balance on completion.
- **Supply Only (Ship Nationally)** — "We supply all materials cut to specification. You or your contractor installs." Materials only, no labour. Full payment upfront. Delivery fee applies.
- **Consultation First** — "Not sure yet? Book a free site visit and we'll measure, advise, and provide a detailed quote." Triggers a consultation booking request (lead capture).

### Step 8: Quote Summary & Checkout
**Question:** "Here's your deck quote"

Full breakdown:
```
Deck: Raised Deck — Treated Pine (CCA)
Dimensions: 4.5m × 3.2m = 14.4 m²
Board Direction: Lengthwise, Standard profile
Finish: Walnut stain

Materials:
  Deck boards (14.4 m²):              R 8,640
  Substructure (joists, bearers):      R 3,200
  Fixings (screws, spacers):           R   480
  Stain (walnut, 14.4 m²):            R 1,440

Extras:
  4 steps × 1.2m wide:                R 3,840
  Railings (6.4 linear metres):       R 5,120
  Staining service (14.4 m²):         R 2,160

Installation:
  Labour:                              R 7,200

Subtotal:                              R 32,080
Delivery:                              R 1,500
VAT (15%):                             R 5,037
Total:                                 R 38,617

Deposit (50%):                         R 19,309
Balance on completion:                 R 19,309
```

Actions:
- **Pay Deposit → Proceed** (Paystack)
- **Save as Quote** (email link, 30-day expiry)
- **Download PDF Quote**
- **Share via WhatsApp**
- **Book a Consultation Instead**

---

## 4. Materials Shop

The second revenue stream — a traditional e-commerce catalogue for DIY buyers and contractors.

### Product Categories

**Deck Boards:**
- Treated Pine boards (various dimensions: 38×114mm, 38×152mm, etc.)
- Hardwood boards (Balau, Garapa — various dimensions)
- Composite boards (by brand/colour)
- Listed per board with length options (2.4m, 3.0m, 3.6m, 4.8m)

**Substructure:**
- Construction pine joists and bearers
- Steel post brackets / stirrups
- Concrete deck blocks
- Adjustable pedestals (for balcony/rooftop)

**Fixings & Accessories:**
- Deck screws (by box: 100, 250, 500)
- Hidden fasteners / clips
- Spacers
- Joist tape / flashing

**Finishing:**
- Deck stain (by colour, by tin size: 1L, 5L, 20L)
- Deck oil / sealer
- Deck cleaner / prep
- Application tools (brushes, rollers, applicator pads)

**Kits / Bundles:**
- "Complete Deck Kit — 10m² Treated Pine" (includes boards, substructure, fixings, stain)
- "Complete Deck Kit — 15m² Composite"
- "Railing Kit — 3m Stainless + Wood"
- "Step Kit — 3 steps × 1.2m"
- Kits are pre-configured bundles at a small discount vs buying individually

### Product Features
- Each product: name, description, images, dimensions, price, stock status
- Variants: length, colour, size (e.g., stain in 1L/5L/20L)
- "Frequently bought together" suggestions
- Bulk pricing tiers (10+ boards = 5% off, 50+ = 10% off)
- Stock status: in stock / low stock / out of stock / made to order
- Delivery estimates per product

---

## 5. Pricing Model

### Deck Configurator Pricing

**Base rate:** Per m² by material type. Admin-configurable.

| Material | Supplier Cost/m² | Markup | Customer Price/m² |
|----------|------------------|--------|--------------------|
| Treated Pine (CCA) | R X | Y% | R Z |
| Hardwood (Balau) | R X | Y% | R Z |
| Hardwood (Garapa) | R X | Y% | R Z |
| Composite (WPC) | R X | Y% | R Z |

**Substructure:** Calculated as a percentage of deck area cost (e.g., 35-40% of board cost) or a flat m² rate. Admin-configurable.

**Fixings:** Calculated per m² (e.g., R33/m² for screws + spacers). Admin-configurable.

**Extras pricing:**

| Extra | Pricing Model |
|-------|--------------|
| Steps | Per step × width (e.g., R960 per step per 1.2m width) |
| Railings | Per linear metre × material type |
| Built-in seating | Per linear metre |
| Built-in planters | Fixed per unit × size |
| Pergola | Per m² |
| Staining service | Per m² of deck area |

**Labour:** Per m² rate for standard decks. Complex builds (raised, multi-level) have a multiplier. Admin-configurable.

**Board direction multiplier:**
- Lengthwise / widthwise: 1.0×
- Diagonal: 1.10× (10% more material)
- Herringbone: 1.15× (15% more material, higher labour)

### Materials Shop Pricing

Standard e-commerce pricing:
- Fixed price per unit
- Bulk discount tiers (admin-configurable)
- Kit pricing (sum of components minus bundle discount)

### Markup Cascade (same pattern as Blindly)

Resolution order for configurator pricing:
1. Product-specific markup (e.g., "Balau boards get 35% markup")
2. Material-category markup (e.g., "All hardwood gets 30%")
3. Global markup (default fallback)

### Delivery Fees

- **Western Cape (installation):** Included in installation price
- **Western Cape (supply only):** Flat fee or free over threshold
- **National shipping (materials):** Weight/volume-based or flat rate per order size
- Admin-configurable thresholds and fees

---

## 6. Admin Panel Requirements

Standard Yoros admin panel plus Deck Lab-specific features:

### Product Management
- **Materials:** Full CRUD for shop products (boards, fixings, stain, kits)
- **Configurator rates:** m² pricing per material, extras pricing, labour rates
- **Kit builder:** Create bundles from individual products with bundle discount
- **Stock management:** Track stock levels, low stock alerts
- **Bulk pricing tiers:** Configure quantity break pricing

### Price Import
- CSV/XLS import for bulk price updates from suppliers
- Manual price editing for individual products
- Price history log (audit trail of changes)

### Order Management
- Same pipeline as Blindly: new → confirmed → ordered_materials → in_progress → completed
- Split view: configurator orders (with installation details) vs shop orders (ship/collect)
- Supplier purchase order generation
- Profit view per order (cost vs selling price)

### Lead Management
- Consultation requests (from configurator Step 7)
- Quote follow-ups (saved quotes not yet converted)
- Sample requests
- Contact form submissions

### Calculators (Admin Tools)
- **Material calculator:** Input deck dimensions → output board count, joist count, screw count, stain volume
- **Pricing simulator:** Same as Blindly — test pricing before going live
- **Margin analyser:** Per-product and per-order profit visibility

---

## 7. Public Pages

All content from database — zero hardcoding per Yoros standards.

### Homepage
- Hero: lifestyle photography, tagline, primary CTA ("Design Your Deck" → configurator)
- Category showcase: 4 material types with lifestyle cards
- "How It Works" section: 4-step process
- Featured products from shop (seasonal/promoted)
- Trust signals: craftsmanship, warranty, service area, materials quality
- Gallery preview: recent installations
- Newsletter signup
- CTA banner → configurator

### Products / Shop
- Category browse → product listing → product detail
- Filters: material, price range, in-stock, dimensions
- Product cards: image, name, price, "Add to Cart"
- Product detail: multiple images, full description, specs table, related products, reviews
- "Frequently bought together" upsell

### Gallery / Portfolio
- Grid of installation photos
- Filter by: deck type, material, location
- Lightbox view
- Each project: photos, description, specs (material, area, extras), location

### About
- Company story (part of Nortier Group)
- Service area map
- Team / craftsmanship
- Materials sourcing philosophy

### Contact
- Contact form (→ contact_submissions table)
- Phone, email, WhatsApp
- Service area info
- "Book a Consultation" CTA
- Business hours

### FAQ
- Grouped by: materials, pricing, installation, maintenance, delivery
- Accordion style
- SEO-optimised (FAQPage structured data)

### Resources / Guides (stretch goal)
- "How to choose deck material"
- "Deck maintenance guide"
- "Measuring your space"
- Blog-style content for SEO

---

## 8. Technical Requirements

### Stack
Standard Yoros: Next.js (App Router, TypeScript), Tailwind + shadcn/ui, Supabase, Paystack, Resend, Vercel.

### Key Integrations
- **Paystack:** Checkout for both configurator and shop orders. Deposit payments for installation orders.
- **Resend:** Order confirmations, quote emails, follow-up sequences, consultation confirmations.
- **Supabase Storage:** Product images, gallery photos, media library.
- **Supabase Auth:** Admin-only (no customer accounts — guest checkout like Blindly).

### Payment Flows

**Shop orders:** Full payment upfront via Paystack. Standard e-commerce flow.

**Configurator — Supply Only:** Full payment upfront via Paystack.

**Configurator — Full Installation:** Deposit payment (50%) at checkout. Balance invoiced on completion. Two Paystack transactions per order.

### Performance Targets
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- Lighthouse SEO: 95+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- API response times: < 200ms

### SEO
- All pages: unique title, description, OG image
- Structured data: Organization, LocalBusiness, Product, FAQPage, BreadcrumbList
- Dynamic sitemap from database
- robots.txt (block admin, API, order pages)

---

## 9. Scope Boundaries

### In Scope (R5k Pilot)
- Full brand identity (logo, colours, typography)
- Deck configurator (8-step wizard + checkout)
- **Deck Designer** (interactive canvas — grid-snap + freeform polygon, board layout engine, cutoff optimization)
- **Build Plan PDF** (board-by-board layout, joist/bearer positions, cut list with offcut tracking, screw pattern, shopping list, installation notes)
- Materials shop (categories, products, variants, cart, checkout)
- Kit/bundle system
- **Deck Materials Calculator** (value-add — standalone /calculator page, SEO magnet, shop funnel)
- Admin panel (products, pricing, orders, leads, settings, media)
- Public pages (home, products, gallery, about, contact, FAQ)
- Paystack integration (full payment + deposit flow)
- Transactional emails (order confirmation, quote, status updates)
- SEO fundamentals
- Responsive design (mobile-first)

### Out of Scope (Future)
- Customer accounts / login (guest checkout for pilot)
- Live chat
- Contractor portal (bulk ordering for trade customers)
- 3D deck visualiser
- Integration with accounting software
- Multi-language support
- Reviews / ratings system
- Blog / content management
- Loyalty / rewards programme

### Value-Add Feature: Deck Materials Calculator

**This is NOT a stretch goal — it's a core deliverable.** The Deck Materials Calculator is the "under-promise, over-deliver" feature that the client didn't ask for but will love. It's a standalone public tool that does one thing brilliantly: tell someone exactly what they need to build their deck.

**What it does:**

The user inputs their deck dimensions and the calculator outputs a complete bill of materials:

```
── Your Deck: 4.5m × 3.2m (14.4 m²) ──

Board Direction: Lengthwise
Material: Treated Pine (CCA)

┌──────────────────────────────────────────────────────┐
│  DECK BOARDS                                         │
│                                                      │
│  Recommended: 38mm × 114mm boards                    │
│  Board length: 3.6m (closest to 3.2m width)          │
│  Boards needed: 40 boards                            │
│  (4500mm ÷ 114mm spacing = 39.5 → round up to 40)   │
│                                                      │
│  💡 Why 114mm? For a 3.2m run, 114mm boards give     │
│     clean spacing without ripping the last board.     │
│     152mm would leave a 76mm sliver at the edge.     │
│                                                      │
│  Cost: 40 × R89 = R 3,560                            │
├──────────────────────────────────────────────────────┤
│  SUBSTRUCTURE                                        │
│                                                      │
│  Joists: 38mm × 114mm × 4.8m treated pine            │
│  Joist spacing: 400mm centres                        │
│  Joists needed: 9 joists                             │
│  (3200mm ÷ 400mm = 8 spaces = 9 joists)             │
│                                                      │
│  Bearers: 38mm × 152mm × 4.8m treated pine           │
│  Bearer spacing: 1200mm centres                      │
│  Bearers needed: 4 bearers                           │
│  (4500mm ÷ 1200mm = 3.75 → 4 bearers)               │
│                                                      │
│  Cost: (9 × R125) + (4 × R168) = R 1,797            │
├──────────────────────────────────────────────────────┤
│  FIXINGS                                             │
│                                                      │
│  Deck screws: 8 per board × 40 boards = 320 screws  │
│  → 2 boxes of 200 (R189 each)                        │
│  Spacers: 1 per board = 40 spacers → 1 pack of 50   │
│  Joist tape: 9 joists × 4.8m = 43.2m → 2 rolls      │
│                                                      │
│  Cost: R 378 + R 85 + R 198 = R 661                  │
├──────────────────────────────────────────────────────┤
│  FINISHING                                           │
│                                                      │
│  Deck stain coverage: ~8 m² per litre (2 coats)     │
│  You need: 14.4m² × 2 coats ÷ 8 = 3.6L → 1× 5L tin │
│                                                      │
│  Cost: R 549                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ESTIMATED TOTAL: R 6,567                            │
│  (Materials only — excludes labour & delivery)       │
│                                                      │
│  ── Compare Materials ──                             │
│  Treated Pine:  R  6,567 (selected)                  │
│  Balau:         R 12,340                             │
│  Garapa:        R 14,890                             │
│  Composite:     R 16,200                             │
│                                                      │
└──────────────────────────────────────────────────────┘

[Add All to Cart — R 6,567]   [Download Bill of Materials]
[Get This Deck Installed →]   [Save & Email to Myself]
```

**Why this is a killer value-add:**

1. **SEO magnet** — "deck material calculator south africa" is a high-intent search with near-zero competition. This page will rank.
2. **Lead generation** — every calculation captures intent. "Save & email" captures contact info. "Get this installed" feeds the configurator.
3. **Trust builder** — showing the math (board count, spacing logic, why a certain width is recommended) builds credibility. The client looks like an expert, not just a retailer.
4. **Shop funnel** — "Add all to cart" converts a free tool into a sale. Each line item links to the actual shop product.
5. **Comparison hook** — showing all 4 material prices side-by-side makes the user explore options. The pine user sees balau and thinks "what if..."
6. **Shareable** — contractors and homeowners forward this to each other. It's genuinely useful.

**Smart calculations the tool performs:**
- Recommends optimal board width based on deck dimensions (avoids ugly ripped last boards)
- Calculates joist and bearer spacing per structural best practice
- Accounts for board direction (diagonal = ~10% more waste)
- Adjusts screw count based on board width and count
- Calculates stain/oil volume based on coverage rate and number of coats
- Shows the "why" behind each recommendation (tooltips or inline explainers)

**Material swap:** One-tap toggle between pine/balau/garapa/composite updates the entire bill of materials with new prices. The board dimensions, joist specs, and fixings may change between materials too (composite uses different fasteners).

**Route:** `/calculator` — standalone page, no account required, fully public.

### Stretch Goals (if time allows)
- Deck visualiser: top-down 2D layout view showing board pattern and dimensions
- Instagram gallery integration: pull latest posts as social proof
- L-shaped deck support in calculator (two rectangles)
- Export bill of materials as PDF with Deck Lab branding

---

## 10. Yoros Value-Add Philosophy

> **Every project gets something the client didn't ask for.**

The Deck Materials Calculator is this project's value-add — a feature the client didn't request that makes their business look smarter, generates leads, and drives sales. This is a deliberate Yoros strategy:

| Principle | Application |
|-----------|------------|
| Under-promise | Scope says: configurator + shop + admin panel |
| Over-deliver | Also ships: a standalone calculator tool that becomes the site's top SEO page |
| 5-star hook | Client tells everyone "they even built a materials calculator I didn't ask for" |
| Template value | The calculator pattern (input dimensions → bill of materials → add to cart) is reusable across every Nortier project |

This approach has compounding returns:
- The client gives a genuine 5-star review because they feel they got more than they paid for
- The calculator becomes a template for future Yoros projects (cupboard materials calculator, blind materials calculator)
- Nortier sees the template value and pitches it to blind suppliers (revenue for both Nortier and Yoros)
- Every future client gets their own value-add, building a reputation of over-delivery

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Build time | 2–3 weeks |
| Configurator completion rate | >60% start Step 1 → reach Step 8 |
| Average order value (configurator) | R15,000+ |
| Average order value (shop) | R2,000+ |
| Quote-to-order conversion | >25% |
| Monthly organic traffic (6 months) | 500+ visits |
| Lighthouse scores | 90/95/95/95 (perf/a11y/bp/seo) |
