# Build 21 — Configurator: Steps 4–6 (Direction, Finish, Extras)

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 17 (wizard shell), Build 09 (pricing engine)
> **Context Files:** PROJECT_BRIEF.md §3 (Steps 4–6), Build 04 schema

---

## Objective

Build the three mid-wizard steps: board direction & profile selection, colour/finish picker, and extras configurator. These steps all update the live quote in real-time as selections change.

---

## Tasks

### 1. Step 4: Board Direction & Profile

**Question:**
- EN: "How should the boards run?"
- AF: "Hoe moet die planke lê?"

**Board direction — visual cards:**

```
+-------------------+  +-------------------+  +-------------------+  +-------------------+
|  ═══════════════  |  |  ║║║║║║║║║║║║║║║  |  |  ╲╲╲╲╲╲╲╲╲╲╲╲╲  |  |  ╱╲╱╲╱╲╱╲╱╲╱╲  |
|  ═══════════════  |  |  ║║║║║║║║║║║║║║║  |  |  ╲╲╲╲╲╲╲╲╲╲╲╲╲  |  |  ╲╱╲╱╲╱╲╱╲╱╲╱  |
|  ═══════════════  |  |  ║║║║║║║║║║║║║║║  |  |  ╲╲╲╲╲╲╲╲╲╲╲╲╲  |  |  ╱╲╱╲╱╲╱╲╱╲╱╲  |
|                   |  |                   |  |                   |  |                   |
|  Lengthwise       |  |  Widthwise        |  |  Diagonal (45°)   |  |  Herringbone      |
|  Standard layout  |  |  Cross-grain      |  |  +10% material    |  |  +15% material    |
+-------------------+  +-------------------+  +-------------------+  +-------------------+
```

Fetch active board_directions from API. Each card shows:
- Visual pattern (CSS or SVG illustration — lines showing the direction)
- Localized name + description
- Material/labour multiplier badge: "+10% material" if multiplier > 1.0
- Price impact: live calculation showing the difference from base

Single select. Selection updates wizard state → recalculates live quote.

**Board profile (sub-selection):**

Below the direction cards, show profile options:

```
Profile:  (●) Standard Smooth    ( ) Grooved/Anti-Slip (+5%)    ( ) Brushed (+8%)
```

Fetch active board_profiles. Radio buttons with:
- Localized name
- Price modifier badge
- Only show profiles applicable to the selected material (`applicable_materials` filter or NULL = all)
- For pool decks: "Recommended: Grooved/Anti-Slip" badge

### 2. Step 5: Colour / Finish

**Question:**
- EN: "Choose your finish"
- AF: "Kies jou afwerking"

Fetch finish_options filtered by the selected material_type_id.

**Display varies by material type:**

**For stainable materials (pine, hardwood):**
```
┌─ Stain Colours ──────────────────────────────────┐
│                                                    │
│  [■] No Finish   [■] Clear Seal   [■] Natural Oak│
│  (Raw)           (#D4B896)        (#C4A87C)       │
│                                                    │
│  [■] Teak        [■] Walnut       [■] Charcoal   │
│  (#8B6914)       (#5C4033)        (#36454F)       │
│                                                    │
└────────────────────────────────────────────────────┘
```

Each swatch: hex colour circle + localized name. Click to select. Selected swatch gets a check mark + ring.

If staining requires a service extra → show info: "Staining service available as an add-on in the next step" or auto-add to extras.

**For composite:**
```
Factory Colours:
  [■] Grey Stone   [■] Teak   [■] Charcoal   [■] Sand
```

**For hardwood:**
```
Oil Options:
  [■] Clear Oil    [■] Tinted Oil
```

**Colour disclaimer (localized):**
- EN: "Colours shown on screen may vary from the actual product. We recommend requesting a free sample."
- AF: "Kleure op die skerm kan van die werklike produk verskil. Ons beveel aan dat jy 'n gratis monster aanvra."

"Request free sample" link → same sample request modal from Build 17.

### 3. Step 6: Extras & Add-Ons

**Question:**
- EN: "Would you like any extras with your deck?"
- AF: "Wil jy enige ekstra's by jou dek voeg?"

Fetch configurator_extras filtered by the selected deck_type's `applicable_extras`. For each extra, fetch its pricing from extras_pricing.

**Display as toggleable cards with quantity inputs:**

```
┌─ Steps ──────────────────────────────────────────────────┐
│  [✅]                                                      │
│  Deck stairs matching your material choice                │
│                                                            │
│  Number of steps: [▼ 4 ▲]    Step width: [1.2] m         │
│                                                            │
│  4 steps × 1.2m = R 5,712                                │
└────────────────────────────────────────────────────────────┘

┌─ Railings ───────────────────────────────────────────────┐
│  [✅]                                                      │
│  Safety railings for raised decks and steps               │
│                                                            │
│  Material: (●) Timber  ( ) Stainless+Wood  ( ) Glass+Wood│
│  Linear metres: [6.4] m                                   │
│                                                            │
│  6.4m × R1,680/m = R 10,752                              │
└────────────────────────────────────────────────────────────┘

┌─ Built-in Seating ───────────────────────────────────────┐
│  [  ]  (not selected)                                     │
│  Built-in bench seating along your deck edge              │
│                                                            │
│  R1,330/m                                                 │
└────────────────────────────────────────────────────────────┘

┌─ Pergola ────────────────────────────────────────────────┐
│  [  ]  (not selected)                                     │
│  Shade structure over your deck                           │
│                                                            │
│  R2,520/m²                                                │
└────────────────────────────────────────────────────────────┘
```

**Card behaviour:**
- Toggle checkbox to enable/disable the extra
- When enabled, quantity inputs appear (driven by `input_config` JSONB)
- For extras with material variants (railings): radio buttons for variant selection
- Price updates live as quantity/variant changes
- Line total shown per extra

**Input rendering from `input_config`:**

```typescript
// The input_config JSONB defines what UI to render:
{
  min: 1, max: 20, step: 1, unit: 'steps',
  width_min: 0.6, width_max: 3.0, width_step: 0.1, width_unit: 'm',
  label: { en: 'Number of steps', af: 'Aantal trappe' }
}
// → Renders: stepper input for count + number input for width

{
  min: 0.5, max: 50, step: 0.5, unit: 'm',
  label: { en: 'Linear metres of railing', af: 'Lineêre meter reling' }
}
// → Renders: number input with 0.5 step
```

### 4. Live Quote Sidebar / Footer

Throughout Steps 4–6, show a running quote total:

**Desktop: sticky sidebar**
```
┌─ Your Quote ──────────┐
│                        │
│  14.4 m² deck          │
│  SA Pine CCA           │
│  Lengthwise, Standard  │
│  Walnut stain          │
│                        │
│  Materials:    R 8,467 │
│  Substructure: R 3,629 │
│  Fixings:      R   706 │
│  Steps (4):    R 5,712 │
│  Railings:     R10,752 │
│  Labour:       R 5,040 │
│                        │
│  Subtotal:    R34,306  │
│  VAT (15%):    R 5,146 │
│  Total:       R39,452  │
│                        │
│  [Continue →]          │
└────────────────────────┘
```

**Mobile: sticky bottom bar**
```
┌────────────────────────────────────────┐
│  Total: R39,452  (tap to see breakdown)│
│  [Continue →]                          │
└────────────────────────────────────────┘
```

Tapping the mobile bar slides up a full breakdown sheet.

The quote calls `POST /api/deck/calculate` on every change (debounced 300ms). Or calculate client-side if rates are already fetched.

### 5. Extras Interaction with Step 5

If the customer selects a finish that requires staining (Step 5) and they choose "Installation":
- Auto-suggest staining service in Step 6
- Show: "You selected Walnut stain. Add professional staining for R X/m²?"
- Don't auto-add, just highlight

### 6. Localization

All UI text from locale JSON:

```json
"configurator": {
  "step4": {
    "title": "How should the boards run?",
    "subtitle": "Board direction affects material usage and cost",
    "profileLabel": "Board Profile",
    "materialImpact": "+{percent}% material",
    "recommended": "Recommended"
  },
  "step5": {
    "title": "Choose your finish",
    "subtitle": "Select a colour or finish for your deck",
    "colourDisclaimer": "Colours shown on screen may vary. Request a free sample.",
    "requestSample": "Request free sample",
    "stainingNote": "Staining service available as an add-on"
  },
  "step6": {
    "title": "Would you like any extras?",
    "subtitle": "Enhance your deck with add-ons",
    "perStep": "/step (per metre width)",
    "perMetre": "/m",
    "perUnit": "each",
    "perM2": "/m²"
  },
  "quoteSidebar": {
    "yourQuote": "Your Quote",
    "materials": "Materials",
    "substructure": "Substructure",
    "fixings": "Fixings",
    "labour": "Labour",
    "subtotal": "Subtotal",
    "total": "Total"
  }
}
```

Database content (direction names, finish names, extra names/descriptions) uses `t(field, locale)`.

---

## Acceptance Criteria

```
✅ Step 4: board direction cards render with visual patterns + multiplier badges
✅ Step 4: board profile radio buttons filter by applicable materials
✅ Step 4: selecting diagonal shows "+10% material" and live quote updates
✅ Step 5: finish options filtered by selected material type
✅ Step 5: colour swatches render with hex colours
✅ Step 5: composite shows factory colours, pine shows stain options
✅ Step 5: colour disclaimer and sample request link present
✅ Step 6: extras filtered by deck type's applicable_extras
✅ Step 6: toggle checkbox enables/disables extra with quantity inputs
✅ Step 6: input_config JSONB drives the correct input type per extra
✅ Step 6: railings show material variant radio buttons with different prices
✅ Step 6: line total per extra updates live
✅ Live quote sidebar/footer updates on every selection change
✅ Mobile: sticky bottom bar with expandable breakdown
✅ All text localized (EN/AF toggle works)
✅ Dark mode: all cards, swatches, and sidebar render correctly
✅ Back navigation preserves selections
```

---

## Notes for Claude Code

- Steps 4–6 are the "configuration" heart of the wizard. They must feel snappy — debounced pricing calls, no loading spinners between selections.
- The `input_config` JSONB rendering is a dynamic form system — create a `<DynamicExtraInput extra={extra} />` component that reads input_config and renders the appropriate inputs.
- Board direction visual patterns: use CSS lines/gradients or inline SVGs. Don't load images for the pattern illustrations.
- The live quote sidebar calls the pricing engine. For quick mode (no designer), it uses Mode A (m² rates). If the designer produced a board layout (Build 19–20), it uses Mode B (exact counts). The sidebar displays the same regardless.
- Extras with `pricing_model: 'per_m2'` and `extra_key: 'staining'` should auto-fill the quantity with the deck area — the customer doesn't type m² for staining, it's implied.
