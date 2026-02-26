# Build 20 — Configurator: Step 3 — Cutoff Optimization

> **Type:** Backend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 19
> **Context Files:** DECK_DESIGNER_SPEC.md §4 (Cutoff Optimization)

---

## Objective

Add offcut tracking and reuse to the board layout engine. When a 4.8m board is cut to 3.2m, the 1.6m offcut is tracked. If a later board needs 1.5m, the offcut is used instead of buying a new board. This saves 5–15% on material costs for most decks.

---

## Tasks

### 1. Offcut Tracking System

Create `src/lib/designer/cutoff-optimizer.ts`:

```typescript
interface Offcut {
  id: number
  source_board_id: number        // which board produced this offcut
  length_mm: number              // usable length
  consumed: boolean              // has it been assigned to another piece
  consumed_by_board_id?: number  // which board used it
}

interface CutoffOptimizerConfig {
  min_usable_offcut_mm: number   // from site_settings (default 300mm)
  prefer_offcuts: boolean         // true = always use offcut if available
  saw_kerf_mm: number            // blade width loss per cut (default 3mm)
}
```

### 2. Greedy Reuse Algorithm

Replace the naive stock selection from Build 19 with an optimized two-pass approach:

```
PASS 1: Calculate all cut lengths (same as Build 19)
  - For each board lane segment, record the exact cut_length_mm needed
  - Sort all pieces by cut_length DESCENDING (longest first)

PASS 2: Assign stock with offcut reuse
  For each piece (longest first):
    1. Check offcut pool for a usable offcut:
       - Must be >= cut_length_mm + saw_kerf_mm
       - If multiple offcuts qualify, pick the SMALLEST one (least waste)
    
    2. If usable offcut found:
       - Mark piece as source='offcut', offcut_source_id=source_board_id
       - Calculate remaining offcut: offcut.length_mm - cut_length_mm - saw_kerf_mm
       - If remaining >= min_usable_offcut_mm, add new offcut to pool
       - Otherwise, remaining is waste
       - Mark original offcut as consumed
    
    3. If no usable offcut:
       - Select stock length (shortest available >= cut_length_mm)
       - Calculate offcut: stock_length_mm - cut_length_mm
       - If offcut >= min_usable_offcut_mm, add to pool
       - Mark piece as source='new'
```

**Why longest-first?** Long pieces MUST come from new stock (few offcuts are 4m+). Short pieces are the ones that benefit from offcuts. Processing longest first generates the offcuts that shortest pieces then consume.

### 3. Stock Summary with Savings

After optimization, calculate:

```typescript
interface OptimizationResult {
  boards: BoardPiece[]                   // updated with source + offcut_source_id
  offcut_pool: Offcut[]                  // final pool (unconsumed = waste)
  
  // Metrics
  total_pieces: number                    // total board pieces in the deck
  pieces_from_new_stock: number
  pieces_from_offcuts: number
  
  new_stock_needed: StockSummary[]        // {length_mm, count} for purchasing
  
  waste_total_mm: number                  // sum of all unconsumed offcut lengths
  waste_percent: number                   // waste / total stock purchased
  
  savings_boards: number                  // boards saved by offcut reuse
  savings_estimate_cents: number          // approximate savings (boards saved × avg price)
  
  // Before/after comparison
  without_optimization: {
    boards_needed: number
    waste_percent: number
  }
}
```

### 4. Optimization Display on Canvas

Extend the board preview overlay from Build 19:

- **New stock boards:** standard colour (e.g., warm brown)
- **Offcut-sourced boards:** accent colour (e.g., green tint) with a small ♻ icon
- **Hover/click on an offcut board:** shows "From offcut of Board #12 (4.8m stock → 3.2m cut → 1.6m offcut → this 1.5m piece)"

### 5. Optimization Summary Panel

Below or beside the canvas, show the savings:

```
┌─ Material Optimization ─────────────────────┐
│                                               │
│  Total boards: 31 pieces                     │
│    New stock:  28 boards                     │
│    From offcuts: 3 boards  ♻                 │
│                                               │
│  Waste: 4.2% (vs 12.1% without optimization)│
│  Estimated savings: ~R 750                   │
│                                               │
│  Stock to purchase:                          │
│    4.8m × 16 boards                          │
│    3.6m × 12 boards                          │
│                                               │
└───────────────────────────────────────────────┘
```

### 6. Edge Cases

**No reuse possible:** Very short deck where every piece uses nearly a full stock board. Optimizer still runs but reports 0 offcuts reused. Waste is purely from rounding to stock lengths.

**Many small offcuts:** A deck with lots of 2.5m cuts from 3.0m stock generates many 500mm offcuts. These are only useful if some pieces need ≤500mm. The pool may accumulate offcuts that never get used.

**Diagonal/herringbone:** These patterns generate many different cut lengths (angle cuts), creating more opportunities for offcut reuse but also more complex calculations. The algorithm handles this naturally since it processes pieces by length regardless of lane angle.

**Offcut too short:** Below `min_usable_offcut_mm` (300mm default), offcuts are classified as waste, not tracked.

### 7. Integration with Pricing

The optimization result feeds into Mode B pricing:

```typescript
// Mode B exact pricing (replaces Mode A m² estimate)
function calculateExactPrice(
  optimization: OptimizationResult,
  joist_layout: JoistLayoutResult,
  bearer_layout: BearerLayoutResult,
  material_rates: ConfiguratorRates
): DeckQuote {
  // Boards: count each stock length × unit price
  const boards_cost = optimization.new_stock_needed.reduce(
    (sum, s) => sum + (s.count * getUnitPrice(s.length_mm, material)),
    0
  )
  
  // Joists: same pattern
  // Bearers: same pattern
  // Fixings: from bill of materials
  // Labour, extras, delivery, VAT: same as Mode A
}
```

Mode B pricing is more accurate than Mode A (m² rates) because it uses actual board counts. It can be cheaper (offcut savings) or more expensive (odd shapes = more waste).

---

## Acceptance Criteria

```
✅ Offcut tracking: boards generate offcuts when cut from stock
✅ Offcut reuse: short pieces use available offcuts before new stock
✅ Greedy algorithm processes longest-first
✅ Minimum offcut threshold (300mm) respected — shorter scraps = waste
✅ Saw kerf (3mm) deducted from offcut length per cut
✅ Test case: 4.5m × 3.2m rectangle, pine 22×108mm, lengthwise
   → Without optimization: ~34 boards, ~12% waste
   → With optimization: ~31 boards, ~4% waste, 3 from offcuts
✅ Canvas overlay colour-codes offcut-sourced boards
✅ Optimization summary panel shows savings and stock purchase list
✅ L-shape generates more short segments → higher offcut reuse rate
✅ Mode B pricing uses exact board counts instead of m² rates
✅ Performance: optimization runs < 200ms for 50m² deck
```

---

## Notes for Claude Code

- The greedy algorithm is O(n²) worst case (each piece checks all offcuts). For a typical deck (30–60 pieces), this is negligible. Don't over-optimize the optimizer.
- **Saw kerf:** every cut loses ~3mm to the saw blade. Deduct this from offcut length. A 1600mm offcut becomes 1597mm usable.
- The offcut pool is in-memory during calculation — not stored in the database. The final board layout (with source fields) is stored in `deck_design` JSONB.
- **Testing:** Create test fixtures for a rectangle, L-shape, and T-shape with known dimensions. Assert exact board counts, waste percentages, and offcut reuse counts.
- The savings_estimate_cents uses the average unit price of the shortest stock length as a rough proxy. It's a display number, not used in pricing.
