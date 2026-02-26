# Build 09 — Configurator Pricing Engine

> **Type:** Backend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 08
> **Context Files:** TECHNICAL_DESIGN.md §1 (Pricing Model), §3 (Pricing Engine), CALCULATOR_REFERENCE.md

---

## Objective

Build the server-side pricing engine that powers both the configurator (Mode A: m² quick quote) and the API. This engine takes a deck configuration and returns a full price breakdown — public response excludes supplier costs, admin response includes full margin data.

---

## Tasks

### 1. Core Pricing Module

Create `src/lib/pricing/configurator.ts`:

```typescript
interface DeckConfig {
  deck_type_id: string
  material_type_id: string
  length_m: number
  width_m: number
  board_direction: string       // 'lengthwise' | 'widthwise' | 'diagonal' | 'herringbone'
  board_profile?: string
  finish_option?: string
  installation: boolean
  extras: SelectedExtra[]
}

interface SelectedExtra {
  extra_key: string
  quantity: number              // step count, linear metres, m², or units
  material_variant?: string
  // For steps: also need step_width_m
  step_width_m?: number
}

interface DeckQuote {
  area_m2: number
  materials_cost_cents: number
  substructure_cost_cents: number
  fixings_cost_cents: number
  direction_multiplier: number
  profile_modifier_percent: number
  staining_cost_cents: number
  labour_cost_cents: number
  extras_breakdown: ExtraLineItem[]
  subtotal_cents: number
  delivery_fee_cents: number
  vat_cents: number
  total_cents: number
  deposit_cents: number | null      // only if installation
  balance_cents: number | null      // only if installation
}

// Admin-only extended response
interface DeckQuoteAdmin extends DeckQuote {
  supplier_materials_cents: number
  supplier_substructure_cents: number
  supplier_fixings_cents: number
  markup_percent: number
  margin_cents: number
  margin_percent: number
}
```

### 2. Calculation Flow

```
1. Look up configurator_rates for the selected material_type_id
2. Calculate area: length_m × width_m
3. Calculate base costs:
   - materials = area × boards_per_m2 rate
   - substructure = area × substructure_per_m2 rate × deck_type.substructure_multiplier
   - fixings = area × fixings_per_m2 rate
4. Apply direction multiplier (from board_directions table):
   - materials × direction.material_multiplier
   - labour × direction.labour_multiplier
5. Apply board profile modifier:
   - materials × (1 + profile.price_modifier_percent / 100)
6. If staining selected:
   - staining = area × staining_per_m2 rate
7. If installation:
   - labour = area × labour_per_m2 rate × deck_type.labour_complexity_multiplier × direction.labour_multiplier
8. Calculate extras (see §3)
9. Sum subtotal = materials + substructure + fixings + staining + labour + extras
10. Apply delivery fee (from site_settings, based on delivery_region)
11. Calculate VAT = (subtotal + delivery) × vat_percent / 100
12. Total = subtotal + delivery + VAT
13. If installation: deposit = total × deposit_percent / 100, balance = total - deposit
```

### 3. Extras Calculator

Create `src/lib/pricing/extras.ts`:

```typescript
function calculateExtra(extra: ConfiguratorExtra, pricing: ExtraPricing, input: SelectedExtra): number {
  switch (extra.pricing_model) {
    case 'per_step_metre':
      // steps: quantity (step count) × step_width_m × rate
      return input.quantity * (input.step_width_m || 1) * pricing.customer_price_cents

    case 'per_linear_metre':
      // railings, seating: quantity (linear metres) × rate
      return Math.ceil(input.quantity * pricing.customer_price_cents)

    case 'per_unit':
      // planters: quantity × rate
      return input.quantity * pricing.customer_price_cents

    case 'per_m2':
      // pergola: quantity (m²) × rate
      // staining: auto-calculated from deck area, no separate input
      return Math.ceil(input.quantity * pricing.customer_price_cents)

    case 'fixed':
      return pricing.customer_price_cents

    default:
      return 0
  }
}
```

### 4. Markup Cascade

Create `src/lib/pricing/markup.ts`:

```typescript
// Resolution order (first match wins):
// 1. Product-specific markup (scope_type = 'product', scope_id = product.id)
// 2. Material-category markup (scope_type = 'material', scope_id = material_type.id)
// 3. Global markup (scope_type = 'global', scope_id = NULL)

async function resolveMarkup(productId?: string, materialTypeId?: string): Promise<number> {
  // Try product-specific first
  if (productId) {
    const product = await getMarkup('product', productId)
    if (product) return product.markup_percent
  }

  // Try material-category
  if (materialTypeId) {
    const material = await getMarkup('material', materialTypeId)
    if (material) return material.markup_percent
  }

  // Fall back to global
  const global = await getMarkup('global', null)
  return global?.markup_percent || 40  // ultimate fallback
}
```

### 5. API Routes

Create `src/app/api/deck/calculate/route.ts`:

```typescript
// POST /api/deck/calculate
// Body: DeckConfig
// Returns: DeckQuote (public — NO supplier costs)
// Validates: area 1–200 m², valid material/deck type IDs, extras within bounds
```

Create `src/app/api/deck/extras/route.ts`:

```typescript
// POST /api/deck/extras
// Body: { deck_type_id, area_m2 }
// Returns: applicable extras with customer prices (filtered by deck_type.applicable_extras)
```

Create `src/app/api/deck/materials/route.ts`:

```typescript
// GET /api/deck/materials
// Returns: active material_types with customer m² rates (NOT supplier costs)
// Each material includes: name, slug, image_url, customer rates, durability, maintenance
```

Create `src/app/api/deck/types/route.ts`:

```typescript
// GET /api/deck/types
// Returns: active deck_types (name, slug, description, image)
// Does NOT expose multipliers to public
```

Create `src/app/api/deck/directions/route.ts`:

```typescript
// GET /api/deck/directions
// Returns: board_directions with material_multiplier (needed for live price updates)
```

Create `src/app/api/deck/finishes/route.ts`:

```typescript
// GET /api/deck/finishes?material_type_id=X
// Returns: finish_options for selected material
```

### 6. Security: Public vs Admin Response

The pricing engine has two output modes:

```typescript
function formatPublicQuote(quote: DeckQuoteAdmin): DeckQuote {
  // Strip: supplier costs, markup percentages, margin data
  const { supplier_materials_cents, supplier_substructure_cents,
          supplier_fixings_cents, markup_percent,
          margin_cents, margin_percent, ...publicQuote } = quote
  return publicQuote
}
```

The admin pricing simulator (Build 15) calls the same engine but returns the full `DeckQuoteAdmin`.

### 7. Validation

```typescript
const DeckConfigSchema = z.object({
  deck_type_id: z.string().uuid(),
  material_type_id: z.string().uuid(),
  length_m: z.number().min(0.5).max(30),
  width_m: z.number().min(0.5).max(30),
  board_direction: z.enum(['lengthwise', 'widthwise', 'diagonal', 'herringbone']),
  board_profile: z.string().optional(),
  finish_option: z.string().optional(),
  installation: z.boolean(),
  extras: z.array(z.object({
    extra_key: z.string(),
    quantity: z.number().min(0),
    material_variant: z.string().optional(),
    step_width_m: z.number().min(0.3).max(5).optional(),
  })),
})
```

Area validation: `length_m × width_m` must be between 1 and 200 m².

---

## Acceptance Criteria

```
✅ POST /api/deck/calculate returns correct price for a known test case
✅ Test case: 4.5m × 3.2m, SA Pine, lengthwise, ground-level, no extras, supply only
   → area = 14.4 m², materials + substructure + fixings = ~R127,872 (at seed rates)
✅ Direction multiplier applies correctly (diagonal → 1.10× materials)
✅ Deck type multiplier applies correctly (raised → 1.30× substructure + labour)
✅ Installation adds labour cost + deposit/balance split
✅ Extras calculate correctly for each pricing model
✅ Railings with material variant selects correct pricing tier
✅ Public API does NOT return supplier_cost_cents or markup_percent
✅ GET /api/deck/materials returns materials with customer prices only
✅ Markup cascade resolves in correct order (product → material → global)
✅ API response time < 200ms
✅ Zod validation rejects invalid inputs
```

---

## Notes for Claude Code

- All prices are in ZAR cents (integer) — never floating point for money
- Use `Math.ceil()` when converting from percentages to avoid rounding down
- The `staining_per_m2` rate from configurator_rates is for the configurator's staining SERVICE extra — it's the cost of labour to stain. The cost of the stain PRODUCT is separate (handled by the shop).
- The delivery fee comes from site_settings: `wc_delivery_fee_cents` for Western Cape, `national_delivery_fee_cents` for national. Free delivery above `free_delivery_threshold_cents`.
- For installation orders, delivery is included (set to 0) — the install team brings materials.
- The deposit_percent comes from site_settings (default 50%).
- This engine is Mode A only (m² rates). Mode B (exact board-level pricing from the designer) is Build 19–20.
