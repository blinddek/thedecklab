# Build 31 — Build Plan PDF (7-Page)

> **Type:** Backend
> **Estimated Time:** 3–4 hrs
> **Dependencies:** Build 19–20 (board layout + cutoff optimizer)
> **Context Files:** DECK_DESIGNER_SPEC.md §6 (Build Plan PDF)

---

## Objective

Generate a professional 7-page PDF build plan document from the deck designer data. This is the premium deliverable: a complete installation guide with board layout, substructure plan, cut list, screw pattern, shopping list, and installation notes. Gated: free for paid orders, not available for browsing-only users.

---

## Tasks

### 1. PDF Generation API

**`src/app/api/build-plan/route.ts`**

```typescript
// POST /api/build-plan
// Auth: order owner OR admin
// Body: { order_id } or { deck_design: DeckDesign } (admin preview)
// Returns: PDF binary (application/pdf)
// Gating: only if order.build_plan_generated = true OR admin preview
```

Uses jsPDF + jspdf-autotable (installed in Build 01).

### 2. Page 1 — Cover Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    [THE DECK LAB LOGO]                            │
│                                                                   │
│                                                                   │
│                    DECK BUILD PLAN                                │
│                                                                   │
│                    ─────────────────                              │
│                                                                   │
│                    Prepared for: Jan Botha                        │
│                    Order: DL-2026-0001                            │
│                    Date: 20 February 2026                        │
│                                                                   │
│                    Deck Type: Raised Deck                        │
│                    Material: SA Pine CCA Treated                 │
│                    Area: 14.4 m² (4.5m × 3.2m)                  │
│                    Direction: Lengthwise                         │
│                    Finish: Walnut Stain                          │
│                                                                   │
│                    Extras:                                        │
│                    • 4 Steps (1.2m wide)                         │
│                    • Railings (6.4m Stainless + Wood)            │
│                                                                   │
│                                                                   │
│                    This plan contains 31 boards,                 │
│                    11 joists, 2 bearers.                         │
│                    ♻ 3 boards from optimized offcuts             │
│                                                                   │
│                    Page 1 of 7                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Page 2 — Board Layout Plan

Top-down view of the deck with every board drawn to scale:

```
┌─────────────────────────────────────────────────────────────────┐
│  BOARD LAYOUT PLAN                                Page 2 of 7   │
│                                                                   │
│  Scale: 1:20 (or auto-fit)                                      │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ┌──#1──4500mm───────────────────────────────────┐      │    │
│  │  ├──#2──4500mm───────────────────────────────────┤      │    │
│  │  ├──#3──4500mm───────────────────────────────────┤      │    │
│  │  ├──#4──4500mm───────────────────────────────────┤      │    │
│  │  ├──...─────────────────────────────────────────┤      │    │
│  │  ├──#28─4500mm───────────────────────────────────┤      │    │
│  │  ├──#29─3200mm──────────────────┤ ← L-extension  │      │    │
│  │  ├──#30─3200mm──────────────────┤                 │      │    │
│  │  └──#31─3200mm──────────────────┘                 │      │    │
│  │                         ┌──────────────────────┘  │      │    │
│  │                         │     Extension arm       │      │    │
│  │                         └─────────────────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ■ New stock board   ■ Offcut-sourced board (♻)                  │
│  Board gap: 5mm between boards                                   │
│                                                                   │
│  Each board is numbered and labelled with its cut length.        │
│  Boards marked ♻ are cut from offcuts of other boards.           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Rendering:**
- Scale the polygon to fit the page (landscape A4, auto-calculate scale factor)
- Draw each board as a filled rectangle with 1pt gap between
- Label each board with: number + cut length in mm
- Colour-code: standard boards vs offcut-sourced boards
- Dimension labels on outer edges
- North arrow / orientation marker

### 4. Page 3 — Substructure Plan

Joist and bearer layout shown beneath the boards:

```
┌─────────────────────────────────────────────────────────────────┐
│  SUBSTRUCTURE PLAN                                Page 3 of 7   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                           │    │
│  │  ═══ Joist 1 (3200mm) ═════════════════════════════════  │    │
│  │        │               │               │                  │    │
│  │  ═══ Joist 2 (3200mm) ═════════════════════════════════  │    │
│  │        │               │               │                  │    │
│  │  ═══ Joist 3 (3200mm) ═════════════════════════════════  │    │
│  │        │               │               │                  │    │
│  │  ...                                                      │    │
│  │        │               │               │                  │    │
│  │  ═══ Joist 11 (4500mm) ═══════════════════════════════   │    │
│  │        │               │               │                  │    │
│  │    Bearer 1         Bearer 2        Bearer 3              │    │
│  │    (4500mm)         (4500mm)                              │    │
│  │                                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Joists: 38×114mm @ 450mm centres (11 required)                 │
│  Bearers: 76×228mm @ 2400mm centres (2 required)                │
│  Posts: at bearer ends + 2400mm intervals                        │
│                                                                   │
│  ○ Post positions (4 total)                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Page 4 — Cut List

Detailed cut list for every piece of timber:

```
┌─────────────────────────────────────────────────────────────────┐
│  CUT LIST                                         Page 4 of 7   │
│                                                                   │
│  DECK BOARDS — SA Pine CCA 22×108mm                             │
│  ┌──────┬──────────┬────────────┬───────────┬──────────────────┐│
│  │ Board│ Cut      │ Stock      │ Offcut    │ Source           ││
│  │ #    │ Length   │ Length     │           │                  ││
│  ├──────┼──────────┼────────────┼───────────┼──────────────────┤│
│  │ 1    │ 4500mm   │ 4800mm    │ 300mm     │ New stock        ││
│  │ 2    │ 4500mm   │ 4800mm    │ 300mm     │ New stock        ││
│  │ ...  │ ...      │ ...       │ ...       │ ...              ││
│  │ 29   │ 1500mm   │ —         │ —         │ ♻ Offcut of #1  ││
│  │ 30   │ 1200mm   │ —         │ —         │ ♻ Offcut of #5  ││
│  │ 31   │  900mm   │ —         │ —         │ ♻ Offcut of #9  ││
│  └──────┴──────────┴────────────┴───────────┴──────────────────┘│
│                                                                   │
│  JOISTS — SA Pine CCA 38×114mm                                  │
│  ┌──────┬──────────┬────────────┐                                │
│  │ Joist│ Cut      │ Stock      │                                │
│  ├──────┼──────────┼────────────┤                                │
│  │ J1   │ 3200mm   │ 3600mm    │                                │
│  │ J2   │ 3200mm   │ 3600mm    │                                │
│  │ ...  │ ...      │ ...       │                                │
│  └──────┴──────────┴────────────┘                                │
│                                                                   │
│  BEARERS — SA Pine CCA 76×228mm                                 │
│  ┌──────┬──────────┬────────────┐                                │
│  │ #    │ Cut      │ Stock      │                                │
│  ├──────┼──────────┼────────────┤                                │
│  │ B1   │ 4500mm   │ 4800mm    │                                │
│  │ B2   │ 4500mm   │ 4800mm    │                                │
│  └──────┴──────────┴────────────┘                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Page 5 — Screw Pattern

Board-to-joist screw positions:

```
┌─────────────────────────────────────────────────────────────────┐
│  SCREW PATTERN                                    Page 5 of 7   │
│                                                                   │
│  Each board is screwed to every joist it crosses with 2 screws  │
│  (one per side of board, 25mm from edge).                        │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Board:  ═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══ │    │
│  │  Joists:    │   │   │   │   │   │   │   │   │   │     │    │
│  │  Screws:   ×× ×× ×× ×× ×× ×× ×× ×× ×× ×× ××        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Total screws: 682                                               │
│  Screw type: 50mm Stainless Steel (316 marine grade)            │
│  Screw boxes needed: 4 × 200 = 800 (118 spare)                 │
│                                                                   │
│  Pre-drill pilot holes for hardwood. Not required for pine.     │
│                                                                   │
│  Spacer count: 62                                                │
│  Spacer packs needed: 2 × 50 = 100 (38 spare)                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Page 6 — Shopping List

Complete purchase list with quantities:

```
┌─────────────────────────────────────────────────────────────────┐
│  SHOPPING LIST                                    Page 6 of 7   │
│                                                                   │
│  DECK BOARDS                                                     │
│  ┌────────────────────────────────┬─────┬────────┬─────────────┐│
│  │ Product                       │ Qty │ Unit   │ Total       ││
│  ├────────────────────────────────┼─────┼────────┼─────────────┤│
│  │ Pine 22×108mm × 4800mm        │ 16  │ R169   │ R 2,704     ││
│  │ Pine 22×108mm × 3600mm        │ 12  │ R127   │ R 1,524     ││
│  ├────────────────────────────────┼─────┼────────┼─────────────┤│
│  │ Subtotal                      │ 28  │        │ R 4,228     ││
│  └────────────────────────────────┴─────┴────────┴─────────────┘│
│                                                                   │
│  SUBSTRUCTURE                                                    │
│  ┌────────────────────────────────┬─────┬────────┬─────────────┐│
│  │ Pine 38×114mm × 3600mm (joist)│ 11  │ R206   │ R 2,266     ││
│  │ Pine 76×228mm × 4800mm (bear.)│  2  │ R580   │ R 1,160     ││
│  ├────────────────────────────────┼─────┼────────┼─────────────┤│
│  │ Subtotal                      │ 13  │        │ R 3,426     ││
│  └────────────────────────────────┴─────┴────────┴─────────────┘│
│                                                                   │
│  FIXINGS & ACCESSORIES                                           │
│  ┌────────────────────────────────┬─────┬────────┬─────────────┐│
│  │ 50mm SS Screws (box of 200)   │  4  │ R 85   │ R   340     ││
│  │ Board Spacers (pack of 50)    │  2  │ R 45   │ R    90     ││
│  │ Joist Tape 20m roll           │  1  │ R 55   │ R    55     ││
│  ├────────────────────────────────┼─────┼────────┼─────────────┤│
│  │ Subtotal                      │     │        │ R   485     ││
│  └────────────────────────────────┴─────┴────────┴─────────────┘│
│                                                                   │
│  FINISHING                                                       │
│  ┌────────────────────────────────┬─────┬────────┬─────────────┐│
│  │ Walnut Stain 5L               │  2  │ R295   │ R   590     ││
│  ├────────────────────────────────┼─────┼────────┼─────────────┤│
│  │ Subtotal                      │     │        │ R   590     ││
│  └────────────────────────────────┴─────┴────────┴─────────────┘│
│                                                                   │
│  ════════════════════════════════════════════════════════════    │
│  TOTAL MATERIALS:                              R 8,729          │
│                                                                   │
│  ♻ Offcut optimization saved 3 boards (~R 750)                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8. Page 7 — Installation Notes

```
┌─────────────────────────────────────────────────────────────────┐
│  INSTALLATION NOTES                               Page 7 of 7   │
│                                                                   │
│  SITE PREPARATION                                                │
│  1. Level the ground within 25mm tolerance                       │
│  2. Install weed barrier membrane                                │
│  3. Ensure adequate drainage away from structure                 │
│                                                                   │
│  SUBSTRUCTURE                                                    │
│  1. Place bearers at 2400mm centres on concrete pads             │
│  2. Ensure bearers are level (use shims if needed)               │
│  3. Install joists at 450mm centres perpendicular to bearers     │
│  4. Secure joists with joist hangers or skew-nailed              │
│  5. Apply joist tape to top of all joists before decking         │
│                                                                   │
│  DECKING                                                         │
│  1. Start board #1 from the reference edge                       │
│  2. Use spacers for consistent 5mm gaps                          │
│  3. Pre-drill for hardwood (not required for pine)               │
│  4. Two screws per joist crossing, 25mm from board edge          │
│  5. Follow board numbering from cut list                         │
│  6. ♻ boards are offcuts — verify lengths before cutting         │
│                                                                   │
│  FINISHING                                                       │
│  1. Allow deck to dry for 48 hours after installation            │
│  2. Clean surface before staining                                │
│  3. Apply 2 coats of Walnut stain per manufacturer directions    │
│  4. Allow 24 hours between coats                                 │
│                                                                   │
│  MATERIAL-SPECIFIC NOTES (SA Pine CCA)                           │
│  - Expect some movement in the first 6 months (shrinkage)        │
│  - Re-tighten screws after first season                          │
│  - Recoat every 2-3 years for optimal protection                 │
│  - CCA treatment protects against rot and insects                │
│                                                                   │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Generated by The Deck Lab — thedecklab.co.za                    │
│  Order: DL-2026-0001 | Date: 20 February 2026                   │
│  This plan is specific to your deck configuration.               │
│  For questions: info@thedecklab.co.za | 021 XXX XXXX            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 9. PDF Gating

Access rules:
- **Paid order with designer data:** Full 7-page PDF available. Download button on order confirmation + admin order detail.
- **Paid order without designer data (quick mode):** No build plan available (no board layout data). Shopping list only (Page 6) if requested.
- **Admin preview:** Admin can generate preview PDF for any configurator_item with deck_design data, even before payment.
- **Not paid / browsing:** Cannot access. Build plan is a VALUE-ADD that encourages checkout.

### 10. PDF Rendering

Use jsPDF for page layout + jspdf-autotable for tables:

```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function generateBuildPlan(order: Order, config: ConfiguratorItem): Uint8Array {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Page 1: Cover
  renderCoverPage(doc, order, config)
  
  // Page 2: Board layout (canvas-to-image)
  doc.addPage()
  renderBoardLayout(doc, config.deck_design)
  
  // Page 3: Substructure
  doc.addPage()
  renderSubstructurePlan(doc, config.deck_design)
  
  // ... etc

  return doc.output('arraybuffer')
}
```

For the visual pages (board layout, substructure), render the layout to an off-screen canvas, export as PNG, and embed in the PDF.

---

## Acceptance Criteria

```
✅ PDF generates with all 7 pages
✅ Cover page shows order details and configuration summary
✅ Board layout page shows all boards to scale with numbers and cut lengths
✅ Offcut-sourced boards colour-coded differently
✅ Substructure page shows joists and bearers with dimensions
✅ Cut list table includes all pieces with stock lengths and offcut sources
✅ Screw pattern page shows total screws, boxes needed, spacers
✅ Shopping list totals all materials with quantities and prices
✅ Installation notes are material-specific
✅ PDF gating: only available for paid orders with designer data
✅ Admin can preview build plan before payment
✅ PDF renders correctly across PDF viewers
✅ File size reasonable (<5MB for typical plan)
✅ Generated PDF stored/cached (not regenerated on every download)
```

---

## Notes for Claude Code

- The board layout rendering is the trickiest part. Approach: render to an HTML Canvas element (off-screen), export as a high-DPI PNG (2× for print quality), embed in PDF with `doc.addImage()`.
- The shopping list should link to The Deck Lab's product pages — but since it's a PDF, just show product names and SKUs. No clickable links.
- Installation notes should vary by material type. Pine gets CCA/shrinkage notes. Composite gets "no staining" notes. Hardwood gets oil maintenance notes.
- Cache the generated PDF: store the URL in the order record (`build_plan_url`) after first generation. Regenerate only if the order's configurator_item changes.
- The build plan is a MASSIVE value-add. It turns "we sell materials" into "we provide a complete building guide." This is what justifies the installation markup.
