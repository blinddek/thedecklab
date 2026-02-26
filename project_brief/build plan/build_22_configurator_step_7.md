# Build 22 — Configurator: Step 7 (Installation Preference)

> **Type:** Frontend
> **Estimated Time:** 1 hr
> **Dependencies:** Build 21
> **Context Files:** PROJECT_BRIEF.md §3 (Step 7)

---

## Objective

Build Step 7 where the customer chooses how they want to proceed: full installation (WC only), supply with delivery, supply with collection, or book a consultation. This step determines the payment flow (deposit vs full), delivery fees, and whether labour is included.

---

## Tasks

### 1. Step 7: Installation Preference

**Question:**
- EN: "How would you like to proceed?"
- AF: "Hoe wil jy voortgaan?"

Three main options as large visual cards:

```
+----------------------------------+  +----------------------------------+  +----------------------------------+
|  🏗️  Full Installation           |  |  🚚  Supply & Deliver            |  |  📦  Supply & Collect            |
|                                  |  |                                  |  |                                  |
|  We build it for you.            |  |  We supply all materials         |  |  Collect materials from our      |
|  Design → materials →            |  |  delivered to your door.         |  |  warehouse. You or your          |
|  installation → handover.        |  |  You or your contractor          |  |  contractor installs.            |
|                                  |  |  installs.                       |  |                                  |
|  ✅ Labour included              |  |  ✅ National delivery            |  |  ✅ No delivery fee              |
|  ✅ Build plan provided          |  |  ✅ Build plan included           |  |  ✅ Build plan included           |
|  ⚠️ Western Cape only            |  |  📍 Delivery fee applies         |  |  📍 Collection point: [address]  |
|                                  |  |                                  |  |                                  |
|  💰 50% deposit, balance on      |  |  💰 Full payment at checkout     |  |  💰 Full payment at checkout     |
|     completion                   |  |                                  |  |                                  |
|                                  |  |                                  |  |                                  |
|  Price includes:                 |  |  Price includes:                 |  |  Price includes:                 |
|  Materials + Labour + Delivery   |  |  Materials + Delivery            |  |  Materials only                  |
|  = R39,452                       |  |  = R23,173                       |  |  = R21,673                       |
+----------------------------------+  +----------------------------------+  +----------------------------------+
```

**Card behaviour:**
- Single select (radio)
- Each card shows live total for that option (recalculated from pricing engine)
- Installation card: total includes labour, delivery free (installer brings materials)
- Supply & Deliver card: no labour, adds delivery fee by region
- Supply & Collect card: no labour, no delivery

### 2. Regional Delivery Selection

When "Supply & Deliver" is selected, show a sub-selection:

```
Delivery region:
  (●) Western Cape — R1,000 delivery
  ( ) National — R2,500 delivery
  ( ) Not sure? Enter your postal code: [____]
```

Postal code lookup: simple mapping of WC postal codes (7000–7999 range) vs national. Or just let the user pick.

Free delivery threshold: if order exceeds site_settings.free_delivery_threshold_cents, show:
```
✅ Free delivery — your order qualifies!
```

### 3. Installation Availability Check

When "Full Installation" is selected:
- Check if deck type + area is within Nortier's service capability
- If area > 100m²: show note "Decks over 100m² may require a site visit before final pricing. We'll confirm within 24 hours."
- If deck is complex (from designer, not quick mode): note "Build plan will be generated for our installation team"
- Show deposit split clearly: "Deposit: R19,726 | Balance on completion: R19,726"

### 4. Consultation Fallback (Fourth Option)

Below the three cards, a text link:

```
Not sure which option is right for you?
→ Book a free consultation — we'll visit your property, measure, and provide expert advice.
```

Clicking opens the consultation request modal (same as Build 18). After submission:
- "Consultation requested" confirmation
- Customer can still continue with a supply-only quote
- Or exit the wizard (quote auto-saved)

### 5. Live Quote Update

Selecting an installation preference immediately recalculates the quote:

| Selection | Labour | Delivery | Deposit | Total Change |
|-----------|--------|----------|---------|-------------|
| Installation | ✅ adds | ✅ free | 50% | Highest total |
| Supply & Deliver (WC) | ❌ | R1,000 | No | Medium total |
| Supply & Deliver (National) | ❌ | R2,500 | No | Medium-high |
| Supply & Collect | ❌ | R0 | No | Lowest total |

The live quote sidebar (from Build 21) updates immediately. Show the price difference clearly — customers should understand what they're paying for.

### 6. Wizard State Update

On selection:
```typescript
state.installation_type = 'installation' | 'supply_deliver' | 'supply_collect'
state.delivery_region = 'western_cape' | 'national' | null  // only for supply_deliver
```

### 7. Localization

```json
"configurator": {
  "step7": {
    "title": "How would you like to proceed?",
    "subtitle": "Choose installation, delivery, or collection",
    "installation": {
      "title": "Full Installation",
      "description": "We build it for you. Design → materials → installation → handover.",
      "wcOnly": "Western Cape only",
      "depositNote": "50% deposit, balance on completion",
      "labourIncluded": "Labour included",
      "buildPlanIncluded": "Build plan provided"
    },
    "supplyDeliver": {
      "title": "Supply & Deliver",
      "description": "We supply all materials delivered to your door.",
      "deliveryFee": "Delivery fee applies",
      "nationalDelivery": "National delivery available",
      "freeDelivery": "Free delivery — your order qualifies!"
    },
    "supplyCollect": {
      "title": "Supply & Collect",
      "description": "Collect materials from our warehouse.",
      "noDeliveryFee": "No delivery fee",
      "collectionPoint": "Collection point"
    },
    "consultation": {
      "prompt": "Not sure which option is right for you?",
      "cta": "Book a free consultation"
    },
    "region": {
      "label": "Delivery region",
      "westernCape": "Western Cape",
      "national": "National (rest of SA)"
    }
  }
}
```

---

## Acceptance Criteria

```
✅ Step 7 shows three option cards with live pricing per option
✅ Installation card shows deposit split (50/50)
✅ Installation card shows "Western Cape only" restriction
✅ Supply & Deliver shows regional delivery fee selector
✅ Free delivery threshold applies correctly
✅ Supply & Collect shows R0 delivery
✅ Live quote sidebar updates immediately on selection change
✅ Price difference between options is clear
✅ Consultation fallback link opens consultation request modal
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: cards stack vertically, prices visible
✅ Back navigation preserves selection
```

---

## Notes for Claude Code

- The three cards should show DIFFERENT totals — this is the moment the customer understands the value of installation vs DIY. Make the price difference prominent.
- Installation delivery is R0 because the install team brings materials. Don't show a delivery line at all for installation.
- The postal code → region mapping can be simple: WC = 7000–7999, everything else = national. Or hard-code a list of WC town names.
- The deposit fields on the order (deposit_percent, deposit_cents, balance_cents) are only populated when installation_type = 'installation'.
- Build plan PDF (Build 31) is available for ALL options — not just installation. DIY customers get it too (it's a selling point). But only if they used the designer (not quick mode).
