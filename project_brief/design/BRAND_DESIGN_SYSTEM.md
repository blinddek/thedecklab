# THE DECK LAB — Brand Identity & Design System

> **Version:** 1.0
> **Date:** 20 February 2026
> **Status:** Research complete — ready for implementation

---

## 1. Competitive Landscape

### International (aspirational)
- **TimberTech** (US) — Premium composite. Hero-video-heavy, configurator-lite. Deep earth tones, lifestyle-first. Gold standard for aspirational decking.
- **Trex** (US) — Market leader. "Deck Designer" 3D tool (clunky but proves interactive design drives conversion).
- **Millboard** (UK) — Composite as premium brand. "Find Your Style" quiz funnel. Rich project photography.

### South African (direct competitors)
- **Deck It SA** — Basic Shopify shop. No configurator, no calculator.
- **Cape Decking** — WC installer. Gallery-heavy. "Get a Quote" form (friction). No pricing transparency.
- **GG Timbers / Timber Connection** — Trade suppliers. Wholesale feel. PDFs for price lists.

### The Gap
**Nobody in SA combines interactive deck designer + instant pricing + e-commerce.** Every SA site is either "request a quote" friction or a timber catalogue. The Deck Lab owns this space completely.

---

## 2. Brand Personality

### Position
**"Your deck, designed by you, built by experts."**

Between budget timber yards and premium installation-only companies. For homeowners who want to visualise and price their deck themselves — then decide DIY or installation.

### Voice
- Confident and expert — these people know wood
- Direct and honest — transparent pricing, no gatekeeping
- Warm and enthusiastic — deck building creates outdoor living spaces
- Technical when needed — speaks to DIY builders and homeowners
- South African without forcing it

### The Hero Feature
**The deck designer tool IS the brand's personality made interactive.** "You design it. We calculate it. Down to the last screw." If we show exactly 31 boards, 11 joists, 682 screws — you trust us to build it right.

---

## 3. Colour Palette

### Primary Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| **Background** | Sandstone | `#F7F3EE` | Primary page background |
| **Surface** | Bleached Oak | `#FDFBF8` | Cards, modals, panels |
| **Text Primary** | Ironwood | `#1E1E1C` | Headings, primary text |
| **Text Secondary** | Driftwood | `#736B62` | Descriptions, labels |
| **Border** | Grain | `#DED6CC` | Dividers, input borders |
| **Accent** | Ember | `#D4622A` | CTAs, active states, prices |
| **Accent Hover** | Kiln | `#B5501E` | Hover/pressed state |
| **Accent Light** | Glow | `#FDF0E8` | Selected card tints, badges |
| **Success** | Canopy | `#3D7A4A` | Confirmations, savings, "in stock" |
| **Warning** | Honey | `#C9932A` | Caution, "low stock" |
| **Error** | Jarrah | `#B83C2B` | Errors, "out of stock" |
| **Dark** | Charcoal Ash | `#2A2826` | Footer, admin sidebar |

### Why Ember?
Fire — braai evenings on the deck, something being forged. Bold enough for CTAs while feeling natural alongside wood photography. Miles from generic SA e-commerce blue.

### Dark Mode

| Role | Light | Dark |
|------|-------|------|
| Background | `#F7F3EE` | `#1E1D1B` |
| Surface | `#FDFBF8` | `#2A2826` |
| Text Primary | `#1E1E1C` | `#F7F3EE` |
| Text Secondary | `#736B62` | `#A69E95` |
| Border | `#DED6CC` | `#3E3A36` |
| Accent | `#D4622A` | `#E07438` |

### Designer Canvas Colours

| Element | Light | Dark |
|---------|-------|------|
| Canvas grid | `#E8E2DA` | `#333028` |
| Board fill | `#C9A96E` | `#A68B56` |
| Offcut board | `#7BAD6E` | `#5C8A50` |
| Joist line | `#8B7355` | `#6B5A42` |
| Bearer line | `#5C4A3A` | `#4A3D30` |
| Selection | `#D4622A40` | `#E0743840` |

---

## 4. Typography

**Headings: Plus Jakarta Sans** — Bold geometric sans. "Precision workshop" quality matching "The Lab." Weights: 600, 700, 800. Google Fonts.

**Body: Inter** — Most readable screen font. Variable, excellent number rendering. Weights: 400, 500, 600.

**Mono: IBM Plex Mono** — Warm monospace for dimensions (4.5m × 3.2m), board counts (31 boards), pricing (R43,046). Weights: 400, 500.

### Scale
```css
--text-hero: 3.5rem;      --text-h1: 2.5rem;
--text-h2: 1.875rem;      --text-h3: 1.5rem;
--text-h4: 1.25rem;       --text-lg: 1.125rem;
--text-base: 1rem;        --text-sm: 0.875rem;
--text-price-hero: 2rem;  --text-price-lg: 1.5rem;
--text-price-md: 1.125rem;--text-price-sm: 0.875rem;
```

---

## 5. Logo Brief

### Concept: "Precision Planks"
3–5 horizontal parallel lines of varying lengths — top-down view of laid deck boards. Clean-cut ends. One line offset or highlighted in Ember to suggest "next board being placed."

**Wordmark:** "THE DECK LAB" — Plus Jakarta Sans ExtraBold. "THE" and "LAB" lighter weight, "DECK" heavier.

**Tagline lockup:** "Design. Build. Live." — Inter Regular, wide tracking.

**Works in:** Ironwood, Bleached Oak, and Ember. Single-colour applications.

**Avoid:** Trees, leaves, tools, houses, lab/science imagery, wood grain textures.

**Variations:** Full horizontal, stacked, mark only (favicon), dark variant, single colour.

---

## 6. Component Styles

### Buttons
- Primary: `bg-ember text-white rounded-lg px-6 py-3 font-semibold hover:bg-kiln`
- Secondary: `border-2 border-ember text-ember hover:bg-ember hover:text-white`
- Ghost: `text-driftwood hover:text-ironwood hover:bg-grain/30`

### Cards
- Product: `bg-oak rounded-xl border-grain overflow-hidden hover:shadow-lg hover:-translate-y-0.5`
- Selection (configurator): `border-2 border-grain hover:border-ember` → Selected: `border-ember bg-glow ring-2 ring-ember/20`
- Material card: + durability stars (ember fill), feature pills, mono price

### Designer Canvas
- Container: `bg-white rounded-xl border-grain shadow-inner`
- Boards: warm wood fill (`#C9A96E`), offcuts green-tinted (`#7BAD6E`)
- Joists: dashed lines, Bearers: thick solid lines
- Dimension labels: mono font, small

### Swatches
- 48px circles, 2px border. Selected: ember border + ring + checkmark + scale-110
- "No Finish": dashed border, diagonal line

### Price Display
- Large totals: `font-mono text-2xl font-medium tracking-tight`
- Line items: `font-mono text-base text-driftwood` right-aligned
- Savings: `font-mono text-canopy`
- Deposit box: `bg-glow rounded-lg p-4 font-mono`

### Progress Bar
- Track: `h-1 bg-grain rounded-full`
- Fill: `h-1 bg-ember rounded-full` with width transition
- Steps: Completed `bg-ember`, Current `bg-ember ring-4 ring-ember/20`, Upcoming `border-grain bg-white`

---

## 7. Tailwind Config

```js
colors: {
  brand: {
    sandstone: '#F7F3EE', oak: '#FDFBF8',
    ironwood: '#1E1E1C', driftwood: '#736B62', grain: '#DED6CC',
    ember: '#D4622A', kiln: '#B5501E', glow: '#FDF0E8',
    canopy: '#3D7A4A', honey: '#C9932A', jarrah: '#B83C2B',
    ash: '#2A2826',
  },
  canvas: {
    grid: '#E8E2DA', board: '#C9A96E', offcut: '#7BAD6E',
    joist: '#8B7355', bearer: '#5C4A3A',
  },
},
fontFamily: {
  display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'monospace'],
},
```

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Key decisions |
|-----------|-------|--------------|
| Mobile | <640px | Full-width canvas, bottom sheet, sticky price bar |
| Tablet | 640–1023px | 2-col grids, canvas + panel begins |
| Desktop | 1024–1279px | Full layout, canvas max space, sidebar quote |
| Wide | 1280px+ | Max-width container, generous whitespace |

---

## 9. Imagery Guidelines

**Lifestyle shots:** South African outdoor spaces — Western Cape gardens, Cape Town homes, wine farm patios. Golden hour light. People using the deck: braai, sunset drinks, kids playing. Show context — garden, pool, mountains, fynbos. NOT American suburbs or grey UK weather.

**Material close-ups:** Macro wood grain. Pine CCA (green-raw → rich stained), balau (dark honey), garapa (golden), composite (uniform). Shot on neutral backgrounds. Show texture you want to touch.

**Project documentation:** Before/during/after sequences. Show substructure (proves expertise). Detail shots: board spacing, screw pattern, railing joins.

**Placeholder strategy:** Unsplash deck/patio photography with warm SA feel until Nortier provides real photos. Flag every placeholder in admin.

---

## 10. Animations & Micro-interactions

### Designer Animations (these sell the tool)

**Board placement cascade:** When shape is defined/resized, boards fill in from one edge in a staggered cascade (50ms delay per board). Each board slides in along its lane. This is the money animation — shows precision.

**Offcut highlight:** When optimizer assigns an offcut, source board flashes green, dotted line connects to new board, new board fills green. Shows the intelligence of the system.

**Number counter:** Area, board count, waste %, and price animate as rolling counters when values change. IBM Plex Mono — numbers feel like they're being calculated in real time.

**Shape snap:** Near grid points, show magnetic pull — edge jumps last few pixels. Confirms snap behaviour.

### General Animations

- Route changes: subtle fade (200ms)
- Configurator steps: slide right (forward), left (backward), 300ms ease-out
- Scroll reveals: fade-up on intersection, 50ms stagger between grid items
- Buttons: scale(0.98) on press
- Cards: translateY(-2px) + shadow on hover
- Swatches: scale(1.1) + border change on select
- Price updates: counter animation (200ms)
- Loading: skeleton loaders in Grain colour, shimmer during price calculation

---

## 11. The Designer as Brand — Visual Language

The deck designer isn't just a feature — it's the brand's visual identity made interactive. Design elements from the designer should leak into the rest of the site:

- **Grid pattern:** The 100mm canvas grid appears as a subtle background texture on section dividers and the hero
- **Board lines:** Horizontal parallel lines (like laid boards) appear as decorative elements in section headers, footer, loading states
- **Dimension labels:** Measurement annotation style ("4.5m" with leader lines) appears in "How It Works" and material cards
- **Offcut green:** The ♻ colour appears whenever savings or sustainability is mentioned
- **Mono numbers:** Prices and specs across the ENTIRE site use IBM Plex Mono — this isn't just for the designer, it's the brand saying "we're precise"

The tool IS the brand. Every page should feel like an extension of the designer.

---

## 12. Homepage Strategy — "Sell the Tool"

The homepage hero doesn't lead with a lifestyle image of a deck. It leads with the **designer tool in action** — an animated or static visual of boards being placed, numbers calculating. The message: this isn't a catalogue, it's a design studio.

```
Hero: "Design Your Deck"
  Left: headline + subtext + dual CTA
  Right: animated designer preview — boards placing, numbers counting
  Trust line in mono: "31 boards. 682 screws. R43,046."

How the Designer Works: 3 visual steps
  Draw → Calculate → Build
  [Try It Now — It's Free →]

Materials: 4 cards with grain textures + from-prices
  Click any → enters configurator with material pre-selected

Calculator Promo: embedded mini-calculator or preview
  "Enter dimensions. Get an exact shopping list. Free."

Shop Preview: category cards + featured products

Gallery: masonry grid (placeholder until real photos)

Trust Signals: Installation WC / Delivery national / Build plans free / ♻ Waste optimized

CTA Banner: Ember background
  "Ready? Design your deck in under 5 minutes."
  [Start Designing →]  [Book a Free Site Visit]

Footer
```

The entire page funnels toward one action: **open the designer.** The shop, calculator, and consultation are secondary paths for people not ready to design yet.
