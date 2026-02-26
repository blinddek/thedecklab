# YOROS Standard: i18n & Dark Mode

> **Applies to:** Every Yoros project (Blindly, The Deck Lab, future projects)
> **Date established:** 19 February 2026

---

## 1. Multi-Language (EN/AF)

### Approach
- **Cookie/toggle** — single URL structure, language switcher in header
- No URL prefixes (/en/, /af/), no subdomains
- Cookie: `locale` = `'en'` | `'af'` (default: `'en'`)
- SSR reads cookie, renders correct language server-side

### LocalizedString Type

```typescript
// src/types/i18n.ts
export type Locale = 'en' | 'af'

export interface LocalizedString {
  en: string
  af: string
}

// Helper: extract current locale's value
export function t(localized: LocalizedString | string | null, locale: Locale = 'en'): string {
  if (!localized) return ''
  if (typeof localized === 'string') return localized  // fallback for plain text
  return localized[locale] || localized.en || ''       // fallback to English
}
```

### Which Fields Are Localized

**Rule:** Public-facing content fields become `JSONB` (LocalizedString). Technical/admin fields stay `TEXT`.

| Localized (JSONB) | NOT Localized (TEXT) |
|-------------------|---------------------|
| name | slug |
| description | sku |
| short_description | extra_key |
| label | rate_type |
| features (display text) | hex_colour |
| swatch/image alt text | pricing_model |
| step title/intro text | status values |
| button labels | order_number |
| tooltip/explainer text | email addresses |
| unit_label on extras | all _cents fields |

### Database Convention

Localized fields use JSONB with a `_i18n` suffix convention in comments, but the column type is simply `JSONB`:

```sql
-- Localized field
name JSONB NOT NULL,           -- {"en": "Treated Pine", "af": "Behandelde Den"}
description JSONB,             -- {"en": "...", "af": "..."}

-- NOT localized
slug TEXT UNIQUE NOT NULL,     -- 'treated-pine' (always English for URLs)
sku TEXT,                      -- 'DL-PB-4800' (technical identifier)
```

### Admin Panel
- Admin panel is **English only** — no translation needed for admin UI
- Admin CRUD forms show two input fields for localized content: "English" + "Afrikaans"
- If Afrikaans field is left empty, it falls back to English on the public site

### Static UI Strings
- Stored in JSON files: `src/locales/en.json` + `src/locales/af.json`
- Covers: button labels, form placeholders, error messages, nav labels, footer text
- NOT in the database — these are developer-managed strings

### Language Switcher Component
- Simple toggle in header: "EN | AF"
- Sets cookie + triggers soft refresh (revalidatePath or router.refresh)
- Shows current language highlighted

### Middleware
```typescript
// In middleware.ts — read locale cookie
const locale = request.cookies.get('locale')?.value || 'en'
// Pass to headers for server components to read
const response = NextResponse.next()
response.headers.set('x-locale', locale)
```

### Server Components
```typescript
import { cookies } from 'next/headers'
import { t, type Locale } from '@/types/i18n'

async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return (cookieStore.get('locale')?.value as Locale) || 'en'
}

// Usage in a server component:
const locale = await getLocale()
const material = await getMaterial('treated-pine')
const name = t(material.name, locale)  // "Treated Pine" or "Behandelde Den"
```

---

## 2. Dark Mode

### Approach
- `next-themes` with `class` strategy
- System preference detection on first visit
- User toggle persists to localStorage
- Both public site and admin panel support dark mode

### Tailwind Config
```typescript
darkMode: "class",
```

### Theme Provider
Wrap app in `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` from `next-themes`.

### Colour Strategy
Each project defines light and dark variants of brand colours:

```css
:root {
  --background: 250 248 245;     /* warm off-white */
  --foreground: 44 36 32;        /* warm dark */
  --accent: 184 92 58;           /* brand accent */
  /* ... */
}

.dark {
  --background: 30 26 24;        /* warm dark background */
  --foreground: 250 248 245;     /* warm light text */
  --accent: 200 110 75;          /* slightly lighter accent for dark mode */
  /* ... */
}
```

### Toggle Component
- Sun/moon icon in header
- Cycles: system → light → dark
- Works on both public and admin

---

## 3. Impact on Database Schema

The following field changes apply to ALL Yoros projects. Fields marked with `→ JSONB` change from `TEXT` to `JSONB` to hold `{en, af}`.

### Migration 002 — Materials & Products

```
material_types:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

product_categories:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

products:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB
  short_description TEXT → short_description JSONB
  features JSONB stays JSONB (but inner strings become localized)

product_variants:
  variant_label TEXT → variant_label JSONB NOT NULL

kits:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB
  short_description TEXT → short_description JSONB
```

### Migration 003 — Configurator Rates

```
deck_types:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

board_directions:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

board_profiles:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

finish_options:
  name TEXT → name JSONB NOT NULL

configurator_extras:
  name TEXT → name JSONB NOT NULL
  description TEXT → description JSONB

extras_pricing:
  variant_label TEXT → variant_label JSONB
  unit_label TEXT → unit_label JSONB
```

### Migration 004 — Orders

No changes — order data stores the resolved language string at time of purchase (snapshot, not a reference).

### Migration 005 — Quotes & Leads

No changes — lead data stores plain text as submitted by the customer.

### NOT Changed (stays TEXT)

All of these stay `TEXT` — they're technical identifiers, not display content:
- All `slug` fields
- All `sku` fields
- All `extra_key` fields
- All `rate_type` fields
- All `status` CHECK fields
- All `pricing_model` fields
- All `_url` fields
- All `hex_colour` fields
- All `_cents` fields
- `order_number`
- `quote_token`
