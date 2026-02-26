# Build 18 — Configurator: Step 3 — Deck Designer Canvas

> **Type:** Frontend
> **Estimated Time:** 4–6 hrs ⚠️ Highest complexity build
> **Dependencies:** Build 17
> **Context Files:** DECK_DESIGNER_SPEC.md §2 (Drawing Canvas), PROJECT_BRIEF.md §3 (Step 3)

---

## Objective

Build the interactive deck designer canvas — the core differentiator of this project. Customers draw their deck shape, see live area calculations, and get exact dimensions. This build covers the drawing canvas only. Board layout, cutoff optimization, and joist placement are Build 19–20.

**Pilot scope:** Grid-snap mode with rectangles + L-shapes + T-shapes only. Freeform polygon mode is Phase 2.

---

## Tasks

### 1. Step 3 Entry Modes

Step 3 presents three paths:

```
┌─ Design your deck ─────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  📏 Quick   │  │  🎨 Designer│  │  📞 Complex │       │
│  │             │  │             │  │              │       │
│  │  Simple     │  │  Draw your  │  │  Book a free │       │
│  │  rectangle  │  │  exact      │  │  site visit  │       │
│  │  L × W      │  │  shape      │  │              │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Quick mode:** Two number inputs (length × width in metres). Instant area calculation. Uses Mode A pricing (m² rates). No designer. No build plan PDF.

**Designer mode:** Opens the interactive canvas (this build). Uses Mode B pricing (exact board counts) when board layout is calculated. Unlocks build plan PDF after purchase.

**Consultation mode:** "My deck is complex — I need help." Opens lead capture form → consultation_requests table. Returns to configurator summary.

### 2. Quick Mode

Simple inputs within the wizard step:

```
Length: [____] m    Width: [____] m

Area: 14.4 m²

[Next →]
```

- Validation: 0.5m–30m per dimension, area 1–200 m²
- Live area display as user types (debounced)
- Store as `dimensions: { length_m, width_m }` in wizard state
- No deck_design JSONB (null) — this is a quick quote

### 3. Designer Mode — Canvas Component

**`src/components/designer/deck-canvas.tsx`**

This is the big one. A React component wrapping an HTML5 Canvas (or SVG).

**Canvas setup:**
- Background: 100mm grid lines (faint, respects dark mode)
- Coordinate system: 1 unit = 1mm internally, displayed as metres to user
- Zoom: scroll wheel or pinch (min 0.1, max 5.0)
- Pan: middle-click drag or two-finger drag
- Viewport: auto-fit to shape on load, "Fit to Screen" button

**Grid snapping:**
- All points snap to 50mm grid
- Visual snap indicator (crosshair highlights nearest grid point)
- Hold Shift to disable snap (free placement)

### 4. Shape Drawing — Grid-Snap Mode

**Template selector (toolbar above canvas):**
- Rectangle (default)
- L-Shape
- T-Shape
- U-Shape (stretch goal)

**Rectangle template:**
1. Click "Rectangle" → click-drag on canvas to place
2. Dimension inputs appear next to shape: editable length × width (metres)
3. Drag corners or edges to resize (snaps to grid)
4. Shape renders as a filled semi-transparent polygon with dimension labels

**L-Shape template:**
1. Click "L-Shape" → places default L on canvas
2. Shows 4 dimension inputs (main arm length/width + extension length/width)
3. Drag corners to resize each arm
4. Minimum arm width: 300mm

**T-Shape template:**
1. Click "T-Shape" → places default T on canvas
2. Shows dimension inputs for the top bar and vertical stem

**Combining shapes:**
- Multiple rectangles can be placed and they merge into a compound shape
- Overlapping regions automatically union
- This allows any compound rectangular shape without needing specific templates

### 5. Shape Data Model

```typescript
// src/types/designer.ts
interface Point {
  x: number  // mm
  y: number  // mm
}

interface DeckShape {
  outline: Point[]         // clockwise outer boundary
  cutouts: Point[][]       // interior holes (empty for pilot)
  area_mm2: number         // calculated from polygon
  area_m2: number          // area_mm2 / 1_000_000
  perimeter_mm: number
  bounding_box: { min_x: number, min_y: number, max_x: number, max_y: number }
}

interface DeckDesign {
  shape: DeckShape
  material_slug: string
  board_width_mm: number
  board_thickness_mm: number
  board_gap_mm: number
  board_direction_deg: number    // 0 = lengthwise, 90 = widthwise, 45 = diagonal
  available_lengths_mm: number[]
  // Populated by Build 19:
  board_layout?: BoardPiece[]
  cut_plan?: CutPlan[]
  joist_layout?: JoistPiece[]
  bearer_layout?: BearerPiece[]
  post_positions?: Point[]
  waste_percent?: number
}
```

### 6. Live Calculations on Canvas

As the shape is drawn/resized:
- **Area** updates live (polygon area formula)
- **Perimeter** updates live
- **Dimension labels** on every edge (show metres with 1 decimal)
- **Bounding box** for reference

Display below canvas or in a side panel:
```
Area: 18.0 m²
Perimeter: 19.0m
Bounding box: 4.5m × 5.2m
```

### 7. Canvas Controls

Toolbar:
```
[Rectangle] [L-Shape] [T-Shape] | [Undo] [Redo] [Clear] | [Zoom +] [Zoom -] [Fit]
```

- Undo/redo: command stack for shape operations
- Clear: removes all shapes with confirmation
- Fit: auto-zooms to show entire shape

### 8. Dimension Input Panel

Side panel (desktop) or bottom sheet (mobile) showing editable dimensions:

For a rectangle:
```
Length: [4.500] m
Width:  [3.200] m
Area:   14.40 m²
```

For an L-shape:
```
Main arm:
  Length: [4.500] m
  Width:  [3.200] m
Extension:
  Length: [1.800] m
  Width:  [2.000] m
Total area: 18.00 m²
```

Typing in the inputs updates the canvas shape. Dragging on canvas updates the inputs.

### 9. Mobile Support

- Touch: tap-drag to draw rectangles, tap to place points
- Pinch to zoom, two-finger to pan
- Bottom sheet replaces side panel for dimension inputs
- Simplified toolbar (icons only, no text labels)
- Templates accessible via dropdown instead of toolbar row
- Canvas takes full viewport width

### 10. Consultation Fallback

"My deck is complex" path:
- Modal with: name, email, phone, address, property type, deck type interest (from Step 1), estimated area, preferred date, notes
- Submit → consultation_requests table
- Confirmation: "We'll be in touch within 24 hours to arrange a site visit."
- Returns to configurator with a "Consultation requested" state (can still continue with a quick quote if they want)

### 11. Step 3 Output

When user clicks "Next":
- **Quick mode:** store `dimensions` in wizard state, `deck_design` = null
- **Designer mode:** store `deck_design` with full shape data in wizard state. Board layout not yet calculated (that's Build 19).
- **Consultation:** store consultation flag, allow continuing with quick quote dimensions

---

## Acceptance Criteria

```
✅ Step 3 shows three entry mode options (Quick, Designer, Consultation)
✅ Quick mode: length × width inputs with live area calculation
✅ Quick mode: validation (0.5–30m per dimension, 1–200 m² area)
✅ Designer canvas renders with 100mm grid
✅ Rectangle template: draw, resize, dimension labels
✅ L-Shape template: draw with two arms, resize each arm
✅ T-Shape template: draw with bar and stem, resize
✅ Multiple rectangles can be placed and merged
✅ Grid snap at 50mm increments
✅ Zoom (scroll + buttons) and pan (middle-click/two-finger)
✅ Undo/redo works for shape operations
✅ Live area and perimeter calculation
✅ Dimension input panel: type values → canvas updates
✅ Canvas drag → dimension panel updates
✅ "Fit to Screen" zooms to show entire shape
✅ Mobile: touch draw, pinch zoom, bottom sheet for inputs
✅ Consultation modal submits to consultation_requests
✅ Shape data stored in DeckDesign format
✅ Dark mode: canvas grid and shapes render correctly
✅ Language toggle: all UI text switches EN/AF
```

---

## Risk Mitigation

This is the **highest-risk build** in the project. If the canvas is proving too complex:

**Fallback 1:** Ship with rectangle + dimension inputs only (skip canvas drawing entirely). Customer types L × W, sees a preview rectangle. Still useful.

**Fallback 2:** Ship rectangle canvas + L-shape template only (skip T/U/freeform). Covers 80% of real decks.

**Fallback 3:** Ship everything except mobile canvas. Desktop-only designer, mobile falls back to Quick mode.

Don't let perfect be the enemy of shipped.

---

## Notes for Claude Code

- Canvas rendering: consider using a library like Konva.js (react-konva) or Fabric.js for the interactive canvas. These handle zoom/pan/drag out of the box. Alternatively, raw Canvas2D with a custom event system works if you want zero dependencies.
- The polygon area calculation uses the Shoelace formula: `area = 0.5 × |Σ(x_i × y_{i+1} - x_{i+1} × y_i)|`
- Shape merging (union of overlapping rectangles): use a computational geometry approach or simplify by requiring non-overlapping rectangles that share edges.
- The DeckDesign object is stored in wizard state and eventually persisted to `configurator_items.deck_design` JSONB on order creation.
- This build does NOT calculate board layout — that's Build 19. The canvas here is purely geometric shape entry.
- Performance: don't re-render the entire canvas on every mouse move. Use layers: static grid layer + dynamic shape layer + UI overlay layer.
