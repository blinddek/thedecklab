# Build 32 — Nortier Install Workflow

> **Type:** Full-stack
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 31 (build plan PDF), Build 30 (admin orders)
> **Context Files:** PROJECT_BRIEF.md §3 (Installation flow)

---

## Objective

Build the Nortier-specific installation workflow that bridges the gap between order confirmation and completed installation. This is the internal ops pipeline: scheduling site visits, confirming installation dates, generating supplier orders, tracking materials, and managing the balance payment.

---

## Tasks

### 1. Installation Order Pipeline (Extended Statuses)

For installation orders, the order_status progresses through:

```
new → confirmed → materials_ordered → in_progress → installation_scheduled → installed → completed
```

Each status has admin actions and optional customer notifications.

### 2. Installation Dashboard Widget

Add to the admin dashboard (Build 11):

```
┌─ Installation Pipeline ──────────────────────────────────────────┐
│                                                                   │
│  📋 Awaiting Confirmation:  2                                    │
│  📦 Materials Ordered:       1                                    │
│  📅 Scheduled:               3  (next: 25 Feb)                   │
│  🔧 In Progress:             1                                    │
│  ✅ Awaiting Balance:        2                                    │
│                                                                   │
│  [View Installation Orders →]                                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### 3. Scheduling System

When admin moves an order to "installation_scheduled":
- Date picker: select installation start date
- Estimated duration: number input (days)
- Assign installer notes: text field
- Auto-sends email to customer: "Your installation is confirmed for {date}"

Store in order record:
```typescript
{
  scheduled_installation_date: Date,
  estimated_duration_days: number,
  installer_notes: string,
}
```

### 4. Supplier Order Generation

When admin moves to "materials_ordered":
- Generate a supplier purchase order summary from the configurator_item data
- Show: all materials needed with stock lengths, quantities, supplier cost totals
- "Copy to clipboard" for emailing to supplier
- Or "Download as CSV" for supplier upload
- Track supplier order reference in admin notes

### 5. Balance Invoice

When installation is marked "installed":
- Auto-generate a balance invoice PDF:
  - Order number, customer details
  - Original total, deposit received, balance due
  - Bank details for EFT payment
  - Payment due within 7 days
- Email to customer: "Installation complete — balance of R{amount} due"
- Admin can manually "Mark Balance Paid" (from Build 30)

### 6. Completion Checklist

Before marking "completed", admin sees a checklist:
```
□ Installation physically complete
□ Customer signed off (verbal or written)
□ Balance payment received
□ Final photos uploaded to gallery
□ Build plan PDF sent to customer
```

All boxes must be checked to mark completed. Override available for admin.

### 7. Customer Status Page

**`src/app/(public)/order/[id]/page.tsx`**

After login or with order email + number verification:

```
┌─ Order DL-2026-0001 ─────────────────────────────────────────────┐
│                                                                   │
│  ✅ Order confirmed             20 Feb 2026                      │
│  ✅ Materials ordered            21 Feb 2026                      │
│  ✅ Installation scheduled       25 Feb 2026                      │
│  ⏳ Installation in progress                                     │
│  ○  Installation complete                                        │
│  ○  Final handover                                               │
│                                                                   │
│  Your deck is being installed! Estimated completion: 27 Feb.     │
│                                                                   │
│  Questions? Contact us at info@thedecklab.co.za                  │
│                                                                   │
│  [📥 Download Build Plan]                                         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

Access: customer receives a link in their order emails. No login required — order ID + email verification (or a secret token in the URL).

---

## Acceptance Criteria

```
✅ Installation dashboard widget shows pipeline counts
✅ Scheduling: admin sets date, customer receives email
✅ Supplier order summary generated from configurator_item data
✅ Supplier CSV downloadable
✅ Balance invoice PDF generated automatically on "installed"
✅ Balance invoice emailed to customer
✅ Completion checklist enforced before marking "completed"
✅ Customer status page shows progress timeline
✅ Customer can download build plan PDF from status page
✅ All status change emails send correctly
```

---

## Notes for Claude Code

- This build is lightweight but ties together many previous builds. Most of the UI is within the existing admin orders page (Build 30) — this just adds the installation-specific workflows.
- The supplier order summary is NOT a formal purchase order system — it's a formatted summary that Nortier copies and sends to their supplier manually. Don't over-build this.
- The customer status page access pattern: embed a token in the order confirmation email URL. No auth needed — the token is the auth (same as quote tokens).
- Balance invoice: keep it simple. A 1-page PDF with amount due + bank details. Not a full accounting system.
