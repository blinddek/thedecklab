# THE DECK LAB — Calculator Reference & Formulas

> **Purpose:** Definitive reference for the "What Do I Need For My Deck" calculator
> **Sources:** Tiger Timbers SA span tables (SANS 10082:2007), Somerset Timbers, GG Timbers, Garapa.co.za, OnlineBuilding.co.za
> **NOTE:** All values are industry-standard defaults. Admin can override every constant via site_settings.

---

## 1. Deck Anatomy (Layer by Layer)

```
  TOP VIEW                              SIDE VIEW (cross-section)
  
  ═══════════════════════════            ─── Deck boards (surface)
  │   │   │   │   │   │   │             ═══════════════════════
  │   │   │   │   │   │   │                │       │       │
  │ B │ O │ A │ R │ D │ S │             ───┼───────┼───────┼─── Joists
  │   │   │   │   │   │   │                │       │       │
  ═══════════════════════════            ───┴───────┴───────┴─── Bearers
  ───────────────────────────               │               │
        JOISTS (underneath)                 │               │
  ───────────────────────────            ───┴───────────────┴─── Posts/Stumps
        BEARERS (underneath)                      or
  ───────────────────────────            concrete piers/blocks
        POSTS / SUPPORTS
```

**Build order (bottom up):**
1. **Posts/stumps** — support the bearers (not calculated — site-specific)
2. **Bearers** — heavy horizontal timbers running ONE direction, supported by posts
3. **Joists** — lighter timbers running PERPENDICULAR to bearers, sitting on top of bearers
4. **Deck boards** — the visible surface, running PERPENDICULAR to joists, screwed to joists
5. **Fixings** — screws, spacers, joist tape
6. **Finishing** — stain, oil, or sealer

**Key relationship:** Boards ⊥ Joists ⊥ Bearers

If boards run lengthwise (parallel to the long side), then:
- Joists run widthwise (perpendicular to boards)
- Bearers run lengthwise (perpendicular to joists)

---

## 2. SA Timber Dimensions & Standards

### 2.1 Deck Board Options

| Material | Thickness × Width | Common Lengths | Gap | Joist Spacing | Profile |
|----------|-------------------|----------------|-----|---------------|---------|
| **SA Pine (CCA)** | 22×108mm | 2.4m, 3.0m, 3.6m, 4.8m | 5mm | 450mm | Reeded or smooth |
| **SA Pine (CCA)** | 32×114mm | 2.4m, 3.0m, 3.6m, 4.8m | 5mm | 600mm | Reeded or smooth |
| **Balau** | 19×90mm | 2.1m, 2.7m, 3.0m, 3.3m, 3.6m | 4mm | 400mm | Reeded |
| **Garapa** | 19×90mm | 2.1m, 2.4m, 3.0m, 3.6m, 4.8m | 4mm | 400mm | Reeded or smooth |
| **Garapa** | 19×140mm | 2.1m, 2.4m, 3.0m, 3.6m, 3.9m | 5-6mm | 400mm | Reeded or smooth |
| **Composite** | 22×140mm | 2.2m, 2.9m, 3.6m (varies) | 5mm* | 400mm | Grooved (clip-fix) |

*Composite gaps set by manufacturer clip system

### 2.2 Joist Spacing Formula (SA Standard)

From Tiger Timbers / GG Timbers (per SANS 10082):

> **Joist spacing = 20 × board thickness**

| Board Thickness | Joist Spacing (max) |
|----------------|-------------------|
| 19mm | 380mm → use **400mm** centres |
| 22mm | 440mm → use **450mm** centres |
| 32mm | 640mm → use **600mm** centres |

This is the **golden rule** — the calculator uses this to auto-determine joist spacing from the selected board.

### 2.3 Substructure Timber (CCA Treated Pine)

Used for joists AND bearers regardless of deck board material (even under balau/garapa — hardwood substructure is rare and expensive in SA).

| Use | Common Dimensions | When To Use |
|-----|-------------------|-------------|
| **Joists** | 38×114mm | Bearer spacing up to 1.4m (domestic) |
| **Joists** | 38×152mm | Bearer spacing up to 2.45m (domestic) |
| **Joists** | 50×152mm | Bearer spacing up to 3.25m (heavier spans) |
| **Joists** | 38×228mm | Bearer spacing up to 4.85m (large spans) |
| **Bearers** | 50×152mm | Post spacing up to 1.0m |
| **Bearers** | 76×228mm | Post spacing up to 3.35m (standard domestic) |
| **Bearers** | 50×228mm | Post spacing up to 2.2m |

**Default for calculator (ground-level, domestic):**
- Joists: **38×114mm** (at 400mm centres, bearer spacing ≤1.4m)
- Bearers: **76×228mm** (at 2.4m centres, standard domestic)

**For raised decks (wider bearer spans):**
- Joists: **38×152mm** or **50×152mm**
- Bearers: **76×228mm** (supported every 2.0–2.4m)

### 2.4 Joist Span Table (SA Pine — Domestic Load)

From Tiger Timbers SANS 10082:2007:

| Joist Dimension | Max Span @ 400mm | Max Span @ 450mm | Max Span @ 600mm |
|-----------------|-------------------|-------------------|-------------------|
| 38×114mm | 2.6m | 2.5m | 2.2m |
| 38×152mm | 3.5m | 3.3m | 3.0m |
| 38×228mm | 5.3m | 5.0m | 4.5m |
| 50×152mm | 3.9m | 3.6m | 3.3m |
| 50×228mm | 5.8m | 5.4m | 4.9m |

**Calculator logic:** Based on deck width (= joist span), auto-select the smallest joist that works:
```
if joist_span ≤ 2.6m → 38×114mm
else if joist_span ≤ 3.5m → 38×152mm
else if joist_span ≤ 3.9m → 50×152mm
else if joist_span ≤ 5.3m → 38×228mm
else → "Deck too wide for single span — split with intermediate bearer"
```

### 2.5 Bearer Span Table (SA Pine — Domestic Load)

| Bearer Dimension | Max Span @ 600mm FLW | Max Span @ 760mm FLW |
|------------------|----------------------|----------------------|
| 38×114mm | 1.8m | 1.6m |
| 38×152mm | 2.4m | 2.2m |
| 50×152mm | 2.6m | 2.4m |
| 38×228mm | 3.6m | 3.3m |
| 50×228mm | 3.9m | 3.6m |
| 76×228mm | 4.5m | 4.2m |

**Default bearer for calculator:** 76×228mm at **2.4m** post spacing (covers most domestic decks).

---

## 3. Calculator Formulas

### 3.1 Inputs

```
length_m:        Deck length in metres (longer side)
width_m:         Deck width in metres (shorter side)
material:        'pine_22mm' | 'pine_32mm' | 'balau_19mm' | 'garapa_90mm' | 'garapa_140mm' | 'composite'
board_direction: 'lengthwise' | 'widthwise' | 'diagonal' | 'herringbone'
```

### 3.2 Derived Values

```
area_m2 = length_m × width_m

board_run_direction:
  if direction = 'lengthwise':  boards_run = length,  joists_run = width
  if direction = 'widthwise':   boards_run = width,   joists_run = length
  if direction = 'diagonal':    boards_run = length × √2 (effective), joists_run = width
  if direction = 'herringbone': boards_run = length (complex, simplified)

direction_waste_multiplier:
  lengthwise | widthwise = 1.00
  diagonal = 1.10
  herringbone = 1.15

general_waste_factor = 1.05  (5% standard waste for cuts/joins)
```

### 3.3 Deck Board Calculation

```
board_width_mm = selected material's board width (e.g., 90mm for balau)
board_gap_mm = gap for this board width (4mm for 90mm, 5mm for 108mm+)
board_thickness_mm = selected material's thickness

board_pitch_mm = board_width_mm + board_gap_mm
  (e.g., 90 + 4 = 94mm per board pitch)

// Boards run perpendicular to joists
// "run_length" = the distance boards need to span
run_length_mm = board_direction determines which dimension (length or width)

// "spread_length" = the distance across which boards are laid side by side
spread_length_mm = the other dimension

// Number of boards
boards_needed_raw = spread_length_mm / board_pitch_mm
boards_needed = ceil(boards_needed_raw)

// Check last board: does it need ripping?
last_board_width_mm = spread_length_mm - ((boards_needed - 1) × board_pitch_mm)
needs_ripping = last_board_width_mm < (board_width_mm × 0.5)

// If ripping would produce a sliver < 50% board width, flag it
ripping_warning = needs_ripping ? 
  "The last board would need cutting to ${last_board_width_mm}mm (${Math.round(last_board_width_mm/board_width_mm*100)}% of board width)" : null

// Apply waste multipliers
boards_with_waste = ceil(boards_needed × direction_waste_multiplier × general_waste_factor)

// Board length selection
available_lengths = [...material's available lengths in mm]
ideal_board_length_mm = min(available_lengths where length >= run_length_mm)
if no length >= run_length → need_joining = true, flag for user

// Smart width recommendation (if material has multiple widths)
// Run this for each available width for this material, score, return best
```

### 3.4 Joist Calculation

```
// Joists run perpendicular to deck boards
joist_spacing_mm = 20 × board_thickness_mm (rounded to nearest standard: 400/450/600)

// Joist span = the distance joists need to cross (perpendicular to their run direction)
// For lengthwise boards: joists run widthwise, span = depends on bearer placement
// For simplicity in calculator: joist span = deck dimension in joist direction

joist_run_length_mm = dimension in joist direction

// Number of joists
// First and last joist at the edges, then spaced in between
joist_count = floor(joist_run_length_mm / joist_spacing_mm) + 1

// Plus one joist for the starting edge
// Actually: spaces = joist_run_length / spacing, joists = spaces + 1
joist_spaces = floor(joist_run_length_mm / joist_spacing_mm)
joist_count = joist_spaces + 1

// Joist length = the dimension they span across (perpendicular to their run)
joist_span_mm = other deck dimension

// Auto-select joist size from span table
joist_dimension = lookup_joist_size(joist_span_mm, joist_spacing_mm)

// Joist timber length: select from available stock lengths
available_joist_lengths = [2400, 3000, 3600, 4800, 6000] // mm
joist_stock_length_mm = min(available where length >= joist_span_mm)

// Total joist timber needed
total_joist_metres = joist_count × (joist_stock_length_mm / 1000)
```

### 3.5 Bearer Calculation

```
// Bearers run perpendicular to joists
bearer_spacing_mm = 2400  // default 2.4m post spacing (admin-configurable)

// Bearer run length = dimension in bearer direction
bearer_run_length_mm = dimension in bearer direction (same as boards run direction)

// Number of bearers
bearer_spaces = floor(bearer_run_length_mm / bearer_spacing_mm)
bearer_count = bearer_spaces + 1
// Minimum 2 bearers (one each end)
bearer_count = max(bearer_count, 2)

// Bearer dimension: standard 76×228mm for domestic
// Or auto-select based on floor load width (advanced)
bearer_dimension = '76×228mm'

// Bearer length: same as joist run direction
bearer_length_mm = joist_run_length_mm
bearer_stock_length_mm = min(available where length >= bearer_length_mm)
```

### 3.6 Fixings Calculation

```
// Screws: 2 per board per joist crossing
screws_needed = boards_needed × joist_count × 2

// Round up to boxes
screw_box_size = 200  // or 100, 250, 500 — use nearest
screw_boxes = ceil(screws_needed / screw_box_size)

// Quick check against industry rule: ~40 screws per m² (from Tiger Timbers)
screws_check = area_m2 × 40
// These should roughly agree

// Screw length based on board thickness
screw_length_mm = board_thickness_mm <= 22 ? 50 : 70

// Spacers: 1 per board (for consistent gap)
spacer_count = boards_needed
spacer_pack_size = 50  // typical pack
spacer_packs = ceil(spacer_count / spacer_pack_size)

// Joist tape: protects joist top from moisture
// Length = number of joists × joist length
joist_tape_metres = joist_count × (joist_stock_length_mm / 1000)
joist_tape_roll_length = 20  // metres per roll (typical)
joist_tape_rolls = ceil(joist_tape_metres / joist_tape_roll_length)
```

### 3.7 Finishing Calculation

```
// Only for timber (not composite)
if material.is_composite → finishing = none

stain_coverage_m2_per_litre = 8  // single coat (admin-configurable)
recommended_coats = 2

total_coverage_needed_m2 = area_m2 × recommended_coats
litres_needed = total_coverage_needed_m2 / stain_coverage_m2_per_litre

// Round up to available tin sizes
available_tin_sizes = [1, 5, 20]  // litres
// Find cheapest combination
// Simple approach: use smallest tin that covers
tin_size = min(available_tin_sizes where size >= litres_needed)
// If none large enough: use largest + supplement
tins_needed = ceil(litres_needed / tin_size)
```

### 3.8 Material Comparison

Run the entire calculation 4 times (once per material type) and present side-by-side:

```
materials = ['pine_22mm', 'balau_19mm', 'garapa_90mm', 'composite']

comparison = materials.map(mat => ({
  name: mat.display_name,
  total_cents: calculateBill(length, width, direction, mat).grand_total_cents
}))
```

This lets the user instantly see the cost difference between pine and hardwood.

---

## 4. Example Calculation

**Input:** 4.5m × 3.2m deck, lengthwise, treated pine 22×108mm

### Deck Boards
```
Board pitch = 108 + 5 = 113mm
Boards run lengthwise (4.5m long)
Spread = 3200mm (width)
boards_needed = ceil(3200 / 113) = ceil(28.3) = 29 boards
Last board: 3200 - (28 × 113) = 3200 - 3164 = 36mm → 33% of 108mm → ripping warning!

Alternative check with 32mm boards:
  If 22×108 → 29 boards, last board 36mm (ripping needed)
  
Waste: 29 × 1.00 × 1.05 = 30.45 → 31 boards

Board length: need 4.5m → closest stock = 4.8m ✓
```

### Joists
```
Board thickness = 22mm → joist spacing = 20 × 22 = 440mm → use 450mm centres
Joists run widthwise (across 3.2m width)

Joist span = 3.2m
From span table: 38×152mm can span 3.3m @ 450mm ✓ (38×114mm only goes to 2.5m ✗)

Joist run direction = lengthwise (4500mm)
Joist spaces = floor(4500 / 450) = 10
Joist count = 10 + 1 = 11 joists

Joist stock length: need 3.2m → closest = 3.6m
Total: 11 × 3.6m = 39.6 linear metres of 38×152mm
```

### Bearers
```
Bearers run lengthwise (parallel to boards, perpendicular to joists)
Bearer spacing = 2400mm (standard post spacing)

Bearer run length = widthwise = 3200mm
Bearer spaces = floor(3200 / 2400) = 1
Bearer count = 1 + 1 = 2 bearers

Bearer dimension: 76×228mm (standard domestic)
Bearer length: need 4.5m → closest stock = 4.8m
Total: 2 × 4.8m = 9.6 linear metres of 76×228mm
```

### Fixings
```
Screws: 29 boards × 11 joists × 2 = 638 screws
→ 4 boxes of 200 (800 screws, 162 spare — normal)

Check: 14.4 m² × 40 = 576 screws (close enough — difference is rounding)

Screw length: 22mm board → 50mm screws

Spacers: 29 → 1 pack of 50

Joist tape: 11 joists × 3.6m = 39.6m → 2 rolls of 20m
```

### Finishing
```
Area: 14.4 m²
Coverage: 8 m²/L per coat × 2 coats = 16 m²/L for full treatment
Litres needed: 14.4 × 2 / 8 = 3.6L → 1× 5L tin
```

### Summary
```
DECK BOARDS:     31× 22×108mm × 4.8m treated pine
JOISTS:          11× 38×152mm × 3.6m CCA pine
BEARERS:          2× 76×228mm × 4.8m CCA pine
SCREWS:           4× boxes of 200 (50mm stainless)
SPACERS:          1× pack of 50
JOIST TAPE:       2× rolls of 20m
STAIN:            1× 5L tin

⚠ Last board will need ripping to 36mm — consider using a narrower board width
```

---

## 5. Smart Recommendations Engine

### 5.1 Board Width Recommendation

When a material offers multiple widths (e.g., Garapa 90mm vs 140mm), calculate both:

```
For spread_length = 3200mm:

  90mm boards (94mm pitch):  ceil(3200/94) = 35 boards
    Last board: 3200 - (34 × 94) = 3200 - 3196 = 4mm → basically nothing → -1 board
    Actually: 34 boards, last gap would be 4mm instead of standard 4mm
    → clean fit, no ripping ✓
    
  140mm boards (145mm pitch): ceil(3200/145) = 23 boards
    Last board: 3200 - (22 × 145) = 3200 - 3190 = 10mm → <50% → ripping!
    → bad fit ✗

RECOMMENDATION: "For your 3.2m width, 90mm boards give a cleaner finish 
with no ripping needed. 140mm boards would require the last board to be cut 
to just 10mm — we'd recommend 90mm."
```

### 5.2 Board Length Optimization

```
If deck length = 3.4m:
  Available: 2.1m, 2.4m, 3.0m, 3.6m, 4.8m
  
  Shortest that covers: 3.6m (0.2m waste per board = 5.6% waste)
  
  Alternative: 2× 2.1m with join (= 4.2m, cut to 3.4m)
  → more waste, needs join over joist, weaker
  
  RECOMMENDATION: "3.6m boards — only 200mm trim per board, no joins needed."
```

### 5.3 Joist Size Auto-Selection

```
The calculator shows the reasoning:

"Your joists need to span 3.2m at 450mm centres.
 38×114mm only spans 2.5m — too short ✗
 38×152mm spans up to 3.3m — fits ✓ (recommended)
 50×152mm spans up to 3.6m — also works but costs more"
```

### 5.4 "Did You Know" Tips

Contextual tips based on selections:

- Pine selected: "CCA treatment protects against rot and insects, but you'll need to stain/oil your deck within 4-6 weeks of installation to protect against UV."
- Balau selected: "Balau is one of the hardest decking timbers available in SA. It's naturally termite-resistant and can last 25+ years with minimal maintenance."
- Diagonal selected: "Diagonal board patterns create a stunning visual effect but use approximately 10% more material due to angle cuts."
- Large deck (>20m²): "For decks over 20m², we recommend professional installation. The substructure becomes more complex and needs to be engineered correctly."
- Pool deck: "Boards near pools should always be reeded (grooved) for grip. Use stainless steel fixings to prevent corrosion from pool chemicals."

---

## 6. What the Calculator Does NOT Do

The calculator is a **materials estimator**, not an engineering tool. It explicitly disclaims:

1. **No structural engineering** — it doesn't calculate load ratings, wind bracing, or post footings
2. **No site assessment** — it doesn't account for slopes, drainage, soil conditions
3. **No building regs** — decks >1.5m above ground need an engineer (per SANS 10163)
4. **Posts not calculated** — post depth, footing size, and post dimensions are site-specific
5. **No balustrade engineering** — railing height and strength have building code requirements

**Disclaimer text (shown on page):**
> "This calculator provides a materials estimate for planning and budgeting purposes. 
> Actual requirements may vary based on site conditions. For decks over 1m above ground, 
> raised decks, or complex layouts, we recommend a professional site assessment. 
> All structural work should comply with SANS 10163 and local building regulations."

---

## 7. Admin-Configurable Constants

Every number in the calculator can be overridden via `site_settings`:

| Setting Key | Default | Description |
|------------|---------|-------------|
| calc_joist_spacing_multiplier | 20 | Multiplied by board thickness for joist spacing |
| calc_bearer_spacing_mm | 2400 | Standard post/bearer spacing |
| calc_waste_factor | 1.05 | 5% general waste multiplier |
| calc_diagonal_multiplier | 1.10 | Extra material for diagonal |
| calc_herringbone_multiplier | 1.15 | Extra material for herringbone |
| calc_screws_per_crossing | 2 | Screws per board per joist |
| calc_screw_box_size | 200 | Screws per box |
| calc_spacers_per_board | 1 | Spacers per board |
| calc_spacer_pack_size | 50 | Spacers per pack |
| calc_joist_tape_roll_m | 20 | Metres per roll |
| calc_stain_coverage_m2_per_litre | 8 | Coverage per litre per coat |
| calc_recommended_coats | 2 | Number of recommended coats |
| calc_pine_gap_mm | 5 | Gap for softwood boards |
| calc_hardwood_gap_mm | 4 | Gap for hardwood boards |
| calc_composite_gap_mm | 5 | Gap for composite boards |

**The client can adjust these** if their construction practice differs — and the calculator updates instantly.
