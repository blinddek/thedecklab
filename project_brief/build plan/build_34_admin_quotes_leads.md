# Build 34 — Admin: Quotes & Leads Dashboard

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 28 (saved quotes), Build 11 (admin layout)
> **Context Files:** Build 06 schema (saved_quotes, consultation_requests, sample_requests)
> **Reuse from Blindly:** ✅ 70% — leads management very similar

---

## Objective

Build admin pages for managing saved quotes (abandoned carts that saved their config), consultation requests, and sample requests. This complements the order management in Build 30 — orders are paying customers, leads are potential customers.

---

## Tasks

### 1. Quotes Management Page

**`src/app/(admin)/admin/quotes/page.tsx`**

| Quote # | Customer | Date | Total | Status | Emails Sent | Actions |
|---------|----------|------|-------|--------|-------------|---------|
| DL-Q-abc123 | jan@ex.com | 19 Feb | R43,046 | Active | 24h ✅ 72h ✅ 7d ❌ | View / Resend |
| DL-Q-def456 | anna@ex.com | 10 Feb | R18,200 | Expired | 24h ✅ 72h ✅ 7d ✅ | View |
| DL-Q-ghi789 | pieter@ex.com | 15 Feb | R28,800 | Converted | — | View Order |

**Filter tabs:** Active / Expired / Converted / All

**Detail view (click row):**
- Full configuration summary (same as public quote page)
- Email follow-up status (24h/72h/7d sent?)
- Conversion tracking: did they order? When?
- "Resend Quote Email" button
- "Mark as Contacted" (admin called them)
- Admin notes

**Metrics bar:**
- Total saved quotes this month
- Conversion rate (saved → ordered)
- Average quote value
- Quotes expiring this week

### 2. Consultation Requests Page

**`src/app/(admin)/admin/leads/consultations/page.tsx`**

(Or a tab within `/admin/leads`)

| Date | Customer | Phone | Deck Type | Area | Preferred Date | Status | Actions |
|------|----------|-------|-----------|------|---------------|--------|---------|
| 20 Feb | Jan B. | 082 123 4567 | Pool Deck | ~20m² | 25 Feb | New | Schedule / Notes |

**Status pipeline:** New → Contacted → Scheduled → Visited → Quoted → Completed / Cancelled

**Actions:**
- Change status (dropdown)
- Add scheduled_at date (when site visit is booked)
- Add admin notes
- Quick actions: "Call" (tel: link), "WhatsApp" (wa.me link)
- Convert to order (once quoted → create configurator order manually)

### 3. Sample Requests Page

**`src/app/(admin)/admin/leads/samples/page.tsx`**

| Date | Customer | Email | Material | Address | Status | Actions |
|------|----------|-------|----------|---------|--------|---------|
| 19 Feb | Pieter L. | pieter@ex.com | Balau | 12 Main Rd, Stellenbosch | New | Mark Sent |

**Status pipeline:** New → Sent → Delivered

**Actions:**
- Mark as sent (date auto-filled)
- Mark as delivered
- Admin notes
- "Convert to Sale" — link to their email in order records

### 4. Contact Submissions Page

**`src/app/(admin)/admin/leads/contacts/page.tsx`**

| Date | Name | Email | Message | Status | Actions |
|------|------|-------|---------|--------|---------|
| 18 Feb | Anri V. | anri@ex.com | "I need a quote for..." | New | Reply / Archive |

**Status:** New → Replied → Archived

### 5. Leads Overview Tab

**`src/app/(admin)/admin/leads/page.tsx`**

Dashboard showing all lead types:

```
┌─ Leads Overview ─────────────────────────────────────────────────────┐
│                                                                       │
│  [Consultations (5)] [Samples (3)] [Contacts (2)]                    │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  📊 This Month                                                │   │
│  │                                                                │   │
│  │  New leads:          10                                       │   │
│  │  Consultations:       5  (2 scheduled, 1 completed)           │   │
│  │  Samples sent:        3                                       │   │
│  │  Contacts:            2  (1 replied)                          │   │
│  │  Conversion rate:    18% (leads → orders)                     │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Acceptance Criteria

```
✅ Quotes list shows all saved quotes with status and email tracking
✅ Quote detail shows full configuration summary
✅ Conversion tracking links quotes to resulting orders
✅ "Resend Quote Email" works
✅ Quote metrics (count, conversion rate, avg value)
✅ Consultation requests with status pipeline
✅ Consultation scheduling with date picker
✅ Sample requests with sent/delivered tracking
✅ Contact submissions with reply/archive status
✅ Leads overview with metrics
✅ Quick actions: call (tel:), WhatsApp (wa.me)
✅ Admin notes on all lead types
✅ Status changes logged to activity_log
✅ Pagination on all lists
```

---

## Notes for Claude Code

- Leads management is straightforward CRUD + status pipelines. Reuse the patterns from Blindly's swatch/measure request management.
- The quote conversion tracking is valuable business intelligence — how many people save quotes vs actually order? This metric helps Nortier understand their funnel.
- Quick actions (tel:, wa.me) are just HTML links — no integration needed. But they save admin time.
- The leads overview metrics are simple count queries. Don't over-engineer — aggregate queries on the relevant tables.
