# Build 33 — Deck Materials Calculator (Value-Add)

> **Type:** Full-stack
> **Estimated Time:** 3–4 hrs
> **Dependencies:** Build 09 (pricing engine), Build 19 (board layout formulas)
> **Context Files:** CALCULATOR_REFERENCE.md (full specification)

---

## Objective

Build a standalone `/calculator` page — a free tool that calculates exactly how many boards, joists, bearers, screws, and litres of stain you need for a deck of any size. This is a lead-generation and SEO tool: DIY builders find it via Google, get their material list, and then either buy from the shop or configure a full deck.

---

## Tasks

### 1. Calculator Page

**`src/app/(public)/calculator/page.tsx`**

```
┌─ Deck Materials Calculator ──────────────────────────────────────────┐
│                                                                       │
│  Free tool — calculate exactly what you need for your deck.          │
│                                                                       │
├─ Your Deck ──────────────────────────────────────────────────────────┤
│                                                                       │
│  Deck Shape:                                                         │
│  (●) Rectangle  ( ) L-Shape  ( ) Custom dimensions                   │
│                                                                       │
│  Length: [4.5] m    Width: [3.2] m    Area: 14.4 m²                 │
│                                                                       │
│  Material:  [SA Pine CCA Treated     ▼]                              │
│  Board:     [22 × 108mm              ▼]                              │
│  Direction: [Lengthwise              ▼]                              │
│  Gap:       5mm (auto from material)                                  │
│                                                                       │
│  [Calculate →]                                                        │
│                                                                       │
├─ Results ────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─ Deck Boards ─────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  SA Pine CCA 22×108mm                                         │  │
│  │                                                                │  │
│  │  Boards needed: 31                                            │  │
│  │  Recommended stock:                                           │  │
│  │    16 × 4800mm boards                                         │  │
│  │    12 × 3600mm boards                                         │  │
│  │                                                                │  │
│  │  Coverage: 14.4 m² (inc. 5% waste)                           │  │
│  │  Waste: ~4.2% (optimized)                                    │  │
│  │                                                                │  │
│  │  💡 Tip: Using 3.6m stock for the shorter cuts saves          │  │
│  │     300mm per board compared to cutting from 4.8m.            │  │
│  │                                                                │  │
│  │  [🛒 Add boards to cart — R4,228]                              │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Substructure ────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  Joists: 38×114mm @ 450mm centres                             │  │
│  │  Need: 11 joists                                              │  │
│  │  Recommended: 11 × 3600mm (= 11 joists)                      │  │
│  │                                                                │  │
│  │  Bearers: 76×228mm @ 2400mm centres                           │  │
│  │  Need: 2 bearers                                              │  │
│  │  Recommended: 2 × 4800mm                                     │  │
│  │                                                                │  │
│  │  [🛒 Add substructure to cart — R3,426]                        │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Fixings & Accessories ───────────────────────────────────────┐  │
│  │                                                                │  │
│  │  Screws: 682 needed → 4 boxes of 200 (800 total)             │  │
│  │  Spacers: 62 needed → 2 packs of 50 (100 total)              │  │
│  │  Joist tape: 15.4m → 1 roll of 20m                           │  │
│  │                                                                │  │
│  │  [🛒 Add fixings to cart — R485]                               │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Finishing ───────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  Stain needed: 9.6 litres (2 coats × 14.4m² ÷ 3m²/litre)   │  │
│  │  Recommended: 2 × 5L tins                                    │  │
│  │                                                                │  │
│  │  [🛒 Add stain to cart — R590]                                 │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Material Comparison ─────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  For this deck size (14.4 m²):                                │  │
│  │                                                                │  │
│  │  Material         │ Boards │ Est. Cost │ Maintenance │ Life   │  │
│  │  ─────────────────┼────────┼───────────┼─────────────┼──────  │  │
│  │  SA Pine CCA      │ 31     │ R 4,228   │ Medium      │ 10-15y │  │
│  │  Balau Hardwood   │ 38     │ R 9,120   │ Low         │ 25-40y │  │
│  │  Garapa Hardwood  │ 38     │ R 7,980   │ Low         │ 20-30y │  │
│  │  Composite        │ 25     │ R10,500   │ None        │ 25-30y │  │
│  │                                                                │  │
│  │  [Compare all materials in detail →]                           │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
├─ Summary ────────────────────────────────────────────────────────────┤
│                                                                       │
│  Total materials estimate: R8,729                                    │
│                                                                       │
│  [🛒 Add Everything to Cart — R8,729]                                │
│                                                                       │
│  [🔧 Want us to install it? Configure your full deck →]              │
│                                                                       │
│  [📧 Email this list to yourself]                                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 2. Calculator Input Section

**Inputs:**
- Shape: Rectangle (default) / L-Shape / Custom
  - Rectangle: length × width
  - L-Shape: main arm (L×W) + extension arm (L×W)
  - Custom: direct area input (m²) — used when shape is complex
- Material: select from active material_types
- Board dimension: select from board_dimensions for the chosen material
- Direction: select from board_directions
- Gap: auto-filled from material type (pine: 5mm, hardwood: 4mm, composite: 5mm) — editable

**Validation:**
- Dimensions: 0.5–30m per side, 1–200 m² area
- All selects required

### 3. Calculator Engine

Reuse formulas from the board layout engine (Build 19) + CALCULATOR_REFERENCE.md, simplified for rectangle/L-shape only:

```typescript
// src/lib/calculator/calculator.ts

interface CalculatorInput {
  shape: 'rectangle' | 'l_shape' | 'custom'
  dimensions: RectangleDimensions | LShapeDimensions | { area_m2: number }
  material_slug: string
  board_width_mm: number
  board_thickness_mm: number
  board_gap_mm: number
  direction: 'lengthwise' | 'widthwise' | 'diagonal' | 'herringbone'
}

interface CalculatorResult {
  area_m2: number
  
  boards: {
    count: number
    stock_lengths: StockSummary[]
    waste_percent: number
    tips: string[]
  }
  
  joists: {
    dimension: string
    spacing_mm: number
    count: number
    stock_lengths: StockSummary[]
  }
  
  bearers: {
    dimension: string
    spacing_mm: number
    count: number
    stock_lengths: StockSummary[]
  }
  
  fixings: {
    screws_needed: number
    screw_boxes: number
    spacer_packs: number
    joist_tape_rolls: number
  }
  
  finishing: {
    stain_litres: number
    stain_tins: { size_litres: number, count: number }
    coats: number
  }
  
  comparison: MaterialComparison[]
  
  total_estimate_cents: number
}
```

### 4. API Route

**`src/app/api/calculator/route.ts`**

```typescript
// POST /api/calculator/calculate
// Body: CalculatorInput
// Returns: CalculatorResult
// Public (no auth) — this is a free tool
```

### 5. Cart Integration (Three Funnels)

Each result section has an "Add to Cart" button that adds the recommended products:

**Funnel 1: Add to Cart**
- "Add boards to cart" → finds matching products by material + dimension + stock length, adds with calculated quantities
- "Add substructure to cart" → same for joists + bearers
- "Add fixings to cart" → screws + spacers + tape
- "Add stain to cart" → stain products
- "Add Everything to Cart" → all of the above

**Funnel 2: Configure Full Deck**
- "Want us to install it?" → `/configure` with pre-filled material + dimensions
- Transfers area_m2 and material_slug to configurator wizard state

**Funnel 3: Lead Capture**
- "Email this list to yourself" → email input → sends formatted material list
- Captures email for follow-up (optional newsletter opt-in)
- Creates a saved_quote with calculator_data

### 6. Material Comparison Table

Automatically calculates the same deck in all 4 materials:
- Board count (differs by board width)
- Estimated material cost
- Maintenance level
- Lifespan
- Highlight the selected material
- Click a row → recalculates with that material

### 7. Smart Tips

Context-aware recommendations shown in each section:

```typescript
const tips: string[] = []

// Board width optimization
if (lastBoardWidth < boardWidth * 0.5) {
  tips.push(`Using ${altWidth}mm boards avoids a thin last board (${lastBoardWidth}mm).`)
}

// Stock length efficiency
if (avgWastePerBoard > 500) {
  tips.push(`Consider ${altStockLength}mm stock to reduce waste.`)
}

// Direction impact
if (direction === 'diagonal') {
  tips.push(`Diagonal layout uses ~10% more material but adds visual interest.`)
}

// Joist spacing
tips.push(`Joist spacing: ${spacing}mm centres (based on ${thickness}mm board thickness, SANS 10082).`)
```

### 8. SEO & Localization

This page is a primary SEO landing page:
- Title: "Deck Materials Calculator | How Many Boards Do I Need?" (EN) / "Dekmateriaal-sakrekenaar | Hoeveel Planke Het Ek Nodig?" (AF)
- Meta description targeting "deck calculator south africa", "how many deck boards", "decking materials calculator"
- Structured data: FAQ schema with common questions
- Content below calculator: FAQ section with answers about spacing, board sizes, SA standards

```json
"calculator": {
  "title": "Deck Materials Calculator",
  "subtitle": "Free tool — calculate exactly what you need for your deck",
  "deckShape": "Deck Shape",
  "rectangle": "Rectangle",
  "lShape": "L-Shape",
  "custom": "Custom dimensions",
  "length": "Length",
  "width": "Width",
  "area": "Area",
  "material": "Material",
  "boardDimension": "Board Dimension",
  "direction": "Board Direction",
  "gap": "Board Gap",
  "calculate": "Calculate",
  "results": "Results",
  "deckBoards": "Deck Boards",
  "boardsNeeded": "Boards needed",
  "recommendedStock": "Recommended stock",
  "coverage": "Coverage",
  "waste": "Waste",
  "substructure": "Substructure",
  "joists": "Joists",
  "bearers": "Bearers",
  "fixings": "Fixings & Accessories",
  "screws": "Screws",
  "spacers": "Spacers",
  "joistTape": "Joist tape",
  "finishing": "Finishing",
  "stainNeeded": "Stain needed",
  "recommended": "Recommended",
  "comparison": "Material Comparison",
  "forThisDeckSize": "For this deck size",
  "estCost": "Est. Cost",
  "addToCart": "Add to Cart",
  "addEverything": "Add Everything to Cart",
  "configureFullDeck": "Want us to install it? Configure your full deck",
  "emailList": "Email this list to yourself",
  "totalEstimate": "Total materials estimate",
  "tip": "Tip"
}
```

---

## Acceptance Criteria

```
✅ Calculator page renders with input form
✅ Rectangle input: length × width → area
✅ L-shape input: two arms → total area
✅ Custom input: direct m² entry
✅ Material select shows all active materials
✅ Board dimension select filtered by material
✅ Direction select with multiplier badges
✅ Calculate produces correct board counts
✅ Test case: 4.5m × 3.2m, pine 22×108mm, lengthwise → 31 boards
✅ Joist count and spacing correct (SANS 10082 standard)
✅ Bearer count correct at 2400mm spacing
✅ Screw count = boards × joist crossings × 2
✅ Stain litres = area × coats ÷ coverage
✅ Material comparison shows all 4 materials
✅ "Add to Cart" buttons create correct cart items with quantities
✅ "Configure full deck" links to configurator with pre-filled state
✅ "Email list" captures email and sends formatted list
✅ Smart tips display relevant recommendations
✅ SEO: meta tags, structured data, FAQ section
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: inputs stack, results stack, fully usable
```

---

## Notes for Claude Code

- The calculator reuses the FORMULAS from Build 19's board layout engine but NOT the full polygon-based algorithm. It's simplified for rectangle/L-shape math only — no polygon intersection needed.
- The "Add to Cart" feature needs to map calculator results to actual shop products. This means: find the product matching the material + board dimension, find the variant matching the stock length, calculate quantity. If a product/variant doesn't exist in the shop, show the quantity but grey out the cart button.
- The material comparison is a big differentiator — customers see exactly how much each option costs for their specific deck. This drives informed decisions and upsells to premium materials.
- FAQ content should target long-tail SEO: "how far apart should deck joists be", "how many screws per deck board", "what size joists for decking south africa".
