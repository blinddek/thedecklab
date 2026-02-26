# Build 30 — Admin: Order Management Pipeline

> **Type:** Frontend + Backend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 29 (orders), Build 11 (admin layout)
> **Context Files:** Build 05 schema (orders, configurator_items, shop_items)
> **Reuse from Blindly:** 🔶 50% — order pipeline pattern similar, stages different

---

## Objective

Build the admin order management system: order list with filters, order detail view, status pipeline, and admin actions (confirm, update status, mark balance paid, add notes). This is how Nortier manages incoming orders from placement through to completion.

---

## Tasks

### 1. Orders List Page

**`src/app/(admin)/admin/orders/page.tsx`**

```
┌─ Orders ─────────────────────────────────────────────────────────────┐
│                                                                       │
│  [All] [New (3)] [In Progress (2)] [Completed (15)] [Cancelled (1)] │
│                                                                       │
│  Search: [________________]  Type: [All ▼]  Date: [This month ▼]   │
│                                                                       │
│  ┌────────┬────────────┬──────────┬──────────┬─────────┬───────────┐│
│  │ Order  │ Customer   │ Type     │ Total    │ Payment │ Status    ││
│  ├────────┼────────────┼──────────┼──────────┼─────────┼───────────┤│
│  │ DL-001 │ Jan Botha  │ 🏗️ Inst. │ R43,046  │ 💰 Dep. │ ⬛ New    ││
│  │ DL-002 │ Marié vdM  │ 🛒 Shop  │ R1,250   │ ✅ Paid │ 📦 Shipped││
│  │ DL-003 │ Peter S.   │ 🔀 Mixed │ R28,800  │ 💰 Dep. │ 🔧 InProg ││
│  └────────┴────────────┴──────────┴──────────┴─────────┴───────────┘│
│                                                                       │
│  Showing 1–20 of 45     [← Prev] [Next →]                           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

**Filter tabs:**
- All
- New (pending confirmation)
- Confirmed / In Progress
- Ready / Shipped / Installed
- Completed
- Cancelled

**Columns:**
- Order number (clickable → detail)
- Customer name
- Type badge: 🏗️ Installation / 🛒 Shop / 🔀 Mixed
- Total (formatted)
- Payment status badge: Pending / Deposit Paid / Paid / Failed / Refunded
- Order status badge with colour coding
- Date (relative: "2 hours ago", "Yesterday")

**Filters:**
- Order type (configurator / shop / mixed)
- Payment status
- Date range
- Search by order number, customer name, email

**Sorting:** Date (newest default), total, customer name

### 2. Order Detail Page

**`src/app/(admin)/admin/orders/[id]/page.tsx`**

```
┌─ Order DL-2026-0001 ────────────────────────────────────────────────┐
│                                                                       │
│  Status: [⬛ New ▼]  → [Confirm Order]                               │
│                                                                       │
├─ Customer ───────────────────────────────────────────────────────────┤
│  Name:    Jan Botha                                                  │
│  Email:   jan@example.com  [📧 Send email]                           │
│  Phone:   082 123 4567     [📱 WhatsApp]                             │
│  Address: 12 Main Road, Stellenbosch, 7600                          │
│  Notes:   "Gate code is 1234, access from the back garden"          │
│                                                                       │
├─ Configured Deck ────────────────────────────────────────────────────┤
│                                                                       │
│  Raised Deck — SA Pine CCA                                          │
│  4.5m × 3.2m (14.4 m²) · Lengthwise · Walnut stain                │
│  Full Installation                                                    │
│                                                                       │
│  Extras: 4 steps (1.2m), Railings 6.4m (Stainless + Wood)          │
│                                                                       │
│  [View deck design →]  (if designer was used)                        │
│  [Generate build plan PDF →]  (Build 31)                             │
│                                                                       │
│  Materials:     R 8,467    (cost: R 6,048  | margin: R 2,419)       │
│  Substructure:  R 3,629    (cost: R 2,592  | margin: R 1,037)       │
│  Fixings:       R   706    (cost: R   504  | margin: R   202)       │
│  Staining:      R 1,613    (cost: R 1,152  | margin: R   461)       │
│  Steps:         R 5,712    (cost: R 4,080  | margin: R 1,632)       │
│  Railings:      R10,752    (cost: R 8,064  | margin: R 2,688)       │
│  Labour:        R 6,552    (cost: R 6,552  | margin: R     0)       │
│  ─────────────────────────────────────────────────────────────────   │
│  Total margin:  R 8,439 (22.0%)                                     │
│                                                                       │
├─ Shop Items ─────────────────────────────────────────────────────────┤
│                                                                       │
│  2× Walnut Stain 5L (DL-ST-WAL-5L)            R590.00               │
│  1× 50mm Stainless Screws (DL-FX-SS50-200)    R 85.00               │
│                                                                       │
├─ Payment ────────────────────────────────────────────────────────────┤
│                                                                       │
│  Subtotal:     R47,921.00                                            │
│  Delivery:     R      0.00  (Installation — included)               │
│  VAT (15%):    R 7,188.15                                            │
│  Total:        R55,109.15                                            │
│                                                                       │
│  Deposit (50%): R27,555  ✅ Paid (20 Feb 2026 via Paystack)         │
│  Balance:       R27,555  ⏳ Pending (invoice on completion)          │
│                                                                       │
│  [Mark Balance Paid]   [Send Invoice]   [Refund Deposit]             │
│                                                                       │
├─ Order Timeline ─────────────────────────────────────────────────────┤
│                                                                       │
│  20 Feb 14:23  Order placed                                          │
│  20 Feb 14:24  Deposit payment received — Paystack ref: PAY_xxxxx   │
│  20 Feb 15:00  Admin confirmed order                                 │
│  21 Feb 09:00  Materials ordered from supplier                       │
│  ...                                                                  │
│                                                                       │
├─ Admin Notes ────────────────────────────────────────────────────────┤
│                                                                       │
│  [Add note: _________________________ ] [Save]                       │
│                                                                       │
│  21 Feb — "Supplier confirms pine stock available, 3-day lead time" │
│  20 Feb — "Customer confirmed access from Kerk Street side"         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 3. Order Status Pipeline

Admin can move orders through statuses:

| Status | Description | Triggers |
|--------|-------------|----------|
| new | Just placed, payment received | Auto on payment |
| confirmed | Admin reviewed and accepted | Admin action |
| materials_ordered | Supplier order placed | Admin action |
| in_progress | Installation underway | Admin action |
| ready_for_delivery | Materials packed (supply orders) | Admin action |
| shipped | Delivery dispatched | Admin action |
| delivered | Customer received materials | Admin action |
| installation_scheduled | Install date confirmed | Admin action |
| installed | Installation complete | Admin action |
| completed | Final handover, balance paid | Admin action |
| cancelled | Order cancelled | Admin action + reason |

**Status change actions:**
- Dropdown selector → "Update Status"
- Some transitions trigger emails (shipped → tracking notification, installed → balance invoice)
- Status change logged to activity_log + order timeline

### 4. Payment Actions

**Mark Balance Paid:**
- For installation orders with deposit_paid = true
- Admin enters: payment method (EFT/cash/Paystack), reference, date
- Sets balance_paid = true, payment_status = 'paid'
- Sends receipt email

**Send Invoice:**
- Generates a PDF invoice for the balance amount
- Emails to customer
- Bank details included for EFT payment

**Refund:**
- Admin enters reason
- Triggers Paystack refund API (if original was Paystack)
- Updates payment_status to 'refunded'

### 5. Margin Display (Admin Only)

The order detail shows full margin data:
- Per line item: customer price, cost price, margin (Rands + %)
- Total margin: sum of all margins / total × 100%
- Colour-coded: green (>30%), amber (20–30%), red (<20%)

This uses the supplier_cost_cents and cost_price_cents fields that are NEVER shown publicly.

### 6. Order Notifications

Automated emails on status changes:

| Status Change | Email to Customer |
|--------------|-------------------|
| confirmed | "Your order has been confirmed" |
| shipped | "Your order has been dispatched" + tracking (if available) |
| delivered | "Your order has been delivered" |
| installation_scheduled | "Installation confirmed for {date}" |
| installed | "Installation complete — balance invoice attached" |
| completed | "Thank you — your order is complete" |

### 7. Leads Management

**`src/app/(admin)/admin/leads/page.tsx`**

Tabbed view for three lead types:

**Consultation Requests tab:**
| Date | Customer | Phone | Deck Interest | Area | Status | Actions |
|------|----------|-------|---------------|------|--------|---------|
| 20 Feb | Anna K. | 083... | Pool Deck | ~20m² | New | Schedule / Notes |

**Sample Requests tab:**
| Date | Customer | Material | Status | Actions |
|------|----------|----------|--------|---------|
| 19 Feb | Pieter L. | Balau | New | Mark Sent / Notes |

**Contact Submissions tab:**
| Date | Name | Email | Message | Status | Actions |
|------|------|-------|---------|--------|---------|

Each lead type: status update, admin notes, activity log.

---

## Acceptance Criteria

```
✅ Orders list with filter tabs, search, and sorting
✅ Order type/status/payment badges with colour coding
✅ Order detail shows full breakdown with margin data
✅ Status pipeline: admin can advance through all statuses
✅ Status changes logged to timeline
✅ Mark Balance Paid works for installation orders
✅ Balance paid triggers receipt email
✅ Send Invoice generates PDF and emails customer
✅ Admin notes: add, view, timestamped
✅ Order timeline shows all events chronologically
✅ Configured deck shows full breakdown with supplier costs
✅ "View deck design" links to designer data (if available)
✅ "Generate build plan PDF" button (wires to Build 31)
✅ Leads management: consultations, samples, contacts
✅ Lead status updates work per type
✅ Automated emails send on key status changes
✅ Pagination works on orders list
```

---

## Notes for Claude Code

- The margin display is the key admin insight — Nortier needs to see profit per order at a glance. Make the total margin prominent.
- Order timeline is a simple reverse-chronological list stored as JSONB in the order or as activity_log entries filtered by entity_id.
- Status transitions should be validated: can't go from 'new' to 'completed' directly. Define allowed transitions.
- The "Generate build plan PDF" button calls Build 31's API. It should be greyed out if the order used quick mode (no designer data).
- Leads management is simpler than order management — it's just status tracking + notes. No payment, no pipeline.
