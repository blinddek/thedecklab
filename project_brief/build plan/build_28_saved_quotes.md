# Build 28 — Saved Quotes & Quote Resume

> **Type:** Frontend + Backend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 23 (save quote), Build 27 (cart)
> **Context Files:** Build 06 schema (saved_quotes)

---

## Objective

Build the quote resume page (`/quote/{token}`) that loads a saved configurator quote and lets the customer pick up where they left off: review, edit, or add to cart. Plus automated email follow-ups for unconverted quotes.

---

## Tasks

### 1. Quote Resume Page

**`src/app/(public)/quote/[token]/page.tsx`**

Fetch saved_quote by token. If found and not expired:

```
┌─ Your Saved Quote ───────────────────────────────────────────────────┐
│                                                                       │
│  Quote: DL-Q-{token}                                                 │
│  Saved: 15 February 2026                                             │
│  Expires: 17 March 2026 (30 days remaining)                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────────┐│
│  │  [Same layout as Step 8 quote summary]                           ││
│  │  Deck type, material, dimensions, extras, pricing breakdown      ││
│  └──────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  [🛒 Add to Cart & Checkout]                                         │
│  [✏️ Edit Configuration]        → loads wizard at Step 1 with state   │
│  [📥 Download PDF Quote]                                              │
│  [📲 Share via WhatsApp]                                              │
│                                                                       │
│  ⚠️ Prices may have changed since this quote was saved.              │
│     Current total: R43,046 (was R42,800 when saved)                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Price recalculation:**
- On load, re-run the pricing engine with the saved configuration
- Compare new total to saved total_cents
- If different: show a notice with both prices
- Use the CURRENT price for checkout (not the saved price)

### 2. Quote States

| State | Display |
|-------|---------|
| Valid | Full summary + actions |
| Expired | "This quote has expired. Start a new configuration →" |
| Converted | "This quote has been ordered! View your order →" (link to order) |
| Not found | 404 page |

### 3. Edit Configuration from Quote

"Edit Configuration" reconstructs the wizard:
1. Parse saved_quotes.quote_data JSONB → ConfiguratorState
2. Navigate to `/configure` with state pre-loaded
3. Customer lands on Step 1 but can jump to any step
4. All selections pre-filled from the saved state

### 4. Email Follow-Up System

Automated emails for unconverted quotes. Uses Resend (Build 01 dependency).

**Email schedule (from saved_quotes columns):**

| Timing | Column | Subject |
|--------|--------|---------|
| 24 hours | email_sent_24h | "Your deck quote is waiting — R{total}" |
| 72 hours | email_sent_72h | "Still thinking about your deck? Here's what you designed" |
| 7 days | email_sent_7d | "Your quote expires soon — don't miss out" |

**Email content:**
- Quote summary (deck type, material, area, total)
- Thumbnail of the configuration (if designer was used)
- "View Your Quote" button → `/quote/{token}`
- "Need help deciding?" → consultation booking link
- Unsubscribe / "I already ordered elsewhere" opt-out

**Trigger:**
- Cron job or Supabase Edge Function runs daily
- Queries saved_quotes where:
  - converted_to_order_id IS NULL
  - expires_at > now()
  - email_sent_X = false
  - created_at + X hours < now()
- Sends email, sets flag to true

### 5. Quote Email Template

**`src/lib/email/templates/quote-reminder.tsx`**

React Email template:
- The Deck Lab header/logo
- "Your deck quote is ready"
- Summary card: deck type + material + area + total
- Primary CTA: "View My Quote" button
- Secondary: "Book a Consultation" link
- Footer: "This quote expires on {date}. Prices may change."

### 6. API Routes

```
GET /api/quotes/[token]
  Returns: saved quote data + recalculated current pricing
  Public (no auth — token is the auth)

POST /api/quotes/[token]/convert
  Adds quote to cart and redirects to checkout
  Sets converted_to_order_id after order creation

POST /api/cron/quote-reminders
  Protected endpoint for scheduled email sending
  Called by Supabase Edge Function or external cron
```

### 7. Localization

```json
"quote": {
  "title": "Your Saved Quote",
  "quoteNumber": "Quote",
  "saved": "Saved",
  "expires": "Expires",
  "daysRemaining": "{days} days remaining",
  "addToCart": "Add to Cart & Checkout",
  "editConfig": "Edit Configuration",
  "downloadPdf": "Download PDF Quote",
  "shareWhatsApp": "Share via WhatsApp",
  "priceChanged": "Prices may have changed since this quote was saved.",
  "currentTotal": "Current total: {current} (was {saved} when saved)",
  "expired": "This quote has expired.",
  "startNew": "Start a new configuration",
  "converted": "This quote has been ordered!",
  "viewOrder": "View your order",
  "notFound": "Quote not found"
}
```

---

## Acceptance Criteria

```
✅ /quote/{token} loads saved quote and displays full summary
✅ Price recalculation runs on load, difference shown if changed
✅ "Add to Cart" adds configuration to cart with CURRENT pricing
✅ "Edit Configuration" loads wizard with saved state
✅ Expired quotes show expiry message
✅ Converted quotes show order link
✅ Invalid tokens show 404
✅ 24h, 72h, 7d follow-up emails send correctly
✅ Email flags prevent duplicate sends
✅ Email template renders correctly (React Email)
✅ Email "View My Quote" button links to correct URL
✅ Quote PDF download works from resume page
✅ WhatsApp share works from resume page
✅ All text localized (EN/AF)
```

---

## Notes for Claude Code

- The quote token is a 12-character nanoid — it's the only auth for accessing the quote. This is intentional (no login required to view a quote).
- Price recalculation is important because quotes last 30 days — prices absolutely can change. Always show current pricing, with a notice if it differs from when saved.
- The email follow-up system is a simple cron pattern. For v1, a daily Supabase Edge Function or a manual API endpoint is fine. Don't over-engineer this.
- Quote emails should be concise — the goal is to get the customer back to the quote page. Don't include the full breakdown in the email.
- The converted_to_order_id column links a quote to its resulting order — useful for analytics and for showing "Already ordered" state.
