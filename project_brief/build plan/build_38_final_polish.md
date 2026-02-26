# Build 38 — Final Polish, Performance Audit, Launch Prep

> **Type:** QA
> **Estimated Time:** 2–3 hrs
> **Dependencies:** All previous builds
> **Context Files:** YOROS_UNIVERSAL_PROJECT_BRIEF.md §7 (Launch Standards)
> **Reuse from Blindly:** ✅ 100% — same checklist

---

## Objective

Final sweep across the entire site: fix visual bugs, test all flows end-to-end, optimize performance, verify SEO, confirm email delivery, check mobile responsiveness, and prepare for production deployment.

---

## Tasks

### 1. Visual & UX Audit

**Every public page:**
- [ ] Desktop: Chrome, Firefox, Safari
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] Dark mode: every page and component renders correctly
- [ ] Light mode: same check
- [ ] Language toggle: EN → AF → EN on every page, no broken layouts
- [ ] Empty states: no data → friendly messages (not blank pages or errors)
- [ ] Loading states: skeletons or spinners on all data-fetching components
- [ ] Error states: API failures → friendly error messages
- [ ] 404 page: styled, links back to home

**Admin panel:**
- [ ] All CRUD operations: create, read, update, delete on every entity
- [ ] Admin responsive: usable on tablet (desktop-optimized is fine)
- [ ] Dark mode in admin
- [ ] Session expiry → redirect to login with toast

### 2. Critical Flow Testing

**Configurator flow (end-to-end):**
1. [ ] Select deck type → material → quick dimensions → direction → finish → extras → installation → review
2. [ ] Live quote updates correctly at every step
3. [ ] Save quote → receive email → click link → resume quote
4. [ ] Add to cart → checkout → Paystack payment (test mode)
5. [ ] Order confirmation page displays correctly
6. [ ] Admin sees new order in pipeline
7. [ ] Order status changes trigger customer emails

**Designer flow (if implemented):**
1. [ ] Draw rectangle → see area calculation
2. [ ] Draw L-shape → boards split correctly
3. [ ] Board layout renders on canvas
4. [ ] Offcut optimization shows savings
5. [ ] Build plan PDF generates with all 7 pages

**Shop flow (end-to-end):**
1. [ ] Browse categories → filter → sort → paginate
2. [ ] Product detail → select variant → set quantity → add to cart
3. [ ] Kit detail → add kit to cart
4. [ ] Cart → update quantities → remove items
5. [ ] Checkout → Paystack → confirmation
6. [ ] Stock decremented after payment

**Mixed cart:**
1. [ ] Configure a deck + add shop items → single checkout
2. [ ] Installation order: deposit shown correctly
3. [ ] Supply order: full payment shown

**Calculator flow:**
1. [ ] Enter dimensions → calculate → correct board counts
2. [ ] "Add to cart" maps to correct products
3. [ ] "Configure full deck" pre-fills configurator
4. [ ] Material comparison shows all 4 materials

### 3. Email Verification

- [ ] Order confirmation email sends and renders correctly
- [ ] Quote save email with resume link
- [ ] Quote follow-up emails (24h, 72h, 7d) — test trigger manually
- [ ] Contact form admin notification
- [ ] Installation scheduled notification
- [ ] Balance invoice email
- [ ] All emails: mobile-friendly rendering (check Gmail, Outlook)

### 4. Payment Verification

- [ ] Paystack test mode: successful payment → order created
- [ ] Paystack test mode: failed payment → error shown + retry option
- [ ] Webhook endpoint receives and processes events
- [ ] Webhook signature verification works
- [ ] Deposit flow: correct amount charged, order shows "deposit_paid"
- [ ] Full payment flow: correct amount, order shows "paid"

### 5. Security Audit

- [ ] RLS policies active on all tables (test with anon key)
- [ ] Admin routes protected (non-admin → redirect)
- [ ] API routes exclude cost_price_cents, supplier_cost_cents, markup data from public responses
- [ ] Paystack secret key not exposed client-side
- [ ] No sensitive data in URL parameters
- [ ] CORS configured correctly
- [ ] Rate limiting on form submissions (contact, quote save, calculator)

### 6. Performance Audit

Run Lighthouse on key pages:

| Page | Target | Check |
|------|--------|-------|
| Homepage | >90 all metrics | [ ] |
| /products | >90 | [ ] |
| /products/[cat]/[slug] | >85 | [ ] |
| /configure | >80 (canvas is heavy) | [ ] |
| /calculator | >90 | [ ] |
| /admin (auth'd) | >80 | [ ] |

**Optimization:**
- [ ] Images: all using next/image with proper sizing + WebP
- [ ] Fonts: preloaded, display: swap
- [ ] Bundle size: check for unnecessary large dependencies
- [ ] API response times: <500ms for all public routes
- [ ] Database queries: no N+1 queries (check with Supabase logs)
- [ ] Static pages: ISR or static generation where possible

### 7. SEO Verification

- [ ] Every page has unique <title> and <meta description>
- [ ] XML sitemap accessible at /sitemap.xml — includes all products/categories
- [ ] robots.txt blocks /admin/ and /api/
- [ ] JSON-LD structured data on: homepage, products, FAQ, contact
- [ ] Open Graph tags with images on all pages
- [ ] Canonical URLs on paginated pages
- [ ] No broken links (run crawler check)
- [ ] Google Search Console verification meta tag configured

### 8. Content Review

- [ ] All placeholder text identified and flagged for client
- [ ] Placeholder images identified — client needs to provide real deck photos
- [ ] FAQ answers reviewed for accuracy
- [ ] Pricing: seed data clearly marked as placeholder
- [ ] Legal pages: privacy policy and terms flagged for legal review
- [ ] Contact info: correct email, phone, address

### 9. Admin Data Setup

Prepare for client handover:
- [ ] Admin user created for Nortier
- [ ] Site settings populated with real contact info
- [ ] Navigation items configured
- [ ] Seed data loaded (products, rates, materials)
- [ ] Media library: placeholder images uploaded
- [ ] Export current seed data as backup

### 10. Deployment Prep

- [ ] Environment variables documented
- [ ] Supabase project configured (production)
- [ ] Paystack live keys ready (client provides)
- [ ] Domain configured: thedecklab.co.za
- [ ] SSL certificate active
- [ ] Email domain configured (SPF, DKIM, DMARC for deliverability)
- [ ] Vercel or hosting configured
- [ ] Build succeeds in production mode
- [ ] Preview deployment tested end-to-end

### 11. Client Handover Document

Create a handover checklist for Nortier:
- Admin login credentials
- How to manage products, rates, and orders
- How to import new prices
- How to manage leads and consultations
- What needs to be customized (placeholder content, images, legal)
- Support contact

---

## Acceptance Criteria

```
✅ All critical flows tested end-to-end (configurator, shop, mixed cart)
✅ All emails send and render correctly
✅ Paystack test mode payments work both directions
✅ No public API leaks supplier costs or markup data
✅ Lighthouse >85 on all public pages
✅ SEO: sitemap, robots, structured data, meta tags
✅ Dark mode works across all pages
✅ Language toggle works across all pages
✅ Mobile responsive across all pages
✅ Empty/loading/error states handled gracefully
✅ Admin CRUD fully functional
✅ Placeholder content clearly flagged
✅ Deployment environment ready
✅ Client handover document prepared
```

---

## Notes for Claude Code

- This build is a checklist, not a feature build. Work through it systematically.
- The most common issues at this stage: dark mode colours not applied to some components, mobile layouts breaking on specific viewport widths, API routes accidentally exposing admin data, and email templates looking wrong in Gmail.
- Don't try to fix everything — prioritize: (1) broken functionality, (2) data leaks, (3) visual issues, (4) nice-to-haves.
- The client handover document is important — Nortier needs to be self-sufficient with product/pricing management once we hand over.
