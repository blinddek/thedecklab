# Build 36 — Public: About, Contact, FAQ, Gallery

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 35 (layout)
> **Context Files:** PROJECT_BRIEF.md, YOROS_I18N_DARKMODE_STANDARD.md
> **Reuse from Blindly:** ✅ 80% — same page patterns

---

## Objective

Build the remaining public pages: About, Contact (with form), FAQ, and Gallery. These are standard content pages that establish credibility and capture leads.

---

## Tasks

### 1. About Page

**`src/app/(public)/about/page.tsx`**

```
┌─ About The Deck Lab ─────────────────────────────────────────────┐
│                                                                   │
│  [Hero image: workshop or completed deck]                        │
│                                                                   │
│  Headline: "Craftsmanship meets technology"                      │
│  Body: Company story, values, approach.                          │
│  Placeholder text — Nortier to provide real copy.                │
│                                                                   │
│  ┌─ Why Choose Us ──────────────────────────────────────────┐    │
│  │  ✓ Instant online quotes                                 │    │
│  │  ✓ Premium SA and imported materials                      │    │
│  │  ✓ Professional installation (Western Cape)               │    │
│  │  ✓ Materials shipped nationally                           │    │
│  │  ✓ Interactive deck designer                              │    │
│  │  ✓ Free materials calculator                              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Service Areas:                                                   │
│  🏗️ Installation: Western Cape                                   │
│  🚚 Materials delivery: All of South Africa                      │
│                                                                   │
│  [Configure Your Deck →]   [Browse Materials →]                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

Content from pages table or hardcoded placeholders. Localized.

### 2. Contact Page

**`src/app/(public)/contact/page.tsx`**

```
┌─ Contact Us ─────────────────────────────────────────────────────┐
│                                                                   │
│  ┌─ Contact Form ──────────┐  ┌─ Contact Info ─────────────┐    │
│  │                          │  │                             │    │
│  │  Name:    [___________]  │  │  📧 info@thedecklab.co.za  │    │
│  │  Email:   [___________]  │  │  📱 082 XXX XXXX           │    │
│  │  Phone:   [___________]  │  │  💬 WhatsApp               │    │
│  │  Subject: [___________]  │  │                             │    │
│  │  Message:                │  │  📍 Stellenbosch,           │    │
│  │  [                    ]  │  │     Western Cape            │    │
│  │  [                    ]  │  │                             │    │
│  │  [                    ]  │  │  Hours:                     │    │
│  │                          │  │  Mon–Fri: 08:00–17:00      │    │
│  │  [Send Message]          │  │  Sat: 08:00–13:00          │    │
│  │                          │  │                             │    │
│  └──────────────────────────┘  └─────────────────────────────┘    │
│                                                                   │
│  Or book a free consultation:                                    │
│  [Book Site Visit →]                                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- Form submits to contact_submissions table
- Validation: name, email, message required
- Sends notification email to admin (contact_email from site_settings)
- Success toast: "Message sent! We'll get back to you within 24 hours."
- Contact info from site_settings
- WhatsApp link: `https://wa.me/27XXXXXXXXX`
- "Book Site Visit" links to consultation request flow

### 3. FAQ Page

**`src/app/(public)/faq/page.tsx`**

Accordion-style FAQ:

```
┌─ Frequently Asked Questions ─────────────────────────────────────┐
│                                                                   │
│  ┌─ General ─────────────────────────────────────────────────┐   │
│  │  ▸ What areas do you service?                              │   │
│  │  ▸ How long does installation take?                        │   │
│  │  ▸ Do I need a building plan approval for a deck?          │   │
│  │  ▸ What warranty do you offer?                             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Materials ───────────────────────────────────────────────┐   │
│  │  ▸ What's the difference between pine and hardwood?        │   │
│  │  ▸ Which material is best for pool decks?                  │   │
│  │  ▸ How long does treated pine last?                        │   │
│  │  ▸ Does composite decking fade?                            │   │
│  │  ▸ Can I request a free material sample?                   │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Pricing & Orders ───────────────────────────────────────┐    │
│  │  ▸ How does the pricing work?                              │   │
│  │  ▸ What does the 50% deposit cover?                        │   │
│  │  ▸ Can I get a quote without committing?                   │   │
│  │  ▸ Do you offer bulk discounts?                            │   │
│  │  ▸ Do you deliver nationally?                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ Installation ────────────────────────────────────────────┐   │
│  │  ▸ What's included in the installation service?            │   │
│  │  ▸ How do I prepare my site for installation?              │   │
│  │  ▸ What happens if it rains during installation?           │   │
│  │  ▸ Do you remove the old deck?                             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─ DIY & Calculator ───────────────────────────────────────┐    │
│  │  ▸ How many deck boards do I need?                         │   │
│  │  ▸ What spacing should I use between boards?               │   │
│  │  ▸ What joist size and spacing is correct?                 │   │
│  │  ▸ How do I maintain my deck?                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Can't find your answer?                                         │
│  [Contact Us →]   [Book a Consultation →]                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- FAQ content from locale files (localized EN/AF)
- shadcn Accordion component
- Grouped by category
- SEO: FAQ structured data (JSON-LD FAQPage schema)
- Answers can link to relevant pages (calculator, configurator, products)

### 4. Gallery Page

**`src/app/(public)/gallery/page.tsx`**

```
┌─ Gallery ────────────────────────────────────────────────────────┐
│                                                                   │
│  [Filter: All] [Pine] [Hardwood] [Composite] [Pool] [Raised]   │
│                                                                   │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │     │ │     │ │     │ │     │                               │
│  │     │ │     │ │     │ │     │                               │
│  └─────┘ └─────┘ └─────┘ └─────┘                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                               │
│  │     │ │     │ │     │ │     │                               │
│  │     │ │     │ │     │ │     │                               │
│  └─────┘ └─────┘ └─────┘ └─────┘                               │
│                                                                   │
│  Lightbox on click: full-size image + caption                    │
│  Caption: material type, deck type, location (optional)          │
│                                                                   │
│  Ready to design your deck?                                      │
│  [Configure Your Deck →]                                          │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

- Images from media table tagged with folder = 'gallery'
- Filter by tag (material type, deck type)
- Masonry or grid layout
- Lightbox: click image → full-size with caption
- Placeholder images until real project photos available
- CTA at bottom

### 5. Privacy Policy & Terms Pages

**`src/app/(public)/privacy/page.tsx`**
**`src/app/(public)/terms/page.tsx`**

- Content from pages table (admin-editable) or hardcoded placeholders
- Simple markdown/text rendering
- Required for legal compliance and checkout terms checkbox

---

## Acceptance Criteria

```
✅ About page renders with company info and "Why Choose Us"
✅ Contact form submits to contact_submissions table
✅ Contact form sends admin notification email
✅ Contact page shows info from site_settings
✅ FAQ page renders with accordion groups
✅ FAQ structured data (JSON-LD) present
✅ Gallery displays images in grid/masonry layout
✅ Gallery lightbox works on click
✅ Gallery filter by material/deck type
✅ Privacy Policy and Terms pages render
✅ All pages localized (EN/AF)
✅ Dark mode renders correctly on all pages
✅ Mobile responsive on all pages
✅ CTAs link to configurator and shop
```

---

## Notes for Claude Code

- FAQ content is a strong SEO asset. Write comprehensive answers (2-3 sentences each). Include technical details from CALCULATOR_REFERENCE.md for the DIY questions.
- Gallery images: for now, use placeholder images. Tag them with metadata (material_type, deck_type) in the media table so filtering works when real images are added.
- Contact form: keep it simple. Name, email, phone (optional), subject (optional), message. Don't ask for too much.
- The "Book a Consultation" CTAs on these pages link to the same consultation request modal used in the configurator (Build 18).
