# THE DECK LAB — Deck Designer & Build Plan Specification

> **Purpose:** Interactive deck shape designer with smart board layout, cutoff optimization, and professional build plan PDF generation
> **Companion to:** CALCULATOR_REFERENCE.md (construction formulas), TECHNICAL_DESIGN.md (database schema)

---

## 1. Overview

The Deck Designer is an interactive canvas tool where customers draw their actual deck shape, select materials, and receive:

1. **Live bill of materials** — exact board counts, joists, bearers, fixings (same as calculator)
2. **Visual board layout** — every board placed, numbered, with cut lengths shown
3. **Cutoff optimization** — offcuts from long boards reused in shorter sections
4. **Build Plan PDF** — a professional installation document with everything a builder needs

Two entry modes:
- **Grid-snap mode** — drag rectangles and combine shapes (L, T, U, irregular). For 90% of decks.
- **Freeform mode** — click to place polygon corners for complex shapes (angles, curves approximated as segments).

---

## 2. Drawing Canvas

### 2.1 Technology

HTML5 Canvas or SVG-based (React component). The canvas represents a top-down view of the deck area.

**Grid system:**
- Background grid: 100mm squares (faint lines)
- Snap-to-grid: all points snap to 50mm increments (hold Shift to override)
- Scale: auto-fit to viewport, zoom in/out with scroll wheel or pinch
- Ruler: dimension markers along edges showing metres

### 2.2 Grid-Snap Mode (Default)

**How it works:**
1. Click "Add Rectangle" → click-drag on canvas to draw a rectangle
2. Dimension inputs appear: type exact length × width in metres
3. Add more rectangles that connect (they snap to edges of existing shapes)
4. Overlapping areas merge automatically
5. Result: a compound polygon representing the deck outline

**Pre-built templates:**
- Rectangle (most common)
- L-Shape (click to set both arms)
- T-Shape
- U-Shape
- Wrap-around (3-sided)
- Custom (start with empty canvas)

Each template creates the shape with adjustable dimensions — drag corners/edges to resize.

### 2.3 Freeform Mode

**How it works:**
1. Click to place corner points on the canvas
2. Each point creates an edge to the previous point
3. Close the shape by clicking the first point (or double-click)
4. Dimensions shown on each edge
5. Drag points to adjust after placement
6. Add interior cutouts (e.g., around a tree or post) by drawing a hole polygon inside

### 2.4 Shape Validation

- Minimum area: 1 m²
- Maximum area: 200 m² (beyond this, recommend professional design)
- No self-intersecting edges
- All edges must form a closed polygon
- Interior cutouts must be fully inside the outer boundary
- Minimum edge length: 300mm

### 2.5 Canvas Controls

```
┌──────────────────────────────────────────────────────────┐
│  [Rectangle] [L-Shape] [T-Shape] [Freeform] │ [Undo] [Redo] [Clear]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│    ┌───────────────────────────┐                         │
│    │                           │ ← 4.5m →               │
│    │                           │                         │
│    │                           │ ↕ 3.2m                  │
│    │       YOUR DECK           │                         │
│    │                           │                         │
│    │                           │                         │
│    └───────────────┬───────────┘                         │
│                    │           │                         │
│                    │   1.8m    │ ↕ 2.0m                  │
│                    │           │                         │
│                    └───────────┘                         │
│                      ← 1.8m →                           │
│                                                          │
│  Area: 18.0 m²  │  Perimeter: 19.0m                     │
│  [Zoom +] [Zoom -] [Fit to Screen]                      │
└──────────────────────────────────────────────────────────┘
```

### 2.6 Mobile Support

- Touch: drag to draw rectangles, tap to place freeform points
- Pinch to zoom
- Two-finger drag to pan
- Bottom sheet for dimension inputs (instead of inline)
- Simplified toolbar

---

## 3. Board Layout Engine

Once the deck shape is defined and material selected, the engine calculates the optimal board placement.

### 3.1 Board Placement Algorithm

```
Input:
  - deck_polygon: array of {x, y} points (mm)
  - board_width_mm: e.g., 90
  - board_gap_mm: e.g., 4
  - board_direction: angle in degrees (0° = lengthwise, 90° = widthwise, 45° = diagonal)
  - available_lengths_mm: [2100, 2400, 3000, 3600, 4800]

Process:
  1. Calculate the board pitch: board_width_mm + board_gap_mm
  
  2. Create parallel "board lanes" across the polygon:
     - Starting from one edge, create lines spaced at board_pitch intervals
     - Each line represents the centre of a board
     - Clip each line to the polygon boundary
     
  3. For each board lane:
     a. Intersect the lane line with the polygon → get one or more segments
        (L-shaped decks will produce two segments on some lanes)
     b. Each segment = one board piece needed
     c. Record: lane_number, start_x, end_x, length_mm
     
  4. Result: array of BoardPiece objects:
     {
       lane: number,           // which row (1, 2, 3...)
       segment: number,        // which piece in this row (usually 1, but 2+ for L-shapes)
       start_mm: number,       // start position along the lane
       end_mm: number,         // end position
       cut_length_mm: number,  // actual length needed
     }
```

### 3.2 Board Numbering

Every board piece gets a unique ID:

```
Board 1:  Lane 1, full length 4500mm
Board 2:  Lane 2, full length 4500mm
...
Board 29: Lane 29, full length 4500mm
Board 30: Lane 1 (L-section), length 1800mm  ← uses an offcut!
Board 31: Lane 2 (L-section), length 1800mm
...
```

### 3.3 Stock Length Selection & Cutting

For each board piece, determine which stock length to use:

```
For a 4500mm piece:
  Available stock: 2100, 2400, 3000, 3600, 4800
  → Use 4800mm stock, cut to 4500mm
  → Offcut: 300mm (too short to reuse → waste)

For a 1800mm piece:
  Available stock: 2100, 2400, 3000, 3600, 4800
  → Check offcut inventory first!
  → If we have a 1600mm offcut from another board → too short
  → If we have a 2400mm offcut → cut to 1800mm, new offcut 600mm
  → Otherwise use 2100mm stock, offcut 300mm
```

### 3.4 Cutoff Optimization Engine

This is where the real value is. The engine tracks offcuts and reuses them.

```typescript
interface CutPlan {
  board_id: number
  lane: number
  segment: number
  cut_length_mm: number
  stock_length_mm: number     // the stock board this comes from
  source: 'new_stock' | 'offcut'
  offcut_from_board_id?: number  // if source = offcut, which board it came from
  remaining_offcut_mm: number    // what's left after this cut
}

function optimizeCuts(pieces: BoardPiece[], stockLengths: number[]): CutPlan[] {
  // Sort pieces by length (longest first — greedy approach)
  const sorted = [...pieces].sort((a, b) => b.cut_length_mm - a.cut_length_mm)
  
  const offcutPool: { length_mm: number, from_board_id: number }[] = []
  const plan: CutPlan[] = []
  const MIN_USABLE_OFFCUT = 300  // mm — below this, it's waste
  
  for (const piece of sorted) {
    // Step 1: Can any existing offcut satisfy this piece?
    const usableOffcut = offcutPool
      .filter(o => o.length_mm >= piece.cut_length_mm)
      .sort((a, b) => a.length_mm - b.length_mm)  // smallest sufficient offcut
      [0]
    
    if (usableOffcut) {
      // Use the offcut
      const remaining = usableOffcut.length_mm - piece.cut_length_mm
      plan.push({
        board_id: piece.id,
        lane: piece.lane,
        segment: piece.segment,
        cut_length_mm: piece.cut_length_mm,
        stock_length_mm: usableOffcut.length_mm,
        source: 'offcut',
        offcut_from_board_id: usableOffcut.from_board_id,
        remaining_offcut_mm: remaining,
      })
      
      // Remove used offcut from pool
      offcutPool.splice(offcutPool.indexOf(usableOffcut), 1)
      
      // If the remaining piece is still usable, add it back
      if (remaining >= MIN_USABLE_OFFCUT) {
        offcutPool.push({ length_mm: remaining, from_board_id: piece.id })
      }
    } else {
      // Step 2: Use new stock — pick shortest sufficient length
      const stockLength = stockLengths
        .filter(l => l >= piece.cut_length_mm)
        .sort((a, b) => a - b)[0]
      
      const remaining = stockLength - piece.cut_length_mm
      plan.push({
        board_id: piece.id,
        lane: piece.lane,
        segment: piece.segment,
        cut_length_mm: piece.cut_length_mm,
        stock_length_mm: stockLength,
        source: 'new_stock',
        remaining_offcut_mm: remaining,
      })
      
      // Add offcut to pool if usable
      if (remaining >= MIN_USABLE_OFFCUT) {
        offcutPool.push({ length_mm: remaining, from_board_id: piece.id })
      }
    }
  }
  
  return plan
}
```

**Output example for an L-shaped deck:**

```
CUT LIST — Treated Pine 22×108mm

Main section (4.5m × 3.2m):
  Board 1-29:  Cut 4500mm from 4.8m stock → offcut 300mm each (waste)

L-section (1.8m × 2.0m):
  Board 30:  Cut 1800mm from 2.1m stock → offcut 300mm (waste)
  Board 31:  Cut 1800mm from 2.1m stock → offcut 300mm (waste)
  ...
  Board 47:  Cut 1800mm from 2.1m stock → offcut 300mm (waste)

Stock required:
  29× 4.8m boards (main section)
  18× 2.1m boards (L-section)
  = 47 boards total

Waste: 29×300mm + 18×300mm = 14.1m total offcut (all <300mm, unusable)
Waste %: 6.2%
```

**For a more complex shape where offcuts ARE reusable:**

```
Irregular deck: 5.0m wide main, 2.5m wing

  Board 1-20:  Cut 5000mm from 5.4m stock → offcut 400mm each ← REUSABLE!
  Board 21-35:  Cut 2500mm from offcuts... WAIT
  
  Actually: 400mm offcuts are too short for 2500mm wing boards.
  But if the wing was 2.0m:
  
  Board 1-20:  Cut 5000mm from 5.4m stock → offcut 400mm each
  Board 21-30:  Cut 2000mm from 2.4m stock → offcut 400mm each
  
  Hmm. Let's say the wing is 3.0m and main is 4.8m:
  Board 1-20:  Cut 4800mm from 4.8m stock → offcut 0mm (perfect fit!)
  Board 21-30:  Cut 3000mm from 3.6m stock → offcut 600mm each
  
  Now if there's a small 600mm bump-out:
  Board 31-33:  Cut 600mm from offcuts of boards 21-30 → offcut 0mm
  = 3 boards FREE from offcuts!
```

**The cutoff optimizer is what makes this tool professional-grade.** A homeowner would buy 47+18 = 65 separate boards. The optimizer might get that down to 60 by reusing offcuts in smaller sections.

### 3.5 Board Joining (Long Runs)

When a board lane is longer than any available stock length:

```
Board lane = 6200mm (longer than max 4800mm stock)

Options:
  A) 4800mm + 1400mm (join over a joist)
     → uses 4.8m stock (0mm waste) + cuts 1400mm from 2.1m stock (700mm offcut)
     
  B) 3600mm + 2600mm (join over a joist)  
     → uses 3.6m stock (0mm waste) + cuts 2600mm from 3.0m stock (400mm offcut)

Engine picks the option with least waste and marks the join position.
Join MUST occur over a joist (both board ends need support).
```

The build plan shows join locations with a symbol and notes "join over joist #X".

---

## 4. Joist & Bearer Layout

### 4.1 Joist Placement

Once the deck shape is defined:

```
1. Determine joist direction (perpendicular to boards)
2. Place first joist at the edge of the polygon
3. Space subsequent joists at calculated intervals (e.g., 450mm centres)
4. Last joist at the opposite edge
5. For each joist: clip to the polygon boundary (joist may be shorter in L/T sections)
6. Where board joins occur: ensure a joist falls at that position
   → if not, add an extra joist at the join point
```

**Joist length per position:**
Each joist may be a different length if the deck shape isn't rectangular. The build plan shows each joist's actual cut length.

### 4.2 Bearer Placement

```
1. Bearers run perpendicular to joists
2. First bearer at one edge, last at opposite edge
3. Space at configured interval (default 2.4m)
4. For each bearer: clip to polygon boundary
5. Post positions: at bearer intersections with the polygon perimeter and at regular intervals along each bearer
```

### 4.3 Post Positions

Posts are placed where bearers need support:
- At each end of every bearer
- At intervals along long bearers (max post spacing from span table)
- Shown on the build plan as circles/squares

---

## 5. Build Plan PDF

### 5.1 Gating

| Order Type | Build Plan Access |
|-----------|------------------|
| Supply order (paid) | ✅ Free download after purchase |
| Installation order (paid) | ✅ Included — sent to customer AND Nortier |
| No order (browsing) | ❌ "Purchase materials to unlock your build plan" |

The build plan is the incentive to buy through The Deck Lab rather than just using the calculator and buying elsewhere.

### 5.2 PDF Contents

**Page 1: Cover**
```
┌──────────────────────────────────────────┐
│                                          │
│          [The Deck Lab Logo]             │
│                                          │
│          DECK BUILD PLAN                 │
│                                          │
│  Prepared for: [Customer Name]           │
│  Order: DL-2026-0042                     │
│  Date: 19 February 2026                  │
│                                          │
│  Deck Area: 18.0 m²                      │
│  Material: Treated Pine (CCA) 22×108mm   │
│  Board Direction: Lengthwise             │
│                                          │
│  ⚠ This plan is for guidance only.       │
│  All structural work should comply       │
│  with SANS 10163 and local building      │
│  regulations.                            │
│                                          │
└──────────────────────────────────────────┘
```

**Page 2: Deck Layout — Top View (Board Layer)**

A scaled top-down drawing showing:
- Every deck board as a numbered rectangle
- Board direction arrows
- Board dimensions (length marked on each board)
- Gaps between boards (exaggerated slightly for visibility)
- Join locations marked with ⊥ symbol
- Offcut-sourced boards highlighted in a different shade
- Dimension lines around the perimeter
- North arrow (optional)
- Scale bar: "1:50" or similar

```
┌────────────────────────────────────────────────────┐
│                    ← 4500mm →                      │
│  ╔══════════════════════════════════════╗  ↕       │
│  ║ 1  │ 4500mm                         ║  108mm   │
│  ╠══════════════════════════════════════╣          │
│  ║ 2  │ 4500mm                         ║          │
│  ╠══════════════════════════════════════╣          │
│  ║ 3  │ 4500mm                         ║          │
│  ╠══════════════════════════════════════╣  3200mm  │
│  ║ ...                                 ║          │
│  ╠══════════════════════════════════════╣          │
│  ║ 29 │ 4500mm                         ║          │
│  ╚══════════════╦═══════════════════════╝          │
│                 ║ 30 │ 1800mm  [offcut] ║          │
│                 ╠═══════════════════════╣  2000mm  │
│                 ║ 31 │ 1800mm           ║          │
│                 ╠═══════════════════════╣          │
│                 ║ ...                   ║          │
│                 ╚═══════════════════════╝          │
│                   ← 1800mm →                       │
│                                                    │
│  Scale: 1:50   │   Board: 22×108mm CCA Pine        │
└────────────────────────────────────────────────────┘
```

**Page 3: Substructure Layout (Joist & Bearer Layer)**

Same deck outline but showing:
- Joists as numbered lines with spacing dimensions
- Bearers as thicker lines with spacing dimensions
- Post positions as filled circles with coordinates
- Board join locations marked (joists that support joins are highlighted)
- Dimension chains between joists and between bearers

```
┌────────────────────────────────────────────────────┐
│                    ← 4500mm →                      │
│                                                    │
│  J1 ────────────────────────────────── (3200mm)    │
│  │    450mm                                        │
│  J2 ────────────────────────────────── (3200mm)    │
│  │    450mm                                        │
│  J3 ────────────────────────────────── (3200mm)    │
│  │    450mm                                        │
│  ...                                               │
│  J11 ───────────────────────────────── (3200mm)    │
│                                                    │
│  B1 ═══════════════════════════════ (4500mm)       │
│        2400mm                                      │
│  B2 ═══════════════════════════════ (4500mm)       │
│                                                    │
│  ● Post 1 (0, 0)         ● Post 3 (0, 2400)       │
│  ● Post 2 (3200, 0)      ● Post 4 (3200, 2400)    │
│                                                    │
│  ── Joist: 38×152mm CCA Pine                       │
│  ══ Bearer: 76×228mm CCA Pine                      │
│  ● Post position (76×76mm or 100×100mm)            │
└────────────────────────────────────────────────────┘
```

**Page 4: Cut List**

Table format showing every cut needed:

```
DECK BOARDS — 22×108mm Treated Pine (CCA)

Stock  │ Cut    │ Board │ Source      │ Offcut  │ Offcut
Length │ Length │ #     │            │ Length  │ Used By
───────┼────────┼───────┼────────────┼─────────┼────────
4.8m   │ 4500mm │ 1     │ New stock  │ 300mm   │ Waste
4.8m   │ 4500mm │ 2     │ New stock  │ 300mm   │ Waste
...    │        │       │            │         │
4.8m   │ 4500mm │ 29    │ New stock  │ 300mm   │ Waste
2.1m   │ 1800mm │ 30    │ New stock  │ 300mm   │ Waste
2.1m   │ 1800mm │ 31    │ New stock  │ 300mm   │ Waste
...    │        │       │            │         │

JOISTS — 38×152mm Treated Pine (CCA)

Stock  │ Cut    │ Joist │ Notes
Length │ Length │ #     │
───────┼────────┼───────┼──────────────────
3.6m   │ 3200mm │ J1    │ 
3.6m   │ 3200mm │ J2    │ 
...    │        │       │
3.6m   │ 3200mm │ J11   │ Board join support

BEARERS — 76×228mm Treated Pine (CCA)

Stock  │ Cut    │ Bearer│ Notes
Length │ Length │ #     │
───────┼────────┼───────┼──────────────────
4.8m   │ 4500mm │ B1    │
4.8m   │ 4500mm │ B2    │

STOCK SUMMARY:
  29× 4.8m 22×108mm pine boards
  18× 2.1m 22×108mm pine boards
  11× 3.6m 38×152mm pine joists
   2× 4.8m 76×228mm pine bearers
   4× boxes of 200 stainless screws (50mm)
   1× pack of 50 spacers
   2× rolls joist tape (20m)
   1× 5L deck stain

  Reused offcuts: 0 boards
  Total waste: 14.1 linear metres (6.2%)
```

**Page 5: Screw Pattern**

Diagram showing:
- 2 screws per board at each joist crossing
- Screw positions: ~20mm from each board edge
- Pre-drill recommendation for hardwood
- Screw type and length

```
  Board edge
  │←20mm→│
  │  ×   │   × = screw position
  │      │
  │  ×   │
  │←20mm→│
  Board edge
  
  ↕ Repeat at every joist crossing
  
  Screws: 50mm stainless steel (for 22mm boards)
  Pre-drill: Not required for pine, REQUIRED for balau/garapa
```

**Page 6: Materials Shopping List**

Clean summary with The Deck Lab product links/SKUs:

```
YOUR SHOPPING LIST

  Qty │ Item                           │ SKU        │ Unit Price │ Total
  ────┼────────────────────────────────┼────────────┼────────────┼────────
  29  │ Pine Deck Board 22×108 × 4.8m │ DL-PB-4800 │ R 89.00    │ R 2,581
  18  │ Pine Deck Board 22×108 × 2.1m │ DL-PB-2100 │ R 42.00    │ R   756
  11  │ Pine Joist 38×152 × 3.6m      │ DL-PJ-3600 │ R 125.00   │ R 1,375
   2  │ Pine Bearer 76×228 × 4.8m     │ DL-PBR-480 │ R 389.00   │ R   778
   4  │ SS Screws Box 200 (50mm)       │ DL-FX-S200 │ R 189.00   │ R   756
   1  │ Spacer Pack 50                 │ DL-FX-SP50 │ R  85.00   │ R    85
   2  │ Joist Tape Roll 20m            │ DL-FX-JT20│ R  99.00   │ R   198
   1  │ Deck Stain 5L — Walnut         │ DL-FN-S5W  │ R 549.00   │ R   549
  ────┼────────────────────────────────┼────────────┼────────────┼────────
      │                        TOTAL   │            │            │ R 7,078
      
  [All items are in your cart at thedecklab.co.za]
```

**Page 7: Installation Notes (if applicable)**

For Nortier's installation team:

```
INSTALLATION NOTES — ORDER DL-2026-0042

Customer: John Smith
Address: 15 Main Road, Paarl
Phone: 082 123 4567
Scheduled: TBC

Deck Type: Ground-Level
Material: Treated Pine (CCA)
Area: 18.0 m²
Shape: L-shaped (see Page 2)

BUILDER NOTES:
- Board direction: Lengthwise (parallel to 4.5m side)
- Joist spacing: 450mm centres
- Bearer spacing: 2400mm centres
- Board joins required: None in main section, none in L-section
- Last board (lane 29): Rip to 36mm — consider trimming adjacent gap
- All fixings: 2× stainless screws per board per joist crossing
- Pre-drill: Not required for pine
- Stain: Apply 2 coats walnut stain after installation, allow 4-6 weeks weathering first

STRUCTURAL DISCLAIMER:
This plan covers materials layout only. Post footings, ground preparation,
drainage, and structural engineering are the installer's responsibility
per SANS 10163.
```

### 5.3 PDF Generation

Server-side generation using `@react-pdf/renderer` or `jspdf`:
- Vector graphics for the deck layouts (crisp at any print size)
- A4 landscape for layout pages, portrait for cut list and shopping list
- The Deck Lab branding (logo, colours, fonts)
- Printable at actual scale if possible (A3 for larger decks with scale marker)

**API Route:**
```
GET /api/build-plan/[order_id]/pdf
  → Auth: order must be paid (or installation order)
  → Returns: PDF binary
  
POST /api/build-plan/preview
  → Body: { deck_shape, material, direction, extras }
  → Returns: preview image (PNG) of the board layout
  → No auth required (used in the designer preview)
```

---

## 6. Nortier Installation Workflow

When a customer selects "Professional Installation":

1. **Order placed** → admin notification email includes "Build Plan attached"
2. **Build Plan PDF auto-generated** with full installation notes
3. **Admin order detail** shows "Download Build Plan" button
4. **Nortier prints the plan** → gives to the installation team
5. **On-site:** installer follows the numbered board layout, cut list, joist positions
6. **The plan IS the work order** — no separate document needed

For supply-only orders:
1. **Order placed** → customer gets email with "Your Build Plan is ready"
2. **Email includes download link** → `/order/[id]?download=build-plan`
3. **Customer prints the plan** → follows it for DIY installation
4. **The plan is their instruction manual**

---

## 7. Canvas State & Persistence

### 7.1 State Shape

```typescript
interface DeckDesign {
  // Shape
  outline: Point[]              // polygon vertices in mm
  cutouts: Point[][]            // interior cutout polygons
  
  // Configuration
  material_type_id: string
  board_width_mm: number
  board_thickness_mm: number
  board_gap_mm: number
  board_direction_deg: number   // 0, 90, 45, etc.
  board_profile: string
  finish_option: string
  
  // Computed (updated live)
  area_m2: number
  perimeter_mm: number
  board_layout: BoardPiece[]
  cut_plan: CutPlan[]
  joist_layout: JoistPiece[]
  bearer_layout: BearerPiece[]
  post_positions: Point[]
  bill_of_materials: BillOfMaterials
}
```

### 7.2 Persistence

- **localStorage:** save design state so customer can return later
- **Saved quote:** full DeckDesign object stored as JSONB in saved_quotes.quote_data
- **Order:** full DeckDesign object stored on the order for build plan generation

### 7.3 Live Preview

As the customer draws/adjusts:
- Board layout recomputes in real-time (debounced 300ms)
- Bill of materials updates live
- Price updates live
- Canvas shows board preview overlay on the shape

---

## 8. Complexity Tiers

Not every user needs the full designer. The entry point adapts:

| Deck Shape | Entry Mode | Complexity |
|-----------|-----------|-----------|
| Simple rectangle | Quick inputs (L × W) | Calculator only — no canvas needed |
| L-shape | Template → adjust dimensions | Canvas with grid-snap |
| T / U / wrap | Template → adjust | Canvas with grid-snap |
| Irregular / angled | Freeform drawing | Full canvas |
| Very complex (>6 sides) | "Book a consultation" prompt | Lead capture |

The calculator (L × W only) remains as a standalone tool at `/calculator`. The full designer lives at `/designer` and includes the calculator as its simplest mode.

---

## 9. Integration with Configurator

The designer replaces Step 3 (Dimensions) in the configurator flow:

```
Step 1: Deck Type → Step 2: Material → Step 3: DESIGNER (shape + dimensions)
→ Step 4: Board Direction → Step 5: Finish → Step 6: Extras → Step 7: Install → Step 8: Quote
```

For simple rectangular decks, Step 3 can still be the quick L × W input with a "Use the Deck Designer for complex shapes" link.

For any non-rectangular shape, the designer is required.

The designer output feeds directly into the pricing engine — area_m2, board count, joist count, bearer count, fixings — all calculated from the actual shape, not just L × W.
