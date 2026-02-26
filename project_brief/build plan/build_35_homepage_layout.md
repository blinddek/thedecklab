# Build 35 — Public: Homepage & Layout

> **Type:** Frontend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 02 (foundation DB), Build 01 (scaffold)
> **Context Files:** PROJECT_BRIEF.md §2 (Brand), YOROS_I18N_DARKMODE_STANDARD.md
> **Reuse from Blindly:** ✅ 80% — same layout pattern, different content

---

## Objective

Build the public site layout (header, footer, navigation) and homepage. The homepage is the primary landing page — it sells both the configurator and the shop, establishing The Deck Lab as a premium decking destination.

Brand identity is TBD — use placeholder tokens. The layout structure and content will be final; only colours, fonts, and images swap when the brand is designed.

---

## Tasks

### 1. Public Layout

**`src/app/(public)/layout.tsx`**

**Header:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [Logo]  Products  Calculator  Configure  Gallery  About  Contact  │
│                                               [EN|AF] [🌙] [🛒 3]│
└────────────────────────────────────────────────────────────────────┘
```

- Logo: placeholder (text "The Deck Lab" until brand designed)
- Navigation: from navigation_items table (admin-configurable)
- Language toggle: EN | AF (sets cookie, refreshes)
- Dark mode toggle: sun/moon icon
- Cart icon: with item count badge (from cart context)
- Mobile: hamburger → sheet menu with all nav + cart + language + dark mode
- Sticky on scroll with background blur

**Footer:**
```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  The Deck Lab                    Quick Links        Contact        │
│  Custom decking solutions        Products            082 XXX XXXX │
│  for the Western Cape            Calculator           info@...    │
│  and beyond.                     Configure            Stellenbosch │
│                                  Gallery                           │
│                                  About                             │
│  [FB] [IG] [TT]                 FAQ                               │
│                                                                    │
│  © 2026 The Deck Lab | Privacy Policy | Terms & Conditions        │
│                                                                    │
│  Powered by Yoros                                                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

- Contact info from site_settings
- Social links from site_settings
- Navigation links from navigation_items or hardcoded
- "Powered by Yoros" with link

### 2. Homepage

**`src/app/(public)/page.tsx`**

Sections (top to bottom):

**Hero Section:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  [Background: deck lifestyle image or video]                     │
│                                                                  │
│         Design Your Dream Deck                                   │
│         From concept to completion — instant quotes,             │
│         premium materials, professional installation.            │
│                                                                  │
│         [Configure Your Deck →]     [Browse Materials]           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- Full-width hero with background image (placeholder)
- Headline + subtext (from site_settings or hardcoded)
- Two CTAs: Configure (primary) + Shop (secondary)
- Localized text

**How It Works:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  How It Works                                                    │
│                                                                  │
│  1. Choose          2. Design          3. Quote          4. Build│
│  Select your        Draw your deck     Get an instant    We      │
│  material and       shape or enter     price with full   install │
│  deck type          dimensions         breakdown         it      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

4-step visual with icons/illustrations. Links to /configure.

**Materials Showcase:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Premium Decking Materials                                       │
│                                                                  │
│  [Pine card]   [Balau card]   [Garapa card]   [Composite card]  │
│                                                                  │
│  Each card: swatch + name + key stat + "From R X/m²"            │
│  Click → /configure (pre-selects material)                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Fetches material_types with starting m² rates.

**Calculator Promo:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Free Materials Calculator                                       │
│                                                                  │
│  Know your deck size? Find out exactly how many boards,          │
│  joists, and screws you need — in seconds.                      │
│                                                                  │
│  [Try the Calculator →]                                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Featured Products:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Shop Materials                                                  │
│                                                                  │
│  [Product card] [Product card] [Product card] [Product card]    │
│                                                                  │
│  [View All Products →]                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Featured products (is_featured = true) or category cards.

**Social Proof / Gallery Preview:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Our Work                                                        │
│                                                                  │
│  [Gallery image] [Gallery image] [Gallery image] [Gallery image]│
│                                                                  │
│  [View Full Gallery →]                                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

Gallery images from media table tagged as gallery. Or placeholders.

**CTA Banner:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Ready to build your deck?                                       │
│                                                                  │
│  [Get an Instant Quote →]     [Book a Free Consultation]        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3. Localization

All homepage text from locale files:

```json
"home": {
  "hero": {
    "title": "Design Your Dream Deck",
    "subtitle": "From concept to completion — instant quotes, premium materials, professional installation.",
    "ctaConfigure": "Configure Your Deck",
    "ctaShop": "Browse Materials"
  },
  "howItWorks": {
    "title": "How It Works",
    "step1": { "title": "Choose", "desc": "Select your material and deck type" },
    "step2": { "title": "Design", "desc": "Draw your deck shape or enter dimensions" },
    "step3": { "title": "Quote", "desc": "Get an instant price with full breakdown" },
    "step4": { "title": "Build", "desc": "We install it — or supply materials for DIY" }
  },
  "materials": { "title": "Premium Decking Materials", "fromPrice": "From" },
  "calculator": {
    "title": "Free Materials Calculator",
    "subtitle": "Know your deck size? Find out exactly how many boards, joists, and screws you need.",
    "cta": "Try the Calculator"
  },
  "shop": { "title": "Shop Materials", "viewAll": "View All Products" },
  "gallery": { "title": "Our Work", "viewAll": "View Full Gallery" },
  "cta": {
    "title": "Ready to build your deck?",
    "configure": "Get an Instant Quote",
    "consult": "Book a Free Consultation"
  }
}
```

---

## Acceptance Criteria

```
✅ Public layout: header with nav, language toggle, dark mode, cart icon
✅ Header sticky on scroll
✅ Mobile: hamburger menu with all nav items
✅ Footer with contact info, links, social icons, Yoros credit
✅ Homepage hero with two CTAs
✅ "How It Works" 4-step section
✅ Materials showcase fetches material_types with starting prices
✅ Calculator promo section links to /calculator
✅ Featured products section shows is_featured products
✅ Gallery preview shows images
✅ CTA banner at bottom
✅ All sections localized (EN/AF)
✅ Dark mode: all sections render correctly
✅ Mobile: all sections responsive
✅ Navigation items configurable from admin (site_settings)
✅ Footer contact info from site_settings
```

---

## Notes for Claude Code

- The homepage is heavy on content sections. Use Server Components for data fetching, keep it fast.
- Placeholder images: use solid colour blocks or simple SVG illustrations until real photography is available.
- The "How It Works" section is the key conversion element — it demystifies the process for first-time visitors.
- Material cards on the homepage should link to /configure with the material pre-selected in the URL query params: `/configure?material=balau`.
- Keep the homepage lean on JavaScript. Most sections are static content with fetched data — no interactivity needed except the cart icon and nav.
