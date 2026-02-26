# Build 23 — Configurator: Step 8 (Quote Summary, Review, Add to Cart)

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 22
> **Context Files:** PROJECT_BRIEF.md §3 (Step 8)

---

## Objective

Build the final configurator step: the full quote summary showing everything the customer configured, with a clear price breakdown and multiple action paths (checkout, save quote, share, book consultation). This step bridges the configurator into the cart & checkout flow (Build 27–29).

---

## Tasks

### 1. Step 8: Quote Summary

**Title:**
- EN: "Here's your deck quote"
- AF: "Hier is jou dek-kwotasie"

Full-page summary layout:

```
┌─ Your Deck Configuration ─────────────────────────────────────────┐
│                                                                     │
│  Deck Type:    Raised Deck                                         │
│  Material:     SA Pine CCA Treated                                 │
│  Dimensions:   4.5m × 3.2m = 14.4 m²                             │
│  Direction:    Lengthwise, Standard profile                        │
│  Finish:       Walnut stain                                        │
│  Delivery:     Full Installation (Western Cape)                    │
│                                                                     │
│  ┌─ Deck Preview ───────────────────────────────────┐              │
│  │  [Canvas thumbnail if designer was used]          │              │
│  │  OR [Rectangle diagram with dimensions]           │              │
│  └──────────────────────────────────────────────────┘              │
│                                                                     │
├─ Price Breakdown ──────────────────────────────────────────────────┤
│                                                                     │
│  Materials                                                          │
│    Deck boards (14.4 m²):                         R  8,467        │
│    Substructure (joists + bearers):                R  3,629        │
│    Fixings (screws, spacers, tape):                R    706        │
│                                                                     │
│  Finish                                                             │
│    Walnut stain:                                   R  1,613        │
│                                                                     │
│  Extras                                                             │
│    Steps: 4 × 1.2m wide                           R  5,712        │
│    Railings: 6.4m (Stainless + Wood)               R 10,752        │
│                                                                     │
│  Installation                                                       │
│    Labour (14.4 m² × raised deck):                 R  6,552        │
│                                                                     │
│  ──────────────────────────────────────────────────────────────    │
│  Subtotal:                                         R 37,431        │
│  Delivery:                                         R      0  FREE │
│  VAT (15%):                                        R  5,615        │
│  ══════════════════════════════════════════════════════════════    │
│  TOTAL:                                            R 43,046        │
│                                                                     │
│  ┌─ Payment ──────────────────────────────────────────────────┐    │
│  │  Deposit (50%):                    R 21,523                │    │
│  │  Balance on completion:            R 21,523                │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─ Material Optimization ───────────────────────────────────┐     │
│  │  ♻ 3 boards sourced from offcuts — 4.2% waste            │     │
│  │  Estimated savings: ~R 750                                 │     │
│  │  (Only shown if designer was used)                        │     │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
├─ Actions ──────────────────────────────────────────────────────────┤
│                                                                     │
│  [🛒 Add to Cart & Checkout]        ← Primary CTA (accent colour) │
│                                                                     │
│  [💾 Save Quote]  [📧 Email Quote]  [📲 Share via WhatsApp]       │
│  [📥 Download PDF Quote]                                           │
│                                                                     │
│  [📞 Book a Consultation Instead]                                  │
│  [🔄 Edit Configuration]              ← Returns to Step 1         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Deck Preview Thumbnail

If the customer used the designer (Build 18–20):
- Show a thumbnail of the canvas with board layout overlay
- Clickable to expand to full-size preview

If quick mode (rectangle only):
- Show a simple rectangle diagram with dimension labels
- Generated as CSS/SVG, not an image

### 3. Edit Configuration Links

Each section of the summary should have a pencil icon that jumps back to the relevant step:
- "Deck Type: Raised Deck" → [✏️ Edit] → Step 1
- "Material: SA Pine CCA" → [✏️ Edit] → Step 2
- "Finish: Walnut stain" → [✏️ Edit] → Step 5
- "Extras: Steps, Railings" → [✏️ Edit] → Step 6
- "Delivery: Installation" → [✏️ Edit] → Step 7

Editing returns to that step with all state preserved. Coming back to Step 8 recalculates the quote.

### 4. Add to Cart

Primary CTA: "Add to Cart & Checkout"

Creates a cart item of type `configurator`:
```typescript
interface ConfiguratorCartItem {
  type: 'configurator'
  id: string                          // nanoid for cart reference
  deck_type: { id, name }
  material_type: { id, name }
  dimensions: { length_m, width_m, area_m2 }
  deck_design: DeckDesign | null      // full designer data if used
  board_direction: { slug, name, multiplier }
  board_profile: { slug, name, modifier }
  finish: { name, colour }
  extras: SelectedExtra[]
  installation_type: string
  delivery_region: string | null
  pricing: DeckQuote                  // full breakdown snapshot
  line_total_cents: number
}
```

After adding to cart:
- Navigate to `/cart` (Build 27)
- Show toast: "Deck added to cart"
- Customer can continue shopping in the materials shop before checkout

### 5. Save Quote

"Save Quote" button:
1. Prompt for email (if not already captured): "Enter your email to save this quote"
2. Generate quote_token (nanoid)
3. INSERT into saved_quotes: quote_data = full wizard state, total_cents
4. Show confirmation: "Quote saved! We've emailed you a link."
5. Send email with shareable link: `/quote/{token}`
6. Quote expires in 30 days (from site_settings)

### 6. Email Quote

"Email Quote" button:
1. Same as Save Quote but explicitly sends the email
2. If already saved, just resend the email
3. Email contains: summary table + link to resume + link to checkout directly

### 7. Share via WhatsApp

"Share via WhatsApp" button:
1. Opens WhatsApp share with pre-filled message:
```
I just designed a deck with The Deck Lab! 🪵

Raised Deck — SA Pine CCA
14.4 m² with steps and stainless steel railings
Total: R43,046

View my quote: https://thedecklab.co.za/quote/{token}
```
2. If quote isn't saved yet, auto-save first (needs a token)

### 8. Download PDF Quote

"Download PDF Quote" button:
1. Generate a client-side PDF (jsPDF) with:
   - The Deck Lab logo + header
   - Quote number (DL-Q-{token})
   - Date
   - Configuration summary
   - Price breakdown table
   - Terms & conditions (admin-configurable from site_settings)
   - Valid for 30 days notice
   - QR code linking to the online quote
2. Download immediately

This is a SIMPLE quote PDF. The full build plan PDF (7 pages) is Build 31 and is gated behind purchase.

### 9. Cross-Sell Prompt

Below the actions, show a subtle cross-sell:

```
┌─ Complete Your Project ──────────────────────────────────┐
│                                                           │
│  🔩 Need extra screws, stain, or cleaning products?      │
│  Browse our materials shop →                             │
│                                                           │
│  [Recommended for your deck:]                            │
│  • Deck Stain — Walnut 5L (R295)                        │
│  • Stainless Screws — Box of 200 (R85)                  │
│  • Board Spacers — Pack of 50 (R45)                     │
│                                                           │
│  [Add All to Cart — R425]  [Browse Shop →]               │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Product suggestions based on the selected material type. Uses product_relations or a simple material → category filter.

### 10. Localization

```json
"configurator": {
  "step8": {
    "title": "Here's your deck quote",
    "subtitle": "Review your configuration and pricing",
    "deckType": "Deck Type",
    "material": "Material",
    "dimensions": "Dimensions",
    "direction": "Board Direction",
    "finish": "Finish",
    "delivery": "Delivery",
    "materials": "Materials",
    "deckBoards": "Deck boards",
    "substructure": "Substructure (joists + bearers)",
    "fixings": "Fixings (screws, spacers, tape)",
    "extras": "Extras",
    "installation": "Installation",
    "labour": "Labour",
    "subtotal": "Subtotal",
    "deliveryFee": "Delivery",
    "vat": "VAT (15%)",
    "total": "Total",
    "deposit": "Deposit",
    "balance": "Balance on completion",
    "addToCart": "Add to Cart & Checkout",
    "saveQuote": "Save Quote",
    "emailQuote": "Email Quote",
    "shareWhatsApp": "Share via WhatsApp",
    "downloadPdf": "Download PDF Quote",
    "bookConsultation": "Book a Consultation Instead",
    "editConfig": "Edit Configuration",
    "optimizationTitle": "Material Optimization",
    "offcutSavings": "{count} boards sourced from offcuts — {percent}% waste",
    "estimatedSavings": "Estimated savings: ~R{amount}",
    "crossSellTitle": "Complete Your Project",
    "crossSellPrompt": "Need extra screws, stain, or cleaning products?",
    "browseShop": "Browse our materials shop",
    "addAllToCart": "Add All to Cart",
    "quoteExpiry": "Quote valid for 30 days",
    "enterEmail": "Enter your email to save this quote",
    "quoteSaved": "Quote saved! We've emailed you a link.",
    "free": "FREE"
  }
}
```

---

## Acceptance Criteria

```
✅ Step 8 shows full configuration summary with all selections
✅ Price breakdown shows every line item (materials, substructure, fixings, finish, extras, labour)
✅ Installation orders show deposit/balance split
✅ Supply orders show delivery fee (or free delivery)
✅ Deck preview thumbnail renders (designer canvas or rectangle diagram)
✅ Edit links jump to correct step and preserve state
✅ "Add to Cart" creates configurator cart item and navigates to /cart
✅ "Save Quote" prompts for email, saves to saved_quotes, sends email
✅ "Email Quote" sends quote summary via email
✅ "Share via WhatsApp" opens WhatsApp with pre-filled message + link
✅ "Download PDF" generates and downloads a quote PDF
✅ Quote PDF includes: logo, quote number, date, config summary, breakdown, terms
✅ Cross-sell section shows material-relevant product suggestions
✅ Optimization panel shows offcut savings (designer mode only)
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: layout stacks vertically, all actions accessible
```

---

## Notes for Claude Code

- The quote PDF (this build) is a SIMPLE 1-page document. Don't confuse it with the build plan PDF (Build 31) which is a 7-page installation document.
- The WhatsApp share uses `https://wa.me/?text=...` — URL-encode the message text.
- The cross-sell products should come from: (1) product_relations for the selected material, or (2) a simple query for products in the same material category that are fixings/finishing.
- The cart item stores a SNAPSHOT of the pricing at the time of adding. If prices change between adding to cart and checkout, the cart should recalculate (Build 27 handles this).
- saved_quotes.quote_data stores the FULL wizard state — enough to reconstruct the entire configurator at any step. This is used when the customer clicks the quote link to resume.
- The quote token URL (`/quote/{token}`) loads the saved quote and presents it like Step 8 with an "Add to Cart" button (Build 28 handles this page).
