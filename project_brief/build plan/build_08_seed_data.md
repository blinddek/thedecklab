# Build 08 — Seed Data (Materials, Products, Rates)

> **Type:** Backend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 07
> **Context Files:** TECHNICAL_DESIGN.md, CALCULATOR_REFERENCE.md, YOROS_I18N_DARKMODE_STANDARD.md

---

## Objective

Seed the database with all initial data: material types, product categories, products with variants, deck types, configurator rates, board directions, profiles, finish options, extras, and board dimensions. All public-facing text fields use LocalizedString JSONB `{en, af}`.

After this build, the shop has products to browse and the configurator has rates to calculate with.

---

## Tasks

### 1. Create Seed Script

Create `src/lib/import/seed.ts` — a runnable script (or server action) that populates all reference data.

### 2. Material Types

Seed 4 core materials:

```typescript
const materials = [
  {
    name: { en: 'SA Pine CCA Treated', af: 'SA Den CCA Behandel' },
    slug: 'sa-pine-cca',
    description: { en: 'Pressure-treated softwood, most affordable option for residential decking. H3 CCA treatment for outdoor use.', af: 'Drukbehandelde sagtehout, die bekostigbaarste opsie vir residensiële dekke. H3 CCA-behandeling vir buite-gebruik.' },
    durability_rating: 3,
    maintenance_level: 'medium',
    lifespan_years: '10-15',
    is_stainable: true,
    is_composite: false,
  },
  {
    name: { en: 'Balau Hardwood', af: 'Balau Hardehout' },
    slug: 'balau',
    description: { en: 'Premium African hardwood with exceptional durability and a rich natural grain. Ideal for high-end residential decks.', af: 'Premium Afrika-hardehout met uitsonderlike duursaamheid en \'n ryk natuurlike nerf. Ideaal vir hoë-klas residensiële dekke.' },
    durability_rating: 5,
    maintenance_level: 'low',
    lifespan_years: '25-40',
    is_stainable: true,
    is_composite: false,
  },
  {
    name: { en: 'Garapa Hardwood', af: 'Garapa Hardehout' },
    slug: 'garapa',
    description: { en: 'South American hardwood with a golden honey tone. Naturally durable with excellent weathering characteristics.', af: 'Suid-Amerikaanse hardehout met \'n goue heuningtoon. Natuurlik duursaam met uitstekende verweringseienskappe.' },
    durability_rating: 4,
    maintenance_level: 'low',
    lifespan_years: '20-30',
    is_stainable: true,
    is_composite: false,
  },
  {
    name: { en: 'Composite / WPC', af: 'Saamgesteld / WPC' },
    slug: 'composite',
    description: { en: 'Wood-plastic composite decking. Zero maintenance, fade-resistant, and splinter-free. Multiple colour options available.', af: 'Hout-plastiek saamgestelde dekplanke. Geen onderhoud, kleurvast en splintersvry. Verskeie kleuropsies beskikbaar.' },
    durability_rating: 4,
    maintenance_level: 'low',
    lifespan_years: '25-30',
    is_stainable: false,
    is_composite: true,
  },
]
```

### 3. Product Categories

Seed hierarchical categories:

```typescript
const categories = [
  // Top-level
  { name: { en: 'Deck Boards', af: 'Dekplanke' }, slug: 'deck-boards', parent: null },
  { name: { en: 'Substructure', af: 'Onderbou' }, slug: 'substructure', parent: null },
  { name: { en: 'Fixings', af: 'Hegstukke' }, slug: 'fixings', parent: null },
  { name: { en: 'Finishing', af: 'Afwerking' }, slug: 'finishing', parent: null },
  { name: { en: 'Kits & Bundles', af: 'Stelle & Bondels' }, slug: 'kits', parent: null },

  // Sub-categories under Deck Boards
  { name: { en: 'Treated Pine', af: 'Behandelde Den' }, slug: 'deck-boards-pine', parent: 'deck-boards' },
  { name: { en: 'Balau', af: 'Balau' }, slug: 'deck-boards-balau', parent: 'deck-boards' },
  { name: { en: 'Garapa', af: 'Garapa' }, slug: 'deck-boards-garapa', parent: 'deck-boards' },
  { name: { en: 'Composite', af: 'Saamgesteld' }, slug: 'deck-boards-composite', parent: 'deck-boards' },

  // Sub-categories under Substructure
  { name: { en: 'Joists', af: 'Balke' }, slug: 'joists', parent: 'substructure' },
  { name: { en: 'Bearers', af: 'Draers' }, slug: 'bearers', parent: 'substructure' },
  { name: { en: 'Posts & Brackets', af: 'Pale & Hakies' }, slug: 'posts-brackets', parent: 'substructure' },

  // Sub-categories under Fixings
  { name: { en: 'Screws', af: 'Skroewe' }, slug: 'screws', parent: 'fixings' },
  { name: { en: 'Hidden Clips', af: 'Versteekte Knippe' }, slug: 'hidden-clips', parent: 'fixings' },
  { name: { en: 'Spacers', af: 'Spasieerders' }, slug: 'spacers', parent: 'fixings' },
  { name: { en: 'Joist Tape', af: 'Balkband' }, slug: 'joist-tape', parent: 'fixings' },

  // Sub-categories under Finishing
  { name: { en: 'Stains & Oils', af: 'Beitsmiddels & Olies' }, slug: 'stains-oils', parent: 'finishing' },
  { name: { en: 'Cleaners', af: 'Skoonmakers' }, slug: 'cleaners', parent: 'finishing' },
  { name: { en: 'Sealers', af: 'Seëlmiddels' }, slug: 'sealers', parent: 'finishing' },
]
```

### 4. Products with Variants

Seed initial products. Each deck board product gets length variants. Example:

```typescript
// SA Pine CCA 22×108mm Deck Board
{
  name: { en: 'SA Pine CCA 22×108mm Deck Board', af: 'SA Den CCA 22×108mm Dekplank' },
  slug: 'sa-pine-cca-22x108',
  category_slug: 'deck-boards-pine',
  material_slug: 'sa-pine-cca',
  sku: 'DL-PB-22108',
  dimensions: '22mm × 108mm',
  short_description: { en: 'Standard profile deck board, CCA H3 treated for outdoor use', af: 'Standaard profiel dekplank, CCA H3 behandel vir buite-gebruik' },
  base_price_cents: 8500,     // R85.00 for shortest length
  cost_price_cents: 5100,     // R51.00 supplier cost
  features: [
    { en: 'CCA H3 Treated', af: 'CCA H3 Behandel' },
    { en: 'FSC Certified', af: 'FSC Gesertifiseer' },
  ],
  variants: [
    { label: { en: '2.4m', af: '2.4m' }, type: 'length', sku_suffix: '-2400', price_cents: 8500, cost_price_cents: 5100 },
    { label: { en: '3.0m', af: '3.0m' }, type: 'length', sku_suffix: '-3000', price_cents: 10600, cost_price_cents: 6360 },
    { label: { en: '3.6m', af: '3.6m' }, type: 'length', sku_suffix: '-3600', price_cents: 12700, cost_price_cents: 7620 },
    { label: { en: '4.8m', af: '4.8m' }, type: 'length', sku_suffix: '-4800', price_cents: 16900, cost_price_cents: 10140 },
  ],
}
```

**Minimum products to seed (enough to demonstrate shop + configurator):**

| Category | Products | Variants each |
|----------|----------|---------------|
| Pine deck boards | 2 (22×108, 32×114) | 4 lengths each |
| Balau deck boards | 1 (19×90) | 5 lengths |
| Garapa deck boards | 2 (19×90, 19×140) | 5 lengths each |
| Composite deck boards | 1 (22×140) | 3 lengths + 3 colours |
| Pine joists | 2 (38×114, 38×152) | 3 lengths each |
| Pine bearers | 1 (76×228) | 3 lengths |
| Screws | 2 (stainless 50mm, galv 50mm) | 1 each (box of 200) |
| Spacers | 1 | 1 (pack of 50) |
| Joist tape | 1 | 1 (20m roll) |
| Stain | 2 (clear, teak) | 2 volumes each (1L, 5L) |
| **Total** | ~15 products | ~45 variants |

Use placeholder prices that are roughly correct for the SA market. These will be updated via the import tool (Build 10) when Nortier provides real supplier pricing.

### 5. Deck Types

```typescript
const deckTypes = [
  {
    name: { en: 'Ground-Level Deck', af: 'Grondvlak-dek' },
    slug: 'ground-level',
    description: { en: 'Deck built close to ground level, directly on bearers or adjustable pedestals.', af: 'Dek naby grondvlak gebou, direk op draers of verstelbare voetstukke.' },
    labour_complexity_multiplier: 1.00,
    substructure_multiplier: 1.00,
    applicable_extras: ['steps', 'railings', 'seating', 'planters', 'pergola', 'staining'],
  },
  {
    name: { en: 'Raised Deck', af: 'Verhoogde Dek' },
    slug: 'raised',
    description: { en: 'Elevated deck with posts and full substructure. Requires steps and often railings.', af: 'Verhoogde dek met pale en volle onderbou. Vereis trappe en dikwels relings.' },
    labour_complexity_multiplier: 1.30,
    substructure_multiplier: 1.30,
    applicable_extras: ['steps', 'railings', 'seating', 'planters', 'pergola', 'staining'],
  },
  {
    name: { en: 'Pool Deck', af: 'Swembad-dek' },
    slug: 'pool-deck',
    description: { en: 'Deck surrounding a pool. Anti-slip profile and moisture-resistant materials recommended.', af: 'Dek rondom \'n swembad. Anti-glip profiel en vogbestande materiaal word aanbeveel.' },
    labour_complexity_multiplier: 1.20,
    substructure_multiplier: 1.10,
    applicable_extras: ['steps', 'railings', 'seating', 'planters', 'staining'],
  },
  {
    name: { en: 'Balcony / Rooftop', af: 'Balkon / Dak' },
    slug: 'balcony-rooftop',
    description: { en: 'Deck on an existing structure (balcony, flat roof). Requires waterproofing consideration.', af: 'Dek op \'n bestaande struktuur (balkon, plat dak). Vereis waterdigting oorweging.' },
    labour_complexity_multiplier: 1.40,
    substructure_multiplier: 1.20,
    applicable_extras: ['railings', 'seating', 'planters', 'pergola', 'staining'],
  },
]
```

### 6. Configurator Rates

Seed m² rates per material. These are Mode A (quick quote) rates:

```typescript
// Example: SA Pine CCA rates
const pineRates = [
  { rate_type: 'boards_per_m2', supplier_cost_cents: 42000, markup_percent: 40, customer_price_cents: 58800 },
  { rate_type: 'substructure_per_m2', supplier_cost_cents: 18000, markup_percent: 40, customer_price_cents: 25200 },
  { rate_type: 'fixings_per_m2', supplier_cost_cents: 3500, markup_percent: 40, customer_price_cents: 4900 },
  { rate_type: 'labour_per_m2', supplier_cost_cents: 35000, markup_percent: null, customer_price_cents: 35000 },
  { rate_type: 'staining_per_m2', supplier_cost_cents: 8000, markup_percent: 40, customer_price_cents: 11200 },
]
// Repeat for balau (~2× material cost), garapa (~1.8×), composite (~2.5×)
```

### 7. Board Directions

```typescript
const directions = [
  { name: { en: 'Lengthwise', af: 'Lengterigting' }, slug: 'lengthwise', material_multiplier: 1.00, labour_multiplier: 1.00 },
  { name: { en: 'Widthwise', af: 'Breedterigting' }, slug: 'widthwise', material_multiplier: 1.00, labour_multiplier: 1.00 },
  { name: { en: 'Diagonal (45°)', af: 'Diagonaal (45°)' }, slug: 'diagonal', material_multiplier: 1.10, labour_multiplier: 1.15 },
  { name: { en: 'Herringbone', af: 'Visgraat' }, slug: 'herringbone', material_multiplier: 1.15, labour_multiplier: 1.25 },
]
```

### 8. Board Profiles

```typescript
const profiles = [
  { name: { en: 'Standard Smooth', af: 'Standaard Glad' }, slug: 'standard', price_modifier_percent: 0 },
  { name: { en: 'Grooved / Anti-Slip', af: 'Gegroefd / Anti-Glip' }, slug: 'grooved', price_modifier_percent: 5 },
  { name: { en: 'Brushed Texture', af: 'Geborstelde Tekstuur' }, slug: 'brushed', price_modifier_percent: 8 },
]
```

### 9. Finish Options

Seed per material type. Pine gets stain options, composite gets factory colours:

```typescript
// Pine finishes
const pineFinishes = [
  { name: { en: 'No Finish (Raw)', af: 'Geen Afwerking (Rou)' }, finish_type: 'clear_seal', hex_colour: null },
  { name: { en: 'Clear Seal', af: 'Helder Seël' }, finish_type: 'clear_seal', hex_colour: '#D4B896' },
  { name: { en: 'Natural Oak', af: 'Natuurlike Eik' }, finish_type: 'stain', hex_colour: '#C4A87C' },
  { name: { en: 'Teak', af: 'Kiaat' }, finish_type: 'stain', hex_colour: '#8B6914' },
  { name: { en: 'Walnut', af: 'Okkerneut' }, finish_type: 'stain', hex_colour: '#5C4033' },
  { name: { en: 'Charcoal', af: 'Houtskool' }, finish_type: 'stain', hex_colour: '#36454F' },
]

// Composite factory colours
const compositeColours = [
  { name: { en: 'Grey Stone', af: 'Grys Klip' }, finish_type: 'factory_colour', hex_colour: '#808080' },
  { name: { en: 'Teak', af: 'Kiaat' }, finish_type: 'factory_colour', hex_colour: '#8B6914' },
  { name: { en: 'Charcoal', af: 'Houtskool' }, finish_type: 'factory_colour', hex_colour: '#36454F' },
  { name: { en: 'Sand', af: 'Sand' }, finish_type: 'factory_colour', hex_colour: '#C2B280' },
]
```

### 10. Configurator Extras

```typescript
const extras = [
  {
    extra_key: 'steps',
    name: { en: 'Steps', af: 'Trappe' },
    description: { en: 'Deck stairs matching your material choice', af: 'Dektrappe wat by jou materiaalkeuse pas' },
    pricing_model: 'per_step_metre',
    input_config: { min: 1, max: 20, step: 1, unit: 'steps', width_min: 0.6, width_max: 3.0, width_step: 0.1, width_unit: 'm', label: { en: 'Number of steps', af: 'Aantal trappe' } },
    pricing: [
      { material_variant: null, supplier_cost_cents: 85000, markup_percent: 40, customer_price_cents: 119000, unit_label: { en: '/step (per metre width)', af: '/trap (per meter breedte)' } },
    ],
  },
  {
    extra_key: 'railings',
    name: { en: 'Railings', af: 'Relings' },
    description: { en: 'Safety railings for raised decks and steps', af: 'Veiligheidsrelings vir verhoogde dekke en trappe' },
    pricing_model: 'per_linear_metre',
    has_material_variants: true,
    input_config: { min: 0.5, max: 50, step: 0.5, unit: 'm', label: { en: 'Linear metres of railing', af: 'Lineêre meter reling' } },
    pricing: [
      { material_variant: 'wood', variant_label: { en: 'Timber', af: 'Hout' }, supplier_cost_cents: 120000, markup_percent: 40, customer_price_cents: 168000, unit_label: { en: '/m', af: '/m' } },
      { material_variant: 'stainless_wood', variant_label: { en: 'Stainless Steel + Wood', af: 'Vlekvrye Staal + Hout' }, supplier_cost_cents: 250000, markup_percent: 35, customer_price_cents: 337500, unit_label: { en: '/m', af: '/m' } },
      { material_variant: 'glass_wood', variant_label: { en: 'Glass + Wood', af: 'Glas + Hout' }, supplier_cost_cents: 350000, markup_percent: 30, customer_price_cents: 455000, unit_label: { en: '/m', af: '/m' } },
    ],
  },
  {
    extra_key: 'seating',
    name: { en: 'Built-in Seating', af: 'Ingeboude Sitplek' },
    pricing_model: 'per_linear_metre',
    input_config: { min: 0.5, max: 20, step: 0.5, unit: 'm', label: { en: 'Linear metres of seating', af: 'Lineêre meter sitplek' } },
    pricing: [
      { material_variant: null, supplier_cost_cents: 95000, markup_percent: 40, customer_price_cents: 133000, unit_label: { en: '/m', af: '/m' } },
    ],
  },
  {
    extra_key: 'planters',
    name: { en: 'Built-in Planters', af: 'Ingeboude Planters' },
    pricing_model: 'per_unit',
    input_config: { min: 1, max: 10, step: 1, unit: 'units', label: { en: 'Number of planters', af: 'Aantal planters' } },
    pricing: [
      { material_variant: null, supplier_cost_cents: 250000, markup_percent: 40, customer_price_cents: 350000, unit_label: { en: '/planter', af: '/planter' } },
    ],
  },
  {
    extra_key: 'pergola',
    name: { en: 'Pergola', af: 'Pergola' },
    pricing_model: 'per_m2',
    input_config: { min: 1, max: 50, step: 0.5, unit: 'm²', label: { en: 'Pergola area', af: 'Pergola-area' } },
    pricing: [
      { material_variant: null, supplier_cost_cents: 180000, markup_percent: 40, customer_price_cents: 252000, unit_label: { en: '/m²', af: '/m²' } },
    ],
  },
  {
    extra_key: 'staining',
    name: { en: 'Staining Service', af: 'Beitsdiens' },
    pricing_model: 'per_m2',
    input_config: { min: null, max: null, step: null, unit: 'm²', label: { en: 'Applied to full deck area', af: 'Toegepas op volle dek-area' } },
    pricing: [
      { material_variant: null, supplier_cost_cents: 8000, markup_percent: 40, customer_price_cents: 11200, unit_label: { en: '/m²', af: '/m²' } },
    ],
  },
]
```

### 11. Board Dimensions (for Calculator)

Seed from CALCULATOR_REFERENCE.md:

```typescript
const boardDimensions = [
  // SA Pine CCA deck boards
  { material: 'sa-pine-cca', board_type: 'deck', width_mm: 108, thickness_mm: 22, available_lengths_mm: [2400, 3000, 3600, 4800] },
  { material: 'sa-pine-cca', board_type: 'deck', width_mm: 114, thickness_mm: 32, available_lengths_mm: [2400, 3000, 3600, 4800] },

  // Balau deck boards
  { material: 'balau', board_type: 'deck', width_mm: 90, thickness_mm: 19, available_lengths_mm: [2100, 2700, 3000, 3300, 3600] },

  // Garapa deck boards
  { material: 'garapa', board_type: 'deck', width_mm: 90, thickness_mm: 19, available_lengths_mm: [2100, 2400, 3000, 3600, 4800] },
  { material: 'garapa', board_type: 'deck', width_mm: 140, thickness_mm: 19, available_lengths_mm: [2100, 2400, 3000, 3600, 4800] },

  // Composite deck boards
  { material: 'composite', board_type: 'deck', width_mm: 140, thickness_mm: 22, available_lengths_mm: [2400, 3600, 5400] },

  // Joists (pine — used across all deck types)
  { material: 'sa-pine-cca', board_type: 'joist', width_mm: 114, thickness_mm: 38, available_lengths_mm: [3000, 3600, 4800] },
  { material: 'sa-pine-cca', board_type: 'joist', width_mm: 152, thickness_mm: 38, available_lengths_mm: [3000, 3600, 4800] },
  { material: 'sa-pine-cca', board_type: 'joist', width_mm: 152, thickness_mm: 50, available_lengths_mm: [3000, 3600, 4800] },

  // Bearers (pine)
  { material: 'sa-pine-cca', board_type: 'bearer', width_mm: 228, thickness_mm: 76, available_lengths_mm: [3000, 3600, 4800] },
]
```

### 12. Summary Output

The seed script should log a summary:

```
✅ 4 material types
✅ 19 product categories (5 top-level, 14 sub-categories)
✅ ~15 products with ~45 variants
✅ 4 deck types
✅ 20 configurator rates (4 materials × 5 rate types)
✅ 4 board directions
✅ 3 board profiles
✅ ~10 finish options
✅ 6 configurator extras with ~10 pricing entries
✅ 12 board dimension entries
```

---

## Acceptance Criteria

```
✅ Seed script runs without errors
✅ All material types created with correct LocalizedString names
✅ Product categories form correct parent-child tree
✅ Products have variants with individual prices and SKUs
✅ Deck types have correct complexity multipliers
✅ Configurator rates exist for all 4 materials × 5 rate types
✅ Board directions have correct multipliers
✅ Finish options correctly associated with material types
✅ Extras have pricing entries, railings have 3 material variants
✅ Board dimensions match CALCULATOR_REFERENCE.md values
✅ Spot-check: fetching products via Supabase client returns localized names
✅ Spot-check: t(product.name, 'af') returns Afrikaans text
```

---

## Notes for Claude Code

- All prices are **placeholder estimates** — Nortier will provide real supplier pricing later via the import tool (Build 10)
- The customer_price_cents on configurator_rates should be calculated: `ceil(supplier_cost_cents × (1 + markup_percent/100))`
- Link products to board_dimensions where possible via product_id FK
- The seed script should be idempotent — running it twice shouldn't create duplicates (upsert on slug/sku)
- Features arrays should use LocalizedString objects, not plain strings
- Afrikaans translations don't need to be perfect — they can be refined later. Get the structure right.
