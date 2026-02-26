# Build 37 — SEO, Sitemap, Structured Data

> **Type:** Full-stack
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 35–36 (public pages)
> **Context Files:** YOROS_UNIVERSAL_PROJECT_BRIEF.md §7 (SEO Standards)
> **Reuse from Blindly:** ✅ 90% — identical pattern

---

## Objective

Implement comprehensive SEO: dynamic metadata for all pages, XML sitemap, robots.txt, JSON-LD structured data, Open Graph tags, and performance optimization. This is a Yoros standard applied identically across all projects.

---

## Tasks

### 1. Dynamic Metadata

**Root layout metadata:**
```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: 'The Deck Lab | Custom Decking Solutions', template: '%s | The Deck Lab' },
  description: 'Design your dream deck, get an instant quote, and order premium materials or professional installation. South Africa.',
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: siteConfig.url,
    siteName: 'The Deck Lab',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}
```

**Per-page metadata (generateMetadata):**

| Page | Title | Description |
|------|-------|-------------|
| Homepage | "The Deck Lab \| Custom Decking Solutions" | "Design your dream deck..." |
| /products | "Decking Materials Shop \| The Deck Lab" | "Premium deck boards, fixings..." |
| /products/[cat] | "{Category Name} \| The Deck Lab" | From category.description |
| /products/[cat]/[slug] | "{Product Name} \| The Deck Lab" | From product.short_description |
| /kits | "Deck Kits & Bundles \| The Deck Lab" | "Save with pre-assembled..." |
| /configure | "Deck Configurator \| Design & Quote \| The Deck Lab" | "Configure your deck..." |
| /calculator | "Deck Materials Calculator \| The Deck Lab" | "Free tool — calculate boards..." |
| /about | "About Us \| The Deck Lab" | "Premium decking solutions..." |
| /contact | "Contact Us \| The Deck Lab" | "Get in touch..." |
| /faq | "FAQ \| The Deck Lab" | "Frequently asked questions..." |
| /gallery | "Gallery \| The Deck Lab" | "View our completed decks..." |

### 2. XML Sitemap

**`src/app/sitemap.ts`**

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = [
    { url: '/', changeFrequency: 'weekly', priority: 1.0 },
    { url: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/configure', changeFrequency: 'monthly', priority: 0.9 },
    { url: '/calculator', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/kits', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: '/contact', changeFrequency: 'yearly', priority: 0.5 },
    { url: '/faq', changeFrequency: 'monthly', priority: 0.6 },
    { url: '/gallery', changeFrequency: 'weekly', priority: 0.6 },
  ]

  // Dynamic: product categories
  const categories = await getActiveCategories()
  const categoryPages = categories.map(cat => ({
    url: `/products/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // Dynamic: individual products
  const products = await getActiveProducts()
  const productPages = products.map(p => ({
    url: `/products/${p.category_slug}/${p.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
    lastModified: p.updated_at,
  }))

  // Dynamic: kits
  const kits = await getActiveKits()
  const kitPages = kits.map(k => ({
    url: `/kits/${k.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...pages, ...categoryPages, ...productPages, ...kitPages]
}
```

### 3. robots.txt

**`src/app/robots.ts`**

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/checkout', '/order/', '/quote/'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
```

### 4. JSON-LD Structured Data

**Organization (on homepage):**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "The Deck Lab",
  "url": "https://thedecklab.co.za",
  "logo": "https://thedecklab.co.za/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+27-82-XXX-XXXX",
    "contactType": "customer service",
    "areaServed": "ZA"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Stellenbosch",
    "addressRegion": "Western Cape",
    "addressCountry": "ZA"
  }
}
```

**Product (on product detail pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SA Pine CCA 22×108mm Deck Board",
  "image": "...",
  "description": "...",
  "sku": "DL-PB-22108",
  "brand": { "@type": "Brand", "name": "The Deck Lab" },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "85.00",
    "highPrice": "169.00",
    "priceCurrency": "ZAR",
    "availability": "https://schema.org/InStock",
    "offerCount": 4
  }
}
```

**BreadcrumbList (on category and product pages):**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "..." },
    { "@type": "ListItem", "position": 2, "name": "Deck Boards", "item": "..." },
    { "@type": "ListItem", "position": 3, "name": "Treated Pine", "item": "..." }
  ]
}
```

**FAQPage (on FAQ page):**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What areas do you service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We offer installation services in the Western Cape..."
      }
    }
  ]
}
```

**LocalBusiness (on contact page):**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "The Deck Lab",
  "address": { ... },
  "telephone": "...",
  "openingHours": "Mo-Fr 08:00-17:00, Sa 08:00-13:00",
  "priceRange": "$$"
}
```

### 5. Open Graph Images

- Default: `/og.png` (1200×630, brand + tagline)
- Product pages: product primary image
- Category pages: category image or default
- Create a reusable `<JsonLd>` component for injecting structured data

### 6. Performance

- Images: use Next.js `<Image>` with lazy loading, proper sizing, WebP format
- Fonts: preload, display: swap
- Above-the-fold: no client components in initial viewport
- Lighthouse target: >90 on all metrics
- Compression: gzip/brotli on server

### 7. Analytics

If google_analytics_id is set in site_settings:
- Inject GA4 script in root layout
- Track page views automatically
- Track events: "configure_start", "add_to_cart", "begin_checkout", "purchase"

Google Search Console verification via site_settings.google_search_console meta tag.

---

## Acceptance Criteria

```
✅ Every page has unique, descriptive <title> and <meta description>
✅ XML sitemap includes all static pages + dynamic products/categories/kits
✅ robots.txt blocks admin and API routes
✅ JSON-LD Organization on homepage
✅ JSON-LD Product on product detail pages
✅ JSON-LD BreadcrumbList on category and product pages
✅ JSON-LD FAQPage on FAQ page
✅ JSON-LD LocalBusiness on contact page
✅ Open Graph tags on all pages with images
✅ Twitter card meta tags
✅ GA4 tracking fires on page views (if analytics ID configured)
✅ Lighthouse score >90 on all metrics
✅ Images use next/image with proper dimensions and lazy loading
✅ Fonts preloaded with display: swap
```

---

## Notes for Claude Code

- This is a direct copy of the Blindly SEO pattern. Same approach, different content.
- The `<JsonLd>` component should accept a typed object and render a `<script type="application/ld+json">` tag.
- For dynamic metadata: use Next.js `generateMetadata()` function in each page's page.tsx.
- Product structured data: use AggregateOffer if variants have different prices. Use Offer for single-price products.
- Don't hardcode any URLs — always use siteConfig.url as the base.
