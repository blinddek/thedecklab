# Build 17 — Configurator: Steps 1–2 (Deck Type + Material)

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 09 (pricing engine)
> **Context Files:** PROJECT_BRIEF.md §3 (Steps 1–2), YOROS_I18N_DARKMODE_STANDARD.md

---

## Objective

Build the first two steps of the deck configurator wizard: deck type selection and material choice. These are visual card-selection steps that fetch data from the database and set the foundation for the pricing calculation. Full i18n support (EN/AF).

---

## Tasks

### 1. Configurator Route & Wizard Shell

**`src/app/(public)/configure/page.tsx`**

Create the wizard framework:
- Step-based navigation with back/forward
- Progress indicator (step dots or bar showing 1 of 8)
- Wizard state managed via React context or URL search params
- Responsive: works on mobile (full-width cards, stacked layout)
- Each step fetches its data from the API
- "Start Over" link to reset wizard state

```typescript
// src/types/configurator.ts
interface ConfiguratorState {
  step: number
  deck_type_id: string | null
  deck_type_slug: string | null
  material_type_id: string | null
  material_type_slug: string | null
  dimensions: { length_m: number; width_m: number } | null
  deck_design: DeckDesign | null          // from designer (Build 18)
  board_direction: string | null
  board_profile: string | null
  finish_option: string | null
  finish_colour: string | null
  extras: SelectedExtra[]
  installation_type: 'installation' | 'supply_deliver' | 'supply_collect' | null
  delivery_region: 'western_cape' | 'national' | null
  live_quote: DeckQuote | null
}
```

### 2. Step 1: Deck Type

**Question (localized):**
- EN: "What kind of deck are you planning?"
- AF: "Watter soort dek beplan jy?"

Fetch active deck_types from `GET /api/deck/types`. Display as visual cards:

```
+-------------------+  +-------------------+  +-------------------+  +-------------------+
|  [lifestyle img]  |  |  [lifestyle img]  |  |  [lifestyle img]  |  |  [lifestyle img]  |
|                   |  |                   |  |                   |  |                   |
|  Ground-Level     |  |  Raised Deck      |  |  Pool Deck        |  |  Balcony/Rooftop  |
|  Deck             |  |                   |  |                   |  |                   |
|  ───────────────  |  |  ───────────────  |  |  ───────────────  |  |  ───────────────  |
|  Flush with the   |  |  Elevated above   |  |  Designed for     |  |  Overlay for      |
|  ground. Ideal    |  |  ground level.    |  |  pool surrounds.  |  |  concrete balcony |
|  for flat gardens |  |  Requires steps   |  |  Anti-slip and    |  |  or flat roofs.   |
|  and patios.      |  |  and railings.    |  |  moisture-ready.  |  |                   |
+-------------------+  +-------------------+  +-------------------+  +-------------------+
```

- Cards show: image + localized name + localized description
- Single select (clicking one deselects others)
- Selected card: accent border + subtle highlight
- "Next" button enabled only when a type is selected
- Mobile: cards stack 1-column, full-width

### 3. Step 2: Material Choice

**Question (localized):**
- EN: "What material do you prefer?"
- AF: "Watter materiaal verkies jy?"

Fetch active material_types with customer m² rates from `GET /api/deck/materials`. Display as feature-rich cards:

```
+-----------------------------------+  +-----------------------------------+
|  [material swatch / texture img]  |  |  [material swatch / texture img]  |
|                                   |  |                                   |
|  SA Pine CCA Treated              |  |  Balau Hardwood                   |
|  ─────────────────────────────    |  |  ─────────────────────────────    |
|  Durability: ⭐⭐⭐                |  |  Durability: ⭐⭐⭐⭐⭐             |
|  Maintenance: Medium              |  |  Maintenance: Low                 |
|  Lifespan: 10-15 years            |  |  Lifespan: 25-40 years            |
|  Can be stained ✅                 |  |  Can be stained ✅                 |
|                                   |  |                                   |
|  From R588/m²                     |  |  From R1,176/m²                   |
+-----------------------------------+  +-----------------------------------+
```

- Cards show: image, localized name, feature badges (durability stars, maintenance, lifespan, stainable/composite), starting m² customer price
- Starting price: lowest `boards_per_m2` customer_price_cents for that material
- "Request free sample" link per card → modal that submits to sample_requests table
- Single select
- Mobile: 1 or 2 column grid

### 4. "Request Free Sample" Modal

Triggered from material cards:
- Name (required)
- Email (required)
- Phone (optional)
- Delivery address (street, city, province, postal code)
- Material auto-selected from the card they clicked
- Submit → INSERT into sample_requests
- Confirmation toast: "Your sample is on its way!"

### 5. Localization

All UI text (question headings, button labels, feature labels, placeholder text) comes from locale JSON files:

```json
// In en.json:
"configurator": {
  "step1": {
    "title": "What kind of deck are you planning?",
    "subtitle": "Select the deck type that best matches your space"
  },
  "step2": {
    "title": "What material do you prefer?",
    "subtitle": "Each material has unique characteristics and pricing",
    "fromPriceLabel": "From",
    "perM2": "/m²",
    "requestSample": "Request free sample",
    "durability": "Durability",
    "maintenance": "Maintenance",
    "lifespan": "Lifespan",
    "stainable": "Can be stained",
    "composite": "Composite"
  }
}
```

Database content (deck type names, material names, descriptions) uses `t(field, locale)`.

### 6. Wizard State Persistence

- Store wizard state in React context
- Back up to localStorage on every step change
- On page load: check localStorage for existing state, offer to resume
- "Start Over" clears localStorage and resets context

---

## Acceptance Criteria

```
✅ /configure route renders wizard with progress indicator
✅ Step 1 shows deck type cards from database (localized names + descriptions)
✅ Step 1 single-select works, "Next" disabled until selected
✅ Step 2 shows material cards with features and starting m² price
✅ Step 2 starting price comes from configurator_rates (customer_price_cents)
✅ "Request free sample" modal submits to sample_requests table
✅ Language toggle switches all text (headings, labels, DB content)
✅ Dark mode: cards render correctly
✅ Mobile responsive: cards stack correctly
✅ Wizard state persists in localStorage
✅ Back button returns to previous step with state preserved
✅ "Start Over" clears state and resets to Step 1
```

---

## Notes for Claude Code

- The wizard shell is the foundation for Steps 3–8 — get the navigation, state management, and progress indicator right here. Every subsequent step just adds a new content component.
- Don't fetch all data upfront — each step fetches its own data. Step 2 only loads after Step 1 completes.
- The starting m² price shown on material cards is the `boards_per_m2` customer rate only (not substructure or fixings) — it's a "from" price to help comparison.
- The feature badges (durability stars, maintenance level) come from material_types columns.
- Use `t()` helper for all database content. Use locale JSON for all UI strings.
- The sample_requests form is the first lead capture point in the configurator — make it smooth and quick (3 required fields).
