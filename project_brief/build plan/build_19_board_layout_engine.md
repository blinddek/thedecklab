# Build 19 — Configurator: Step 3 — Board Layout Engine

> **Type:** Backend
> **Estimated Time:** 3–4 hrs
> **Dependencies:** Build 18
> **Context Files:** DECK_DESIGNER_SPEC.md §3 (Board Layout Engine), CALCULATOR_REFERENCE.md (SA standards)

---

## Objective

Build the board layout engine that takes a deck shape polygon and produces: an exact board placement plan, joist layout, bearer positions, and a complete bill of materials. This is the brain that converts a drawn shape into "you need 31 boards, 11 joists, 2 bearers, 4 boxes of screws."

---

## Tasks

### 1. Board Placement Algorithm

Create `src/lib/designer/board-layout.ts`:

```typescript
interface BoardLayoutInput {
  outline: Point[]                    // deck polygon (mm)
  cutouts: Point[][]                  // interior holes
  board_width_mm: number              // e.g., 108
  board_thickness_mm: number          // e.g., 22
  board_gap_mm: number                // e.g., 5
  board_direction_deg: number         // 0 = lengthwise, 90 = widthwise, 45 = diagonal
  available_lengths_mm: number[]      // [2400, 3000, 3600, 4800]
}

interface BoardPiece {
  id: number                          // sequential: 1, 2, 3...
  lane: number                        // which row
  segment: number                     // 1 for single, 1-N for L-shape splits
  start_mm: number                    // start position along lane
  end_mm: number                      // end position
  cut_length_mm: number               // actual length to cut
  stock_length_mm: number             // selected stock length
  offcut_mm: number                   // waste from this board
  source: 'new' | 'offcut'           // new stock or reused offcut
  offcut_source_id?: number           // if source='offcut', which board's offcut
  join_position_mm?: number           // if board is joined over a joist
}

interface BoardLayoutResult {
  boards: BoardPiece[]
  total_boards_new: number            // new stock boards needed
  total_boards_from_offcuts: number   // boards sourced from offcuts
  stock_summary: StockSummary[]       // {length_mm, count} for purchasing
  waste_percent: number
}
```

**Algorithm (from DECK_DESIGNER_SPEC.md):**

```
1. Calculate board_pitch = board_width_mm + board_gap_mm

2. Determine spread direction perpendicular to board direction:
   - If boards run 0° (lengthwise), lanes spread along width axis
   - If boards run 90° (widthwise), lanes spread along length axis
   - If boards run 45°, rotate coordinate system

3. Calculate total lanes needed:
   lanes_needed = ceil(spread_distance_mm / board_pitch)

4. For each lane (i = 0 to lanes_needed - 1):
   a. Create a line at position: start_offset + (i × board_pitch) + (board_width_mm / 2)
   b. Orient line in the board direction
   c. Extend line beyond bounding box
   d. Intersect line with polygon boundary → one or more segments
      - Simple rectangle: 1 segment per lane
      - L-shape: some lanes produce 2 segments
      - Complex shapes: possibly 3+ segments
   e. Subtract any cutout polygons from segments
   
5. For each segment:
   a. cut_length_mm = segment end - segment start
   b. Select stock_length_mm = shortest available length >= cut_length_mm
   c. If no stock length is long enough: split into two pieces joined over a joist
   d. offcut_mm = stock_length_mm - cut_length_mm
   e. Assign sequential board ID

6. Number all pieces: board #1, #2, #3... across all lanes
```

### 2. Stock Length Selection

Create `src/lib/designer/stock-selector.ts`:

```typescript
function selectStockLength(cut_length_mm: number, available_lengths_mm: number[]): number {
  // Sort ascending
  const sorted = [...available_lengths_mm].sort((a, b) => a - b)
  
  // Find shortest stock that covers the cut length
  for (const stock of sorted) {
    if (stock >= cut_length_mm) return stock
  }
  
  // No single stock is long enough — need a join
  // Return the longest available (will be handled by join logic)
  return sorted[sorted.length - 1]
}
```

### 3. Board Joining (Long Spans)

When a lane segment exceeds the longest available stock length:

```
1. Find joist positions near the midpoint of the segment
2. Split the segment at the nearest joist (boards must join over a joist)
3. Each half becomes a separate BoardPiece with join_position_mm marked
4. Add an extra joist at the join position if one doesn't exist
```

### 4. Joist Layout Engine

Create `src/lib/designer/joist-layout.ts`:

```typescript
interface JoistPiece {
  id: number
  position_mm: number               // distance from reference edge
  start_mm: number                  // start along joist run (clipped to polygon)
  end_mm: number                    // end along joist run
  cut_length_mm: number
  stock_length_mm: number
  dimension: string                 // e.g., "38×114" or "38×152"
  is_join_support: boolean          // true if added for a board join
}

interface JoistLayoutResult {
  joists: JoistPiece[]
  joist_dimension: string           // auto-selected from span table
  spacing_mm: number                // calculated from board thickness
  stock_summary: StockSummary[]
}
```

**Algorithm:**

```
1. Calculate joist spacing:
   spacing_mm = board_thickness_mm × 20  (SA standard: SANS 10082)
   e.g., 22mm boards → 440mm centres (round to 450mm)
   e.g., 19mm boards → 380mm centres (round to 400mm)

2. Joists run PERPENDICULAR to boards:
   - If boards run 0° (lengthwise), joists run 90° (widthwise)

3. Place joists at regular intervals from one edge:
   joist_count = floor(board_run_length_mm / spacing_mm) + 1

4. For each joist position:
   a. Create a line perpendicular to boards
   b. Clip to polygon boundary
   c. For L-shapes: joist may split into two segments (different lengths)
   d. Record start, end, cut_length

5. Auto-select joist dimension from span table:
   - Joist span = distance between bearers
   - Lookup from SA span tables (CALCULATOR_REFERENCE.md):
     38×114mm: max 2.6m @ 400mm centres
     38×152mm: max 3.5m @ 400mm centres
     50×152mm: max 3.9m @ 400mm centres

6. Add extra joists at board join positions (if any)
```

### 5. Bearer Layout Engine

Create `src/lib/designer/bearer-layout.ts`:

```typescript
interface BearerPiece {
  id: number
  position_mm: number
  start_mm: number
  end_mm: number
  cut_length_mm: number
  stock_length_mm: number
  dimension: string                 // "76×228"
}
```

**Algorithm:**

```
1. Bearer spacing: from site_settings calc_bearer_spacing_mm (default 2400mm)
2. Bearers run PERPENDICULAR to joists (parallel to boards)
3. Place bearers at regular intervals
4. Clip each bearer to polygon boundary
5. Bearer dimension: 76×228mm standard domestic (from span tables)
6. Post positions: at each bearer end + every 2400mm along bearer
```

### 6. Bill of Materials Calculator

Create `src/lib/designer/bill-of-materials.ts`:

Takes the board layout, joist layout, and bearer layout results and produces:

```typescript
interface BillOfMaterials {
  // Deck boards
  boards: StockSummary[]             // [{length_mm: 4800, count: 28}, ...]
  boards_total: number
  boards_from_offcuts: number
  
  // Substructure
  joists: StockSummary[]             // [{length_mm: 3600, dimension: "38×152", count: 11}]
  bearers: StockSummary[]
  
  // Fixings
  screws_needed: number              // boards × joists_crossed × 2
  screw_boxes: number                // ceil(screws / box_size)
  spacer_packs: number
  joist_tape_rolls: number           // ceil(total_joist_length_m / roll_length_m)
  
  // Finishing
  stain_litres: number               // (area_m2 × coats) / coverage_m2_per_litre
  
  // Waste
  waste_percent: number
  offcut_boards_reused: number
  offcut_savings_estimate_cents: number  // boards saved × avg unit price
}
```

### 7. API Route

Create `src/app/api/designer/calculate/route.ts`:

```typescript
// POST /api/designer/calculate
// Body: {
//   outline: Point[],
//   cutouts: Point[][],
//   material_slug: string,
//   board_width_mm: number,
//   board_direction_deg: number,
//   board_profile?: string
// }
// Returns: {
//   board_layout: BoardLayoutResult,
//   joist_layout: JoistLayoutResult,
//   bearer_layout: BearerLayoutResult,
//   bill_of_materials: BillOfMaterials,
//   post_positions: Point[]
// }
```

This is the heavy computation endpoint. It should:
1. Look up material → board dimensions + available stock lengths
2. Look up board gap for material type (from site_settings)
3. Run board layout → joist layout → bearer layout → bill of materials
4. Return everything needed for the canvas overlay and pricing

### 8. Canvas Board Preview

Back in the designer canvas (Build 18), after calculation:

- Overlay board positions on the canvas as coloured strips
- Each board shows its number and cut length
- Joists shown as perpendicular lines (darker colour)
- Bearers shown as thick lines
- Board gaps visible at zoom
- Offcut-sourced boards highlighted in a different colour
- Board join positions marked with a ⊕ symbol

This turns the "shape only" canvas into a visual board plan preview.

### 9. Smart Recommendations

From CALCULATOR_REFERENCE.md:

**Board width optimization:** Calculate which board width avoids having to rip the last board to less than 50% width. If the selected width leaves a sliver, suggest the alternative width.

**Stock length recommendation:** For each lane, show which stock length minimizes waste. If 4.5m boards are being cut from 4.8m stock (300mm waste each), and 3.6m stock exists, note the waste.

---

## Acceptance Criteria

```
✅ Board layout correctly calculates pieces for a simple rectangle
✅ Test case: 4.5m × 3.2m, pine 22×108mm, lengthwise
   → ~31 boards in 4.8m stock, 300mm offcuts
✅ Board layout handles L-shapes (some lanes split into 2 segments)
✅ Stock length selection picks shortest stock that covers cut length
✅ Board joining works when lane exceeds max stock length
✅ Joist spacing calculated correctly from board thickness (22mm → 450mm)
✅ Joist dimension auto-selected from span tables
✅ Joists clipped to polygon boundary (different lengths for L-shapes)
✅ Extra joists placed at board join positions
✅ Bearer layout at 2400mm spacing
✅ Bill of materials: correct screw count (boards × joist crossings × 2)
✅ Bill of materials: correct spacer and joist tape quantities
✅ Waste percentage calculated correctly
✅ Canvas overlay shows boards numbered with cut lengths
✅ API response time < 500ms for typical deck (< 50m²)
✅ Smart recommendations: board width and stock length suggestions
```

---

## Notes for Claude Code

- **Polygon-line intersection** is the core geometric operation. Use the Sutherland-Hodgman algorithm or a simpler ray-casting approach for clipping lines to polygon boundaries.
- **All calculations in millimetres** internally. Convert to metres only for display.
- The board layout for a simple rectangle is trivial — it's a loop of parallel cuts. L-shapes are the real test because some board lanes cross two separate polygon sections.
- **Joist span tables** are hardcoded from CALCULATOR_REFERENCE.md. They're admin-configurable via site_settings or a future admin page if needed.
- The canvas overlay (board preview) can be a separate rendering layer on top of the shape canvas from Build 18.
- **Performance:** For a 50m² deck with 22×108mm boards, you're calculating ~500 board lanes × polygon intersection. This should be fast (<100ms) even in JavaScript. If it's slow, pre-compute the bounding segments.
- The cutoff optimization (offcut reuse) is Build 20 — this build calculates straight stock selection only.
