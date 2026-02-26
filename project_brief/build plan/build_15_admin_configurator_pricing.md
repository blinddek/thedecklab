# Build 15 — Admin: Configurator Rates & Markup

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 09 (pricing engine), Build 11 (admin layout)
> **Context Files:** TECHNICAL_DESIGN.md §1 (Pricing Model), Build 04 schema
> **Reuse from Blindly:** 🔶 50% — markup UI reusable, rate management is new

---

## Objective

Build the admin interface for managing everything that powers the configurator's pricing: m² rates, deck types, board directions, profiles, finish options, extras with pricing, and the markup cascade. Plus a pricing simulator that lets admin test quotes before they go live.

---

## Tasks

### 1. Configurator Admin Hub

**`src/app/(admin)/admin/configurator/page.tsx`**

Tabbed interface with 6 tabs:

| Tab | Content |
|-----|---------|
| Deck Types | CRUD for ground-level, raised, pool, balcony |
| Material Rates | m² rates per material per cost component |
| Board Options | Directions + profiles |
| Finishes | Stain/oil/colour options per material |
| Extras | Steps, railings, seating, planters, pergola, staining |
| Calculator Constants | Site settings for calculator formulas |

### 2. Deck Types Tab

Table:

| Name (EN) | Slug | Labour × | Substructure × | Extras | Active | Actions |
|-----------|------|---------|----------------|--------|--------|---------|
| Ground-Level | ground-level | 1.00 | 1.00 | steps, railings, ... | ✅ | Edit |
| Raised | raised | 1.30 | 1.30 | steps, railings, ... | ✅ | Edit |

**Edit dialog:**
- Name: LocalizedInput (EN/AF)
- Slug: auto-generated
- Description: LocalizedTextarea (EN/AF)
- Image: media picker
- Labour complexity multiplier: number input (0.50–3.00)
- Substructure multiplier: number input (0.50–3.00)
- Applicable extras: multi-select checkboxes (from configurator_extras)
- Display order, active toggle

### 3. Material Rates Tab

Matrix view — rows are materials, columns are rate types:

```
                    | Boards/m² | Substructure/m² | Fixings/m² | Labour/m² | Staining/m² |
SA Pine CCA         | R588      | R252            | R49        | R350      | R112        |
  supplier cost:    | R420      | R180            | R35        | R350      | R80         |
  markup:           | 40%       | 40%             | 40%        | 0%        | 40%         |
Balau               | R1,176    | R350            | R62        | R450      | R135        |
  ...
```

**Edit rate dialog:**
- Material (pre-selected)
- Rate type (pre-selected)
- Supplier cost: PriceInput (Rands → cents)
- Markup %: number input (or "Use global" checkbox)
- Customer price: auto-calculated, shown as read-only
- Notes: text input

**Features:**
- Colour-code margins: green (>35%), yellow (20–35%), red (<20%)
- "Recalculate all" button: recalculates all customer prices from current supplier costs + markup
- Bulk edit: select multiple rates → apply same markup %

### 4. Board Options Tab

**Directions section:**

| Name (EN) | Material × | Labour × | Active |
|-----------|-----------|---------|--------|
| Lengthwise | 1.00 | 1.00 | ✅ |
| Diagonal (45°) | 1.10 | 1.15 | ✅ |

Edit: LocalizedInput name, multiplier inputs.

**Profiles section:**

| Name (EN) | Price Modifier | Applicable Materials | Active |
|-----------|---------------|---------------------|--------|
| Standard Smooth | +0% | All | ✅ |
| Grooved / Anti-Slip | +5% | All | ✅ |

Edit: LocalizedInput name, modifier %, material multi-select.

### 5. Finishes Tab

Grouped by material:

**SA Pine CCA:**
| Name (EN) | Type | Colour | Active |
|-----------|------|--------|--------|
| No Finish (Raw) | clear_seal | — | ✅ |
| Natural Oak | stain | 🟫 #C4A87C | ✅ |
| Teak | stain | 🟤 #8B6914 | ✅ |

**Composite:**
| Name (EN) | Type | Colour | Active |
|-----------|------|--------|--------|
| Grey Stone | factory_colour | ⬜ #808080 | ✅ |

Edit: LocalizedInput name, finish type select, hex colour picker, swatch image upload.

### 6. Extras Tab

Table:

| Name (EN) | Key | Pricing Model | Variants | Active | Actions |
|-----------|-----|--------------|----------|--------|---------|
| Steps | steps | per_step_metre | No | ✅ | Edit / Pricing |
| Railings | railings | per_linear_metre | 3 variants | ✅ | Edit / Pricing |

**Edit extra dialog:**
- Name: LocalizedInput (EN/AF)
- Description: LocalizedTextarea (EN/AF)
- Extra key: read-only (set on creation)
- Pricing model: select (per_step_metre, per_linear_metre, per_unit, per_m2, fixed)
- Has material variants: toggle
- Input config: JSON editor (min, max, step, unit, label)
- Image: media picker

**Pricing sub-table (per extra):**

For extras WITHOUT variants:
| Supplier Cost | Markup % | Customer Price | Unit Label |
|--------------|---------|---------------|------------|
| R850.00 | 40% | R1,190.00 | /step×m |

For extras WITH variants (e.g., railings):
| Variant (EN) | Supplier Cost | Markup % | Customer Price | Unit |
|-------------|--------------|---------|---------------|------|
| Timber | R1,200.00 | 40% | R1,680.00 | /m |
| Stainless + Wood | R2,500.00 | 35% | R3,375.00 | /m |
| Glass + Wood | R3,500.00 | 30% | R4,550.00 | /m |

Add variant, edit pricing, remove variant.

### 7. Calculator Constants Tab

Display and edit all site_settings in the `calculator` category:

| Setting | Value | Label |
|---------|-------|-------|
| calc_joist_spacing_multiplier | 20 | Joist Spacing Multiplier |
| calc_bearer_spacing_mm | 2400 | Bearer Spacing (mm) |
| calc_waste_factor | 1.05 | Waste Factor |
| calc_diagonal_multiplier | 1.10 | Diagonal Multiplier |
| ... | ... | ... |

Simple key-value editor with descriptions. Save all button.

### 8. Markup Cascade

**`src/app/(admin)/admin/pricing/page.tsx`**

**Global markup:**
- Single number input: "Default markup: 40%"
- Applies to all products/rates that don't have a specific override

**Material-level overrides:**

| Material | Override Markup | Effective | Actions |
|----------|---------------|-----------|---------|
| SA Pine CCA | — (uses global 40%) | 40% | Set Override |
| Balau | 35% | 35% | Edit / Remove |
| Composite | 45% | 45% | Edit / Remove |

**Product-level overrides:**

| Product | Override Markup | Effective | Source | Actions |
|---------|---------------|-----------|--------|---------|
| Balau 19×90 | 30% | 30% | Product | Edit / Remove |
| Pine Joist 38×114 | — | 40% | Global | Set Override |

"Effective" column shows the resolved markup with source (product > material > global).

### 9. Pricing Simulator

On the pricing page or as a separate tab:

```
┌─ Pricing Simulator ────────────────────────────┐
│                                                 │
│ Deck Type: [Ground-Level    ▼]                 │
│ Material:  [SA Pine CCA     ▼]                 │
│ Length:    [4.5] m  Width: [3.2] m             │
│ Direction: [Lengthwise      ▼]                 │
│ Installation: [✅]                              │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ Area:              14.40 m²                 │ │
│ │ Materials:         R 8,467  (cost: R 6,048) │ │
│ │ Substructure:      R 3,629  (cost: R 2,592) │ │
│ │ Fixings:           R    706 (cost: R   504) │ │
│ │ Labour:            R 5,040                  │ │
│ │ ─────────────────────────────────────────── │ │
│ │ Subtotal:          R17,842                  │ │
│ │ VAT (15%):         R 2,676                  │ │
│ │ Total:             R20,518                  │ │
│ │ ─────────────────────────────────────────── │ │
│ │ Deposit (50%):     R10,259                  │ │
│ │ Balance:           R10,259                  │ │
│ │ ─────────────────────────────────────────── │ │
│ │ Margin:            R 5,198 (29.1%)          │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

Uses the pricing engine from Build 09 but returns the FULL admin breakdown including supplier costs and margins. Updates live as inputs change.

---

## Acceptance Criteria

```
✅ Deck types CRUD with multipliers
✅ Material rates matrix displays all materials × rate types
✅ Rate edit updates supplier cost → auto-calculates customer price
✅ Board directions CRUD with multipliers
✅ Board profiles CRUD with price modifier
✅ Finish options CRUD per material with colour picker
✅ Extras CRUD with pricing model selection
✅ Extras pricing with and without material variants
✅ Calculator constants editable from admin
✅ Markup cascade: global, material override, product override
✅ Effective markup resolves correctly at each level
✅ Pricing simulator shows full admin breakdown including margins
✅ Simulator updates live as inputs change
✅ Margin colour coding (green/yellow/red)
✅ All localized fields have EN/AF inputs
```

---

## Notes for Claude Code

- The configurator admin hub has a LOT of tabs — use shadcn Tabs with a clear visual hierarchy. Consider using sub-routes instead of tabs if it gets too complex.
- The pricing simulator calls the same engine as the public API but uses the admin response format (includes supplier costs + margins). Don't duplicate the logic — use the same function with an `isAdmin` flag.
- The "Recalculate all" button on material rates is important — when admin changes the global markup, they need a one-click way to update all customer prices.
- Extras input_config JSONB is the source of truth for the configurator UI (Build 21) — it defines what inputs to show for each extra (number stepper, range slider, etc.)
