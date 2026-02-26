# Build 01 — Project Scaffold

> **Type:** Setup
> **Estimated Time:** 45 min–1 hr
> **Dependencies:** None
> **Context Files:** YOROS_UNIVERSAL_PROJECT_BRIEF.md, YOROS_I18N_DARKMODE_STANDARD.md

---

## Objective

Bootstrap a Next.js 14+ project with Supabase integration, shadcn/ui components, dark mode, EN/AF i18n foundation, and folder structure ready for all subsequent builds. Brand identity is TBD — use placeholder tokens that will be swapped once the brand is designed.

---

## Tasks

### 1. Create Next.js Project

```bash
npx create-next-app@latest thedecklab --typescript --tailwind --app --src-dir --import-alias "@/*"
cd thedecklab
```

### 2. Install Dependencies

```bash
# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# UI
pnpm add class-variance-authority clsx tailwind-merge lucide-react sonner
pnpm dlx shadcn@latest init

# Dark mode
pnpm add next-themes

# Email
pnpm add resend @react-email/components

# PDF generation (for build plan + quotes)
pnpm add jspdf jspdf-autotable

# CSV/XLS import (for price imports)
pnpm add xlsx

# Utils
pnpm add nanoid zod
```

### 3. shadcn/ui Components

```bash
pnpm dlx shadcn@latest add button input card dialog table tabs select checkbox toast label textarea badge separator dropdown-menu sheet scroll-area skeleton switch tooltip progress avatar slider number-input toggle-group
```

### 4. Folder Structure

```
src/
  app/
    (public)/
      layout.tsx               Public layout (header + footer)
      page.tsx                 Homepage
      products/                Materials shop browse
      products/[slug]/         Product detail
      kits/                    Kit/bundle pages
      configure/               Deck configurator wizard
      designer/                Deck designer canvas
      calculator/              Standalone materials calculator
      cart/
      checkout/
      order/[id]/
      quote/[token]/
      about/
      contact/
      faq/
      gallery/
    (admin)/
      admin/
        layout.tsx
        page.tsx               Dashboard
        materials/             Material types management
        products/              Shop products CRUD
        kits/                  Kit/bundle builder
        configurator/          Configurator rates, extras, deck types
        pricing/               Markup config
        import/                Price import
        orders/
        quotes/
        leads/                 Consultations, samples, contact
        calculator/            Calculator constants
        settings/
      login/
        page.tsx
    api/
      deck/                    Configurator pricing API
      designer/                Board layout engine API
      shop/                    Shop product API
      calculator/              Materials calculator API
      orders/
      quotes/
      build-plan/              PDF generation
      webhooks/
    layout.tsx
    not-found.tsx
    error.tsx
  components/
    ui/                        shadcn/ui (auto-generated)
    layout/                    Header, Footer, Sidebar, ThemeToggle, LanguageSwitcher
    configurator/              Wizard step components
    designer/                  Canvas, drawing tools, board overlay
    shop/                      Product cards, filters, cart
    calculator/                Calculator UI components
    admin/
    shared/
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    i18n/
      server.ts                getLocale() server helper
    pricing/                   Configurator pricing engine
    designer/                  Board layout, cutoff optimizer
    calculator/                Materials calculator logic
    import/                    CSV/XLS import
    actions/                   Server Actions
    email/                     Resend + React Email
    utils.ts
  types/
    database.ts
    i18n.ts                    Locale, LocalizedString, t()
    index.ts
  hooks/
    use-locale.ts              Client-side locale hook
  config/
    site.ts
  locales/
    en.json                    English UI strings
    af.json                    Afrikaans UI strings
```

### 5. Supabase Client Setup

Copy from Blindly Build 01 — `client.ts`, `server.ts`, `middleware.ts`. Same pattern, same code.

### 6. Middleware

Same as Blindly — session refresh + admin route protection. Additionally, read the `locale` cookie and set it as a header for server components:

```typescript
// In middleware.ts — after session handling:
const locale = request.cookies.get('locale')?.value || 'en'
supabaseResponse.headers.set('x-locale', locale)
```

### 7. Tailwind Config — Placeholder Brand Tokens

Brand identity is TBD. Use neutral warm placeholders. Dark mode uses `class` strategy via `next-themes`.

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Placeholder — will be replaced after brand design
          light: '#FAF8F5',
          cream: '#F5F0EA',
          dark: '#2C2420',
          muted: '#7A7068',
          border: '#E0D8CF',
          accent: '#B85C3A',
          'accent-hover': '#A04E30',
          secondary: '#4A7C5C',
          highlight: '#D4A843',
        },
      },
      fontFamily: {
        display: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      maxWidth: {
        content: '1280px',
        configurator: '960px',
        designer: '1100px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 8. Font Setup (Placeholder)

Use Inter as placeholder body font, will swap after brand design:

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})
```

### 9. Dark Mode Setup

```typescript
// src/components/layout/theme-provider.tsx
'use client'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  )
}
```

Wrap root layout `<body>` in `<ThemeProvider>`. Create a `ThemeToggle` component (sun/moon icon) for the header.

Define CSS custom properties for light/dark:
```css
:root {
  --background: 250 248 245;
  --foreground: 44 36 32;
  --accent: 184 92 58;
}
.dark {
  --background: 30 26 24;
  --foreground: 250 248 245;
  --accent: 200 110 75;
}
```

### 10. i18n Setup (EN/AF)

Create the i18n type system:

```typescript
// src/types/i18n.ts
export type Locale = 'en' | 'af'

export interface LocalizedString {
  en: string
  af: string
}

export function t(localized: LocalizedString | string | null, locale: Locale = 'en'): string {
  if (!localized) return ''
  if (typeof localized === 'string') return localized
  return localized[locale] || localized.en || ''
}
```

Create locale files with common UI strings:

```json
// src/locales/en.json
{
  "common": {
    "addToCart": "Add to Cart",
    "getQuote": "Get a Quote",
    "viewProducts": "View Products",
    "learnMore": "Learn More",
    "contact": "Contact Us",
    "language": "Language",
    "home": "Home",
    "products": "Products",
    "calculator": "Calculator",
    "about": "About",
    "faq": "FAQ",
    "gallery": "Gallery",
    "cart": "Cart",
    "checkout": "Checkout",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "loading": "Loading...",
    "error": "Something went wrong",
    "empty": "Nothing here yet",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort by",
    "price": "Price",
    "qty": "Qty",
    "total": "Total",
    "subtotal": "Subtotal",
    "vat": "VAT (15%)",
    "delivery": "Delivery",
    "free": "Free",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock",
    "madeToOrder": "Made to Order"
  }
}
```

```json
// src/locales/af.json
{
  "common": {
    "addToCart": "Voeg by Mandjie",
    "getQuote": "Kry 'n Kwotasie",
    "viewProducts": "Bekyk Produkte",
    "learnMore": "Lees Meer",
    "contact": "Kontak Ons",
    "language": "Taal",
    "home": "Tuis",
    "products": "Produkte",
    "calculator": "Sakrekenaar",
    "about": "Oor Ons",
    "faq": "Vrae",
    "gallery": "Galery",
    "cart": "Mandjie",
    "checkout": "Betaal",
    "back": "Terug",
    "next": "Volgende",
    "submit": "Stuur",
    "cancel": "Kanselleer",
    "save": "Stoor",
    "loading": "Laai...",
    "error": "Iets het verkeerd geloop",
    "empty": "Nog niks hier nie",
    "search": "Soek",
    "filter": "Filter",
    "sort": "Sorteer volgens",
    "price": "Prys",
    "qty": "Hoeveelheid",
    "total": "Totaal",
    "subtotal": "Subtotaal",
    "vat": "BTW (15%)",
    "delivery": "Aflewering",
    "free": "Gratis",
    "inStock": "In Voorraad",
    "outOfStock": "Uit Voorraad",
    "madeToOrder": "Op Bestelling"
  }
}
```

Create server-side locale helper:

```typescript
// src/lib/i18n/server.ts
import { cookies } from 'next/headers'
import type { Locale } from '@/types/i18n'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get('locale')?.value as Locale) || 'en'
}
```

Create client-side locale hook:

```typescript
// src/hooks/use-locale.ts
'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/types/i18n'

export function useLocale(): Locale {
  const [locale, setLocale] = useState<Locale>('en')
  useEffect(() => {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('locale='))
    if (cookie) setLocale(cookie.split('=')[1] as Locale)
  }, [])
  return locale
}
```

Create `LanguageSwitcher` component:

```typescript
// src/components/layout/language-switcher.tsx
// Simple "EN | AF" toggle in header
// Sets 'locale' cookie with 1-year expiry
// Calls router.refresh() to re-render server components
```

### 11. Utility Functions

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return `R ${(cents / 100).toLocaleString('en-ZA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatPriceDecimal(cents: number): string {
  return `R ${(cents / 100).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatArea(m2: number): string {
  return `${m2.toFixed(1)} m²`
}

export function formatDimension(mm: number): string {
  if (mm >= 1000) return `${(mm / 1000).toFixed(1)}m`
  return `${mm}mm`
}
```

### 12. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Paystack
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Resend
RESEND_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 13. Site Config

```typescript
// src/config/site.ts
export const siteConfig = {
  name: 'The Deck Lab',
  description: 'Custom decking solutions — design your deck, get an instant quote, and order materials or installation online.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://thedecklab.co.za',
  ogImage: '/og.png',
  currency: 'ZAR',
  currencySymbol: 'R',
  locales: ['en', 'af'] as const,
  defaultLocale: 'en' as const,
  vat: 15,
  depositPercent: 50,
  serviceArea: 'Western Cape',
  shippingArea: 'South Africa',
} as const
```

### 14. Placeholder Pages

- `(public)/page.tsx` — "The Deck Lab — Coming Soon" with dark mode + language working
- `(admin)/admin/page.tsx` — "Admin Dashboard" placeholder
- `(admin)/login/page.tsx` — Email/password login form

---

## Acceptance Criteria

```
✅ `pnpm run build` passes with zero errors
✅ `pnpm run dev` starts without errors
✅ Placeholder fonts load correctly
✅ Brand colour tokens available as Tailwind classes (bg-brand-accent, etc.)
✅ Dark mode toggle works (system → light → dark, no flash on load)
✅ Light/dark CSS custom properties switch correctly
✅ i18n types created (Locale, LocalizedString, t() helper)
✅ Locale JSON files created (en.json, af.json with common strings)
✅ Language switcher toggles EN ↔ AF, sets cookie, refreshes page
✅ getLocale() server helper reads cookie correctly
✅ useLocale() client hook reads cookie correctly
✅ Supabase client initialises without errors
✅ Middleware redirects unauthenticated users from /admin to /login
✅ Middleware passes locale header to server components
✅ All folder paths exist as specified
✅ shadcn/ui components installed and importable
✅ .env.example documents all required environment variables
✅ formatPrice, formatArea, formatDimension utilities work
```

---

## Notes for Claude Code

- Use `pnpm` as package manager
- App Router, Server Components by default
- Brand identity is TBD — use the placeholder tokens, they'll be swapped in a brand build later
- Dark mode IS included (Yoros standard — all projects ship with dark mode toggle)
- i18n (EN/AF) IS included (Yoros standard — all public-facing content is bilingual)
- See YOROS_I18N_DARKMODE_STANDARD.md for the full i18n and dark mode pattern
- Admin panel is English only — no i18n needed for admin UI
- The folder structure is more extensive than Blindly due to the shop + designer + calculator
- `jspdf` and `jspdf-autotable` installed now but used in Build 31 (Build Plan PDF)
- `xlsx` installed now but used in Build 10 (Price Import)
